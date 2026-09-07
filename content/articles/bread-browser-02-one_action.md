---
title: "第 2 章 · One Action"
slug: "bread-browser-02-one_action"
excerpt: "让模型操作网页。One Action，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 2
seriesOrder: 24
difficulty: 2
codeLines: 220
---
## 1. 故事：让 LLM "看一眼网页，做一件事"

ch01 已经把网页变成 LLM 友好的纯文本：

```
[0] <a> Quotes to Scrape  → https://quotes.toscrape.com/
[1] <a> Login             → https://quotes.toscrape.com/login
...
```

现在把这堆文本 + 一句任务（"去登录"）扔给 LLM，**让它告诉我们点几号**。

LLM 通过 OpenAI tool_calls 机制回 `click(index=1)` —— 我们本地执行 → 浏览器跳到 /login。

**这跟 Bread Agent ch01 的 round-trip 同构**：
> 任务给 LLM → LLM 选工具 → 本地执行 → 结束。

下一章我们才把循环加上去。

---

## 2. 跑起来

```
cd ch02_one_action
python main.py
```

需要 `.env` 配好对话 LLM（同 Bread Agent，复制即可）。

### 预期输出

```
=== 当前页面快照 ===
[0] <a> Quotes to Scrape  → https://quotes.toscrape.com/
[1] <a> Login             → https://quotes.toscrape.com/login
[2] <a> (about)           → ...
...

=== 任务 ===
Click the 'Login' link to go to the login page.

=== LLM 选择 action ===
click({'index': 1})

=== 执行结果 ===
clicked element [1]

=== 执行后页面 (URL: https://quotes.toscrape.com/login) ===
现在抽到 7 个元素：

[0] <a> Quotes to Scrape    → ...
[1] <a> Login               → ...
[2] <input type="text" name="username">
[3] <input type="password" name="password">
[4] <input type="submit"> Login
...
```

3 个关键信号：

1. **LLM 选对了** —— 在 55 个元素里挑出 `[1] Login`
2. **action 真的执行了** —— URL 从 `/` 变成 `/login`
3. **新页面被抽出来了** —— 你看到 login form 的输入框

但**到这里就停了** —— 没有循环。下一章我们让它"继续：填用户名 / 填密码 / 提交"。

---

## 3. 逐行精讲

### `TOOLS_SCHEMA` —— agent 能调的 4 个工具

```python
TOOLS_SCHEMA = [
    {"type": "function", "function": {"name": "click", ...}},
    {"type": "function", "function": {"name": "type_text", ...}},
    {"type": "function", "function": {"name": "press_key", ...}},
    {"type": "function", "function": {"name": "done", ...}},
]
```

`click` / `type_text` / `press_key` 是真正的浏览器动作。`done` 是元动作 —— 让 LLM 说"任务结束了"。

**这 4 个工具够 80% 的浏览器任务用了**。ch04 会加 `scroll` / `extract_text` / `goto` 等扩展。

注意工具描述里**显式说明了 index 是从 snapshot 来的**：

```
"description": "Click an element by its [index] from the page snapshot."
```

LLM 看到这句话就知道：snapshot 里的 `[5]` 对应这里的 `index=5`。**描述写得清楚 = LLM 调对工具**——这是 prompt engineering 最 ROI 高的部分。

### `tool_choice="required"` —— 强制工具调用

```python
resp = client.chat.completions.create(
    ..., tools=TOOLS_SCHEMA, tool_choice="required",
)
```

不加这个参数，LLM 可能**只回文本**（"我建议你点 Login 按钮"），不调工具。我们解析不到结构化 action，循环就跑不下去。

`tool_choice="required"` 强制 LLM 必须调一个工具。**Bread Agent 没用这个**——因为那边 LLM 可能直接给最终答案（不需要工具）。但 ch02 这种 single-step 场景，强制调工具更稳。

ch03 加循环之后我们就**不强制**了 —— 因为最后一步 LLM 应该能"直接说话"。

### `execute_action` —— 把 LLM 输出翻译成 Playwright 调用

```python
def execute_action(page, name, args):
    if name == "click":
        page.locator(f'[data-bread-id="{args["index"]}"]').click()
```

注意这里 selector 用的是 **`[data-bread-id="N"]`** —— 这就是 ch01 我们埋的"暗记"。

LLM 说"点 [5]"，我们直接拿 `data-bread-id="5"` 的元素去点。**精准、稳定、跨 DOM 变化都不飘**。

### `page.locator().fill()` vs `.type()`

```python
locator.fill(args["text"])    # 替换全部内容
# vs
locator.type(args["text"])    # 模拟逐字符输入
```

`.fill()` 是**批量替换**，瞬时完成。`.type()` 是模拟键盘逐字输入，**每字符之间有延迟**——慢，但能触发某些只听 `oninput` 的 JS。

**默认用 `.fill()`**。只有遇到 React 受控组件的奇葩情况才换 `.type()`。

### system prompt 中的"游戏规则"

```python
SYSTEM_PROMPT = (
    "You are a browser-use agent. The user gives you a task and a numbered snapshot ..."
    "Indices in [N] refer to elements in the snapshot."
    "If the task is already complete, call `done` with the answer."
)
```

3 条核心规则：

1. **告诉 LLM 它的角色**（browser-use agent）
2. **告诉它 [N] 怎么用**（不然它可能用 CSS selector / XPath，那就不在我们工具范围内了）
3. **告诉它何时停**（不然它会无脑继续——下章关键）

---

## 4. 卡住了怎么办

### ❌ LLM 选错元素

通常是任务描述不够清楚。把 `task = "Click the Login link"` 改成 `"Click the link with text 'Login' at the top of the page"`。

或者 system prompt 加一句：`"Prefer elements with clear, matching text labels."`

### ❌ `page.locator('[data-bread-id="5"]').click()` 超时

可能页面在抽完快照后元素被重新渲染了（React 重渲染会清掉自定义属性）。两个对策：

1. 抽快照后**立即执行**，中间不留空（本课程已经这么做）
2. ch04 起会做 "re-snapshot then act" 保证一致性

### ❌ `tool_choice="required"` 报错

某些模型 / provider 不支持这个参数。换成 `tool_choice="auto"` 试试。如果 LLM 不调工具就回退到错误处理。

### ❌ LLM 调了 type_text 但没填 index

`required: ["index", "text"]` 应该能保证，但有些小模型会无视 schema。可以加个 `if "index" not in args: return error`。

### ❌ URL 没变但代码以为成功

`page.wait_for_load_state("domcontentloaded")` 可能太快返回（同步页面瞬间触发）。生产级 agent 会比对前后 snapshot 决定是否真的发生变化。本课程 ch03 起会让 LLM 自己处理这种 ambiguity。

---

## 5. 思考题

### 题 1：换任务

把 `task` 改成：

- `"Find the quote about humor"` —— LLM 应该 click [20]（humor 标签）
- `"Tell me what's on this page"` —— LLM 应该直接 `done`（不点东西）
- `"Login as user 'alice' with password '1234'"` —— LLM 怎么办？（它只能走一步，所以...？）

观察 LLM 在不同任务下的选择。**最后一个任务暴露了"只一步"的局限** —— 这正是 ch03 引入循环的理由。

### 题 2：加 `goto` 工具

让 agent 能跳到任意 URL（不靠点链接）：

```python
{
    "type": "function",
    "function": {
        "name": "goto",
        "description": "Navigate to a URL directly.",
        "parameters": {
            "type": "object",
            "properties": {"url": {"type": "string"}},
            "required": ["url"],
        },
    },
},
```

在 `execute_action` 里加：`page.goto(args["url"])`。

> 这一题让你思考：什么时候应该让 agent "直接跳 URL" vs "点链接"？后者更真实但前者更快。

### 题 3：让 LLM 输出"思考"

修改 click schema，加一个可选字段：

```python
"properties": {
    "index": {"type": "integer"},
    "reasoning": {"type": "string", "description": "Why this element?"},
},
```

让 LLM 在 click 之前说出**为什么选这个**。打印出来。

> 这是 ReAct 模式的雏形：把思考链作为工具参数的一部分让 LLM 暴露。可观测性 ↑。

---

## 下一章预告

ch03 加 **agent loop** —— 在 done 之前一直走：

```
while not done:
  snapshot = take_snapshot()
  action = ask_llm(task, snapshot, history)
  execute(action)
```

第一次能完成**多步任务**（如"登录"），代码量约 330 行。本课最重要的章节之一。

