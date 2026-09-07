---
title: "第 6 章 · 事件钩子系统"
slug: "bread-agent-06-hooks"
excerpt: "让模型开始动手。事件钩子系统，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 45
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Agent"
courseSlug: "agent"
courseOrder: 1
chapter: 6
seriesOrder: 7
difficulty: 3
codeLines: 410
---
## 1. 故事：抽象是从重复中长出来的

ch03 我们在 `run_shell` 函数里直接写了一段：

```python
print(f"[!] Agent 想执行命令: {command}")
if input("y/N? ") != "y":
    return "用户拒绝执行此命令。"
# 真正执行...
```

现在问题来了：**如果 `write_file` 也要询问怎么办？**

朴素做法：把那段 inline 代码再复制粘贴到 `write_file` 里。`run_shell` 一份，`write_file` 一份。下次有第三个危险工具？再粘第三份。这种代码会越攒越脏。

更好的做法：**抽象成"钩子（hook）"**——一个独立的"事件→回调"机制。

```
Agent 工作流程：
   用户输入 → on_user_msg → ... → before_tool → 真正执行 → after_tool → ... → on_assistant
                                       │                            │
                                  可以否决执行                  可以读结果/改结果
```

每个"埋点"叫一个**事件**。外部代码可以在事件上**注册回调**：

- 注册一个 `before_tool` 回调，做权限确认
- 再注册一个 `before_tool` 回调，做日志
- 再注册一个 `on_assistant` 回调，统计 token 用量

**Agent 代码一行都不用改**，新功能往钩子上挂就行。这就是 pi agent中 `beforeToolCall` / `afterToolCall` 设计的核心，也是几乎所有 Web 框架（Express、Django middleware）的设计思想。

---

## 2. 跑起来

```
cd ch06_hooks
python main.py
```

启动消息：

```
Bread Agent · v6（钩子化）
注：write_file 和 run_shell 是危险工具，调用前会询问。
```

注意：**这次 `write_file` 也被拦截了**——因为我们把它加进了"危险工具列表"，钩子统一处理。

试这一组：

```
你 > 把 hello 写到 a.txt
AI > 我来写入文件。
[切换到非流式模式获取工具调用...]
  [hook:log] 即将调用 write_file 参数={'path': 'a.txt', 'content': 'hello'}

[!] Agent 想调用 write_file({'path': 'a.txt', 'content': 'hello'})
[!] 允许执行吗？(y/N): N
  [blocked] 用户拒绝执行 write_file。
AI > 好的，已取消写入。如果你想换个文件名或路径，告诉我即可。
  [hook:log] 模型回答了 28 个字符
```

![image-20260606223001814](/tutorials/bread-ai-from-scratch/image-20260606223001814.png)

观察 3 件事：

1. `[hook:log]` —— **日志钩子**自动打印了工具调用
2. `[!]` —— **权限钩子**触发了 y/N 询问
3. 按 n 之后 AI 优雅改口——拒绝原因被回喂给了模型

---

## 3. 逐行精讲

### 钩子系统的全部代码（仅 30 行）

`hooks.py`：

```python
EVENT_BEFORE_TOOL = "before_tool"
EVENT_AFTER_TOOL = "after_tool"
EVENT_ON_ASSISTANT = "on_assistant"


class Hooks:
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = {}

    def register(self, event: str, handler: Callable):
        self._handlers.setdefault(event, []).append(handler)

    def emit(self, event: str, **payload) -> dict | None:
        for handler in self._handlers.get(event, []):
            ret = handler(**payload)
            if event == EVENT_BEFORE_TOOL and isinstance(ret, dict) and ret.get("block"):
                return ret
        return None
```

**就这么简单**。一个 dict 存"事件 → 回调列表"，`register` 往里塞，`emit` 挨个调。

唯一的特殊处理：如果是 `before_tool` 事件，且回调返回 `{"block": True}`，立即返回这个决议——这就是"否决工具执行"。

### 三个内置钩子（hooks.py 下半部分）

```python
def confirm_dangerous_tool(tool_name, args, **_):
    """权限确认钩子。"""
    DANGEROUS = {"run_shell", "write_file"}
    if tool_name not in DANGEROUS:
        return None
    print(f"\n[!] Agent 想调用 {tool_name}({args})")
    if input("[!] 允许执行吗？(y/N): ").strip().lower() != "y":
        return {"block": True, "reason": f"用户拒绝执行 {tool_name}。"}
    return None


def log_tool_calls(tool_name, args, **_):
    """日志钩子。"""
    print(f"  [hook:log] 即将调用 {tool_name} 参数={args}")


def log_assistant_messages(content, **_):
    """模型回答时打日志。"""
    print(f"  [hook:log] 模型回答了 {len(content)} 个字符")
```

每个钩子是个普通函数。`**_` 是个 Python 习惯——"我不关心其他参数，但允许 emit 传一堆"。

### Agent 怎么用钩子

`agent.py` 关键改动：

```python
class Agent:
    def __init__(self, hooks: Hooks | None = None):
        self.hooks = hooks or Hooks()  # 没传就用空的
        # ... 其他不变

    def _execute_tool(self, call):
        # ... 参数解析 ...

        # ★ 钩子的高光时刻
        decision = self.hooks.emit(EVENT_BEFORE_TOOL, tool_name=name, args=args)
        if decision and decision.get("block"):
            return decision.get("reason", "工具被拒绝")

        try:
            result = str(TOOLS_IMPL[name](**args))
        except Exception as e:
            result = f"工具执行报错: {type(e).__name__}: {e}"

        self.hooks.emit(EVENT_AFTER_TOOL, tool_name=name, args=args, result=result)
        return result
```

工具执行的核心被钩子前后包住：

```
emit("before_tool")
   ↓
  实际执行
   ↓
emit("after_tool")
```

如果 `before_tool` 返回 `{"block": True}`，跳过实际执行，把 `reason` 作为 tool result。

### `main.py` 装配钩子

```python
def main():
    hooks = Hooks()
    hooks.register(EVENT_BEFORE_TOOL, confirm_dangerous_tool)
    hooks.register(EVENT_BEFORE_TOOL, log_tool_calls)
    hooks.register(EVENT_ON_ASSISTANT, log_assistant_messages)

    agent = Agent(hooks=hooks)
```

**关键观察**：注册了什么钩子，agent 就有什么扩展能力。换一组钩子，行为完全不同——而 `Agent` 类本身一行都没改。

### `tools.py` 的关键变化

```python
def run_shell(command: str) -> str:
    """★ 这里不再有 input() 询问。权限是 hook 的事，不是工具的事。"""
    try:
        proc = subprocess.run(command.split(), capture_output=True, ...)
        # ...
```

对比 ch03 的 `run_shell`——少了 inline 的 `input()` 那段。**职责分离**：工具只负责"做事"，权限归钩子管。

---

## 4. 卡住了怎么办

### ❌ 危险工具没被拦截

`main.py` 里漏了 `hooks.register(EVENT_BEFORE_TOOL, confirm_dangerous_tool)`。或者 `confirm_dangerous_tool` 里 DANGEROUS 集合写漏了工具名。

### ❌ `Agent.__init__() got an unexpected keyword argument 'hooks'`

你在用 ch05 的 `Agent` 类（不接受 hooks）。确认目录是 `ch06_hooks/`，import 没指错。

### ❌ 钩子注册顺序有影响吗？

有。`emit` 是按注册顺序调的。如果 `log_tool_calls` 注册在 `confirm_dangerous_tool` 前面，日志先打印；反之先弹窗。**这个顺序你自己决定**。

### ❌ 想让某个钩子访问 `agent.messages` 怎么办

把 agent 实例本身作为 emit 的 payload 传过去：

```python
self.hooks.emit("before_tool", tool_name=..., agent=self)
```

钩子里 `agent.messages` 就能读到。**思考题 1** 让你做这个。

---

## 5. 思考题

### 题 1：`after_tool` 钩子改结果

注册一个 `after_tool` 钩子，把 `read_file` 的返回值**截断到 500 字以内**（即使工具本身没截断）：

```python
def truncate_read_results(tool_name, args, result, **_):
    if tool_name == "read_file" and len(result) > 500:
        # 想办法把 result 改掉
        ...
```

这里有个坑：钩子能"读" result，但能直接"改"吗？默认实现下不能——你得改 `Hooks.emit` 让它支持"返回新值替换 result"。**这是 pi agent `afterToolCall` 的核心能力**——可以读，可以改，甚至可以强制终止 agent。

### 题 2：token 用量统计

在 `Agent._non_stream_one` 里 emit 一个新事件：

```python
def _non_stream_one(self):
    resp = self.client.chat.completions.create(...)
    self.hooks.emit("on_token_usage", usage=resp.usage)
    return resp.choices[0].message
```

然后写个钩子累计本次会话的 prompt_tokens + completion_tokens：

```python
total_tokens = 0
def accumulate_tokens(usage, **_):
    global total_tokens
    total_tokens += usage.total_tokens
    print(f"  [token] 累计已用 {total_tokens}")
```

体会"钩子机制让你不改 Agent 就能加新维度的可观测性"。

---

## 这一章你学会了什么

- ✅ 钩子 = 事件 → 回调列表的注册机制
- ✅ `before_tool` 能否决工具执行（返回 `{"block": True, "reason": ...}`）
- ✅ 抽象的诱因：**重复代码出现 2 次就该考虑抽**
- ✅ 钩子让 Agent 不知道也不关心扩展能力——**开闭原则**

**下一章 ch07**：把对话**存到硬盘**，下次启动继续聊。难点不在 IO，而在**何时保存才不会破坏 OpenAI 协议**。

