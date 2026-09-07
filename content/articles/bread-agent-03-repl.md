---
title: "第 3 章 · 多轮对话 + 权限确认"
slug: "bread-agent-03-repl"
excerpt: "让模型开始动手。多轮对话 + 权限确认，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 35
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Agent"
courseSlug: "agent"
courseOrder: 1
chapter: 3
seriesOrder: 4
difficulty: 2
codeLines: 180
---
## 1. 故事：让 agent 能"陪你聊"

ch02 的 agent 只能处理**一句话的任务**——你说一个任务，它做完就退出了。下次想继续，你得从头跑整个 Python 脚本。

真实的 ChatGPT/Claude 都是**持续对话**：你说"列出当前目录"，它列了；你说"把第一个文件内容告诉我"——它知道"第一个文件"是谁。**它有上下文记忆**。

这一章我们让 agent 进化成 **REPL**（Read-Eval-Print Loop，读取-执行-打印 循环）：

```
> 你输入一句话
  AI 回应
> 你再输入一句话
  AI 基于之前的对话回应
> ...
```

同时引入一个非常**危险**的工具 `run_shell`——能执行任意 shell 命令。如果我们让 AI 想跑就跑，它一句 `rm -rf` 就能把你电脑搞坏。所以**每次执行 shell 前都要问用户 y/N**。这是 agent 的"安全护栏"，也叫 `beforeToolCall` hook（ch06 我们会把它抽成正式的钩子）。

---

## 2. 跑起来

```
cd ch03_repl
python main.py
```

启动后你会看到提示符：

```
Bread Agent · REPL 模式
输入消息开始对话；Ctrl+C 退出。

你 >
```

试这一组对话：

```
你 > 列出当前目录都有什么文件
AI > 当前目录下有：main.py 和 README.md 两个文件。

你 > 把第一个文件的前 3 行告诉我
AI > （先调 read_file，再回答）"main.py 的前 3 行是 ..."

你 > 用 shell 运行 echo hello
[!] Agent 想执行命令: echo hello
[!] 允许执行吗？(y/N): y
AI > 已执行，输出是 "hello"
```

![image-20260526173708095](/tutorials/bread-ai-from-scratch/image-20260526173708095.png)

关键观察：

- 第二句话"第一个文件"——AI 知道是 main.py，**因为它记得前一轮对话**
- 第三句话的 `[!] 允许执行吗？` 提示——**agent 在动手前问你了**
- 按 `Ctrl+C` 随时可以退出，不会崩溃

---

## 3. 逐行精讲

### 多轮对话的全部秘密——只有 1 行

```python
def main():
    messages = [{"role": "system", "content": "..."}]   # ★ 在 while 循环外定义

    while True:
        user_input = input("你 > ").strip()
        messages.append({"role": "user", "content": user_input})
        run_turn(messages)   # 这个函数原地往 messages 里 append assistant/tool 消息
        print(f"AI > {answer}\n")
```

**关键就在于 `messages = [...]` 在 `while True` 外面**。每轮新消息追加到同一个 list 里，模型自然就读到全部上下文。

ChatGPT 网页版后端给前端的，就是这样一个不断变长的 messages 数组。**没有任何魔法。**

### `run_turn(messages)` —— 把 ch02 的循环包成函数

跟 ch02 的 `run_agent()` 几乎一样，唯一区别：messages 从**外部传进来**（而不是函数内部新建）。这样每轮调 `run_turn()` 都在同一份 messages 上累积。

```python
def run_turn(messages: list) -> str:
    for step in range(MAX_STEPS):
        response = client.chat.completions.create(...)
        msg = response.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return msg.content or ""

        for call in msg.tool_calls:
            # ... 跟 ch02 一样
```

### 权限确认的雏形（inline 写法）

```python
def run_shell(command: str) -> str:
    print(f"\n[!] Agent 想执行命令: {command}")
    answer = input("[!] 允许执行吗？(y/N): ").strip().lower()
    if answer != "y":
        return "用户拒绝执行此命令。"
    # ... 真正执行 ...
```

注意 3 个要点：

1. **拒绝时返回字符串**，而不是 raise——这样错误回喂机制会把"用户拒绝"作为 tool 结果传给模型，模型会用中文告诉用户"被拒了"
2. `input()` 在打印过程中暂停程序——这是 Python 同步代码的天然好处，新手完全能理解
3. **这段 inline 代码 ch06 会被抽成钩子（hook）**。所有抽象都是从重复代码里长出来的，这里先用最朴素的写法

### 优雅退出

```python
while True:
    try:
        user_input = input("你 > ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\n再见！")
        break
```

`Ctrl+C` 会触发 `KeyboardInterrupt`；Windows 下 `Ctrl+Z + Enter` 触发 `EOFError`。两种都接住、打印告别、break 出去。

### shell 命令的安全调法

```python
proc = subprocess.run(
    command.split(),       # ← 字符串切成 list
    capture_output=True,
    text=True,
    timeout=30,
    encoding="utf-8",
    errors="replace",
)
```

为什么 `command.split()` 而不是 `shell=True`？因为 `shell=True` 容易被恶意输入做命令注入。教学版用最安全的方式：把命令字符串按空白拆成 list 再传给 subprocess。简单但够用。

---

## 4. 卡住了怎么办

### ❌ Ctrl+C 没有优雅退出，反而堆栈错误

可能你的 `try/except` 写在了错的层。看 `main.py` 的 `main()` 函数，确认 `try: user_input = input(...)` 这一段包裹住了。

### ❌ 第二轮 AI 完全忘了第一轮

99% 是 `messages` 在 while 循环**里面**定义了。挪到外面就好。

### ❌ shell 命令带管道（`|`、`>`）失败

因为我们用了 `shell=False`，管道、重定向、变量替换这些 shell 特性都不可用。**这是有意的安全设计**。学员想体验，可以试试不带管道的命令（`echo hello`、`ls`、`python --version`）。

### ❌ 按 y 之后命令还是没执行

注意 input 后要 `.strip().lower()`——大小写敏感和前后空格会让 `== "y"` 判断失败。

---

## 5. 思考题

### 题 1：识别 slash 命令

在 REPL 里加一个判断：如果用户输入以 `/` 开头，**不要**发给 LLM 而是本地处理。实现一个 `/clear`：清空 messages（只保留 system），相当于"开始新对话"。

```python
if user_input == "/clear":
    messages = [messages[0]]   # 只留 system
    print("已清空上下文。")
    continue
```

这是为 ch07 的 `/save /load` 铺路。

### 题 2：危险命令黑名单

在 `run_shell` 函数最前面加一段：如果命令包含 `rm`、`del`、`format`、`mkfs` 等危险关键字，**不问用户直接拒绝**：

```python
DANGEROUS_KEYWORDS = ["rm ", "del ", "format ", "mkfs", "shutdown"]
for kw in DANGEROUS_KEYWORDS:
    if kw in command.lower():
        return f"命令包含危险关键字 '{kw.strip()}'，拒绝执行。"
```

**理解：人工 y/N 确认和黑白名单是两层防御**，不冲突——重要操作要双重保险。

### 题 3：观察上下文膨胀

在 REPL 循环里每轮加一行：

```python
print(f"[debug] messages 当前 {len(messages)} 条")
```

连续聊 10 轮以上，看 messages 怎么增长。**理解**：messages 越长，API 调用越慢、越贵。这就是为什么生产 agent 要做"上下文压缩"（pi-main 有这个功能，叫 compaction）——我们的教学版没做。

---

## 这一章你学会了什么

- ✅ 多轮对话 = `messages` 在循环外定义，持续累积
- ✅ REPL 的标准结构：`while True: input(); process(); print()`
- ✅ 危险工具执行前要 y/N 确认（**安全护栏**）
- ✅ `Ctrl+C` / `KeyboardInterrupt` 优雅退出
- ✅ `subprocess.run` 的安全用法（`shell=False`）

**下一章 ch04**：让 AI 像 ChatGPT 一样**逐字打印**，不再傻等一大段后整段吐出。这是技术上最有挑战的一章。

