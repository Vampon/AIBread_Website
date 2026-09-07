---
title: "第 4 章 · Full Task"
slug: "bread-browser-04-full_task"
excerpt: "让模型操作网页。Full Task，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 50
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 4
seriesOrder: 26
difficulty: 3
codeLines: 430
---
## 1. 故事：从"做一步"到"完成任务"

ch03 我们让 agent 学会登录——但**登录不是有意义的任务**。真实场景是：

> "去 quotes.toscrape.com 把 humor 标签下所有引言抓下来，存成 JSON。"

要做的事：

1. 找到 humor 标签的链接
2. 点进去
3. 读出页面里**所有**引言（不止 1 条）
4. 读出**每条引言的作者**
5. 把数据组装成 JSON 返回

挑战：

- **引言不是 button 不是 a** ——它们是普通 `<span>`。ch03 的 click/type 工具读不到
- 需要 agent 自己拼装结构化数据

ch04 加 3 个工具来解决：

| 工具 | 用途 |
|---|---|
| `extract_text(selector)` | 读非交互区域的文字（如 quote 内容） |
| `goto(url)` | 直接跳 URL（省点击成本） |
| `scroll(direction)` | 翻屏（处理无限滚动列表） |

同时引入**历史截断机制**——messages 累积太长会爆 token。

---

## 2. 跑起来

```
cd ch04_full_task
python main.py
```

### 预期输出

```
=== 任务 ===
Go to quotes.toscrape.com and find the tag 'humor'. ...

=== Agent 开始 ===
  [step 0] click(index=46)                           ← 点 humor 标签
  [step 1] extract_text(selector='.quote .text')     ← 读所有引言文本
  [step 1] extract_text(selector='.quote .author')   ← 读所有作者
  [step 2] click(index=39)                           ← 翻到另一个 humor 入口
  [step 3] extract_text(selector='.quote .text')
  [step 3] extract_text(selector='.quote .author')
  [step 4] done(answer='[ ... 12 quotes ... ]')

=== Agent 最终回答 ===
[
  {"text": "The person...", "author": "Jane Austen"},
  {"text": "A day without sunshine...", "author": "Steve Martin"},
  ...
]

已存到 result.json (12 条记录)
```

打开 `result.json` —— 你刚才让一个 AI **从 0 完成了一个完整的网页数据抓取任务**。

---

## 3. 逐行精讲

### `extract_text` —— 读"非交互区域"

```python
if name == "extract_text":
    texts = self.page.locator(args["selector"]).all_inner_texts()
    return "\n---\n".join(t.strip() for t in texts if t.strip())
```

ch01-ch03 的 snapshot 只抽**可交互元素**——按钮 / 链接 / 输入框。

但网页上有用的内容**大部分不可交互**：

- 文章正文（`<p>` / `<div>`）
- 评论列表（`<span class="comment">`）
- 商品价格（`<span class="price">`）
- ...

**LLM 必须能读到这些**——`extract_text` 就是这道门。

它接受**CSS 选择器**作为参数，让 LLM 自己写。例如：
- `.quote .text` → 所有 quote 容器里的 text 元素
- `.author` → 所有 author 元素
- `h1` → 页面所有 H1

`all_inner_texts()` 返回**列表**——一个 selector 可能命中多个元素。我们把它们用 `---` 串起来。

### 为什么不抽不在 snapshot 里的元素也编号

理论上可以把"所有元素"都打 `data-bread-id` 编号。但：

- 一个页面可能有 200-2000 个 `<span>` / `<div>` —— LLM 看到会崩溃
- 大部分元素没必要交互
- selector 是 LLM 都会的"通用语"

折中：交互元素**编号**给 click 用；内容元素**靠 selector** 给 extract_text 用。

### `goto` —— 跳过点链接

```python
if name == "goto":
    self.page.goto(args["url"])
    return f"navigated to {args['url']}"
```

某些场景下 LLM **看到了目标 URL** 但要走 3-4 个点击才能到。让它直接 `goto(url)` 节省往返。

**但慎用**：

- 一些 SPA 应用直接 goto 会丢失状态
- 反爬严格的站点会盯着"是否模拟真实用户"
- 教学场景里"模拟真实点击"更有意思

system prompt 没有特别鼓励或抑制——LLM 自己取舍。

### `scroll` —— 翻屏

```python
if name == "scroll":
    delta = 800 if args["direction"] == "down" else -800
    self.page.mouse.wheel(0, delta)
```

无限滚动列表（如微博 / Twitter / 推荐 feed）必须 scroll。这一章 demo 没用到，留作思考题。

### `_truncate_old_snapshots` —— Token 控制

```python
SNAPSHOT_KEEP_LAST_N = 3

def _truncate_old_snapshots(self):
    tool_indices = [...]
    if len(tool_indices) <= 3: return
    to_truncate = tool_indices[:-3]
    for i in to_truncate:
        ...
        msg["content"] = head + "[snapshot omitted to save tokens]"
```

**问题**：每一步的 tool result 里塞了一份完整快照（50-100 行）。10 步累积 1000+ 行。20 步 messages 就爆了。

**解决**：只保留**最近 3 步**的完整快照。更早的折叠成 "[snapshot omitted]"。

LLM 仍能看到自己**做了什么**（action 留着）——只是看不到当时的页面长什么样。这对"任务推进"够用，且 token 用量稳定。

**这就是生产级 agent 的"上下文管理"思想**。Bread Agent ch07 提过 invariant；这里是另一种实践。

### `extract_text` 不刷新 snapshot

```python
include_snap = name not in ("extract_text",)
tool_content = self._build_tool_result(action_result, include_snapshot=include_snap)
```

`extract_text` 只读不改页面——刷新 snapshot 没用且浪费 token。
其他工具（click / type / goto）**会**改变页面 → 必须刷新。

这是一个小优化但**节省了 30% 的 token**。

### main.py 里的 JSON 抠取

```python
content = answer
if "```" in content:
    parts = content.split("```")
    block = parts[1] if len(parts) > 1 else content
    if block.startswith("json"):
        block = block[4:]
    content = block.strip()
data = json.loads(content)
```

LLM 倾向于把 JSON **包在 ` ```json` 代码块里**。我们手动剥皮。

生产代码会用更鲁棒的 JSON 提取（正则 / 容错 parser），本课程简化。

---

## 4. 卡住了怎么办

### ❌ Agent 漏了几条引言

`.quote .text` 这个 selector 没问题；可能是 LLM 在拼装时手抖。提示 LLM "verify count matches" 能稍微改善。生产级会让 agent 自己**再抽一次验证 count**。

### ❌ Agent 反复 extract_text

LLM 不放心——抽了一遍想再抽一遍。可以在 system prompt 加："Each extract_text is authoritative. Don't repeat it on the same page."

### ❌ Agent 跳出 humor 标签去看别的

我们 demo 输出里 LLM 点了第二个 humor 入口——其实是因为页面有两处 humor 链接（侧栏 + 引言下）。它好奇心强，**点了发现还是 humor**，抽到了重复条目。结果里 LLM 自己去重了（看起来）。

如果出问题，加 prompt："Once you're on the humor tag page, don't navigate away. Just extract."

### ❌ 中文站点 LLM 写不出对的 selector

LLM 不知道目标站点用了什么 class 名。改进方法：

- 让 LLM 先 `extract_text("body")` 抽一段，**根据格式倒推** selector
- 或在 task 里直接给出 selector hint："quotes are under `.quote .text`"

### ❌ result.json 没生成

LLM 的 done answer 不是有效 JSON。看终端打印的"Agent 最终回答"，肉眼检查 —— 通常是 LLM 多写了一句解释 / 用了单引号 / 漏了逗号。改 prompt 强制纯 JSON。

### ❌ Token 超限

`SNAPSHOT_KEEP_LAST_N = 3` 已经截断了。如果还超限，把它改成 2 或 1，或者**砍掉中间几步的 assistant message**。

---

## 5. 思考题

### 题 1：换更复杂的任务

把 `task` 改成：

- **"Get all quotes by Albert Einstein."** —— 他有多条，跨多个页面（首页 + 翻页）
- **"Find the most quoted author on the first 3 pages."** —— 需要统计 + 比较
- **"Search for 'love' tag. Tell me the top 3 quotes and their authors."** —— 选最佳

观察 agent 怎么应对**没有清晰 selector** 的情况。

### 题 2：加 wait_for_element 工具

某些站点点完按钮要等 AJAX 加载。让 agent 显式等待：

```python
{
    "name": "wait_for_element",
    "description": "Wait until a CSS selector appears.",
    "parameters": {
        "type": "object",
        "properties": {
            "selector": {"type": "string"},
            "timeout_ms": {"type": "integer", "default": 5000},
        },
    },
}
```

执行：`page.wait_for_selector(args["selector"], timeout=args.get("timeout_ms", 5000))`。

> 真实站点这一步太关键了——很多 React 应用首次渲染慢，没 wait 就 snapshot 抽到空。

### 题 3：把整个 agent 跑在 headless 模式 + 远程服务器

把 `headless=False` 改成 `True`，跑在你的云服务器 / Docker 容器里。

- 是否还能跑通？
- 截图 + 日志怎么 debug？
- 你能不能加一个 "每步保存截图到 screenshots/step_N.png" 的功能？

> 生产环境 99% 的 browser agent 都是 headless 跑。debug 完全靠日志和截图。

---

## 下一章预告

ch05 把这一切**塞进 Bread Agent**。

之前几章的 BrowserAgent 是个**独立**的循环——它有自己的工具集、自己的 messages、自己的 chat。

但**Bread 系列的统一心智模型**是："agent 内核不变，工具集换"。
所以 ch05 把 BrowserAgent 解构成**给 Bread Agent 用的工具**：

```python
# Bread Agent 启动
agent = Agent(client, model, system_prompt=...)
# 注入浏览器工具
agent.register_tool("open_url", ...)
agent.register_tool("click", ...)
agent.register_tool("type", ...)
agent.register_tool("extract", ...)

agent.chat("帮我抓 quotes.toscrape.com 的 humor 标签数据")
```

这就是**三课合体**的样态——你的 Bread Agent 现在既能调内部 API（MCP）、查私有知识库（RAG）、又能用浏览器（Browser）。**完整的 2026 年企业级 AI 助手最小可用样态**。

