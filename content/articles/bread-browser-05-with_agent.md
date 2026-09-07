---
title: "第 5 章 · 接入 Bread Agent（终章）"
slug: "bread-browser-05-with_agent"
excerpt: "让模型操作网页。接入 Bread Agent（终章），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 60
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 5
seriesOrder: 27
difficulty: 3
codeLines: 520
---
## 1. 故事：四课合一

到目前为止，Bread 系列的进度：

| 课 | 你做出的 | 形态 |
|---|---|---|
| Bread Agent | 通用 agent 内核 | REPL chatbot，工具是 read_file / shell |
| Bread MCP | 协议化的工具机制 | 工具能跨进程 / 跨语言 |
| Bread RAG | 知识库检索能力 | search_knowledge_base 工具 |
| **Bread Browser** | **浏览器操作能力** | **open_url / click / extract_text 工具** |

ch00-ch04 的 BrowserAgent 是个**专用**的循环——它"只懂浏览器"。

**但 Bread 系列的统一心智模型**是：

> **Agent 内核不变，工具集换。**

所以最后一章我们把 BrowserAgent 解构成：

- **Agent 类**：跟 Bread Agent ch05 的 Agent 类**完全同构**
- **工具集**：浏览器工具 + 一个普通工具（`get_current_time`）

LLM 自己决定：

- 用户闲聊 → 不调任何工具
- 用户问时间 → 调 `get_current_time`
- 用户问网页内容 → 调浏览器工具

**这就是 2026 年企业级 AI 助手的最小可用样态**——一个 agent，工具池里混着浏览器 / 时间 / 内部 API（MCP） / 知识库（RAG）。

---

## 2. 跑起来

```
cd ch05_with_agent
python main.py
```

进入 REPL。试这 3 类输入：

### 测试 1：闲聊（不该调浏览器）

```
你 > 你好

AI > 你好！👋 很高兴见到你！我是你的智能助手...
```

注意：**没有 `[step X]` 打印**——没调任何工具。直接 chat completions 答出来。

### 测试 2：知识工具（调 get_current_time）

```
你 > 现在几点
  [step 0] get_current_time()

AI > 现在是 2026年5月19日 上午 11:51 🕐
```

LLM 调了 `get_current_time`，**不调浏览器** —— 它知道时间问题不需要开网页。

### 测试 3：网页任务（调浏览器工具）

```
你 > 打开 quotes.toscrape.com，告诉我首页第一条引言是谁说的
  [step 0] open_url(url='http://quotes.toscrape.com')
  [step 1] extract_text(selector='.quote')

AI > 首页第一条引言是 Albert Einstein（阿尔伯特·爱因斯坦）说的。
     引言内容是："The world as we have created it..."
```

LLM 自己组合 `open_url` + `extract_text` —— 2 步完成任务。

---

## 3. 逐行精讲

### Agent 类 —— 跟 Bread Agent ch05 几乎一比一

```python
class Agent:
    MAX_STEPS = 25

    def __init__(self, client, model, toolbox):
        self.client = client
        self.model = model
        self.toolbox = toolbox
        self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(self, user_input):
        self.messages.append({"role": "user", "content": user_input})
        for step in range(self.MAX_STEPS):
            resp = self.client.chat.completions.create(
                model=self.model, messages=self.messages, tools=TOOLS_SCHEMA,
            )
            msg = resp.choices[0].message
            self.messages.append(msg)
            if not msg.tool_calls:
                return msg.content or ""
            for call in msg.tool_calls:
                ...
                result = self.toolbox.execute(name, args)
                self.messages.append({
                    "role": "tool", "tool_call_id": call.id, "content": str(result),
                })
```

**对比 Bread Agent ch05 的 agent.py** —— 你会发现：

- 字段名：完全相同
- 循环结构：完全相同
- 错误处理：完全相同

唯一区别：

- Bread Agent 用 `TOOLS_IMPL[name](**args)` 调工具
- 这里用 `self.toolbox.execute(name, args)` ——因为浏览器工具需要 page 句柄

**所以学过 Bread Agent 的同学，看 ch05 应该秒懂。**

### `BrowserToolBox` —— 工具实现的统一封装

```python
class BrowserToolBox:
    def __init__(self, page):
        self.page = page
    
    def execute(self, name, args):
        if name == "open_url":   self.page.goto(args["url"])
        if name == "click":      self.page.locator(...)
        if name == "extract_text": ...
        if name == "get_current_time": return datetime.now().strftime(...)
```

注意最后一个 —— **`get_current_time` 不需要 page**，但放在同一个 toolbox 里。

为什么不分两个 toolbox？因为**Agent 不该关心工具来自哪**。它只看 schema、调 `execute(name, args)`。这就是"工具的多态"。

如果你想加 Bread RAG 的 `search_knowledge_base`、Bread MCP 的工具，同一个套路：把它们的实现加进 `execute`，schema 加进 `TOOLS_SCHEMA`。**Agent 一行不用改。**

### `_with_snapshot` —— 浏览器工具的统一收尾

```python
def _with_snapshot(self, action_result: str) -> str:
    self.page.wait_for_load_state("domcontentloaded", timeout=5000)
    self.page.wait_for_timeout(400)
    snap = self.snapshot_text()
    return f"{action_result}\n\nCurrent page (URL: {self.page.url}):\n{snap}"
```

浏览器工具（除 extract_text 外）执行完都要返回新快照。这一个 helper 集中处理。

**注意 `get_current_time` 不调它** —— 它返回纯字符串。

这种"分类回填" pattern 是 toolbox 设计的常见技巧。

### system prompt 的"分诊"指令

```python
"For chit-chat or knowledge questions, DON'T open the browser — just answer."
"For tasks involving websites/data on the web, use the browser tools."
"Always call page_snapshot before clicking unless you JUST saw a fresh snapshot."
```

3 条核心指令：

1. **闲聊不调工具** —— 防止 LLM 滥用浏览器（每次问"今天天气"都打开网页查）
2. **网页任务调浏览器** —— 给一个明确触发条件
3. **clicking 前要 snapshot** —— 因为 index 是相对快照的

system prompt 写得清楚 = agent 行为可控。这是**整门课最该总结的一条**。

### REPL 模式 —— 浏览器会话跨多轮持续

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("about:blank")
    
    toolbox = BrowserToolBox(page)
    agent = Agent(client, model, toolbox)
    
    while True:
        user_input = input("你 > ")
        answer = agent.chat(user_input)
        print(f"\nAI > {answer}\n")
```

浏览器**只开一次**（在 `with` 入口）。REPL 多轮里所有任务共用一个 page。

这有两个好处：

- **状态保留**：第一轮登录、第二轮就是已登录状态
- **省时间**：每轮不用重启浏览器（启浏览器要 1-2 秒）

如果你在生产里想"每个任务独立环境"，就改成每次任务 `browser.new_context()` —— 不同 context 隔离 cookie / localStorage。

---

## 4. 卡住了怎么办

### ❌ Agent 闲聊也开浏览器

system prompt 的"For chit-chat ... DON'T open" 不够硬。再加："Only use browser tools when the user explicitly mentions a URL, website, or asks you to look something up online."

### ❌ Agent 第二轮还引用第一轮的 snapshot

记得 system prompt 里说了 "indices change after every navigation"。但 LLM 不总是听。
解决：让它**强制 call page_snapshot 之后才能 click**——把这条规则升级成"必须"。

或者：每个 click 之前的 tool result 里再附上"latest snapshot is at step N"作为提醒。

### ❌ Agent 调浏览器很慢

浏览器操作快（10-100ms），但每步都要等 LLM 响应（1-3s）。简单任务能 5 步内完成，复杂任务可能 10-20 步——总耗时 30 秒到 1 分钟。**这是 LLM-driven agent 的速度上限**。

加速思路：

- 用更小的模型（如 Haiku / GPT-4o-mini）
- 让一个 LLM call 输出多个 tool_calls（OpenAI 已支持，多数模型还不稳）

### ❌ REPL 第二轮报"已超 MAX_STEPS"

`Agent.messages` 在多轮里**持续累积**。如果第一轮跑了 15 步，第二轮就从 15 开始算。其实每轮应该 reset `step` 但保留 `messages` —— 改 `chat()` 把 `for step in range(MAX_STEPS)` 改成基于"本轮步数"。

或者更狠：每轮 reset 全部 messages（不保留对话历史）。代价：丢上下文。

### ❌ 浏览器卡住但 REPL 还能输入

某些 page 操作可能 deadlock（等不到 element）。`Ctrl+C` 中断本轮，不退出 REPL（已经处理）。

### ❌ 我想截图调试

加一个 tool：

```python
{"name": "screenshot", "description": "Take a full-page screenshot", "parameters": {...}}
```

在 `execute` 里 `self.page.screenshot(path=f"step_{N}.png")`。

---

## 5. 思考题

### 题 1：接 Bread RAG 进来

把 Bread RAG ch05 的 `search_knowledge_base` 工具加进本章的 toolbox。

现在 agent 拥有：浏览器 + RAG 知识库 + 时间。

试：

- "Bread 面包工坊的加盟政策" → 调 RAG
- "去 quotes.toscrape.com" → 调浏览器
- "刚才那个加盟政策的链接你能帮我打开吗" → 跨模态？

观察 LLM 怎么混合调用。

### 题 2：接 Bread MCP 进来

如果你已经做完 Bread MCP，把 MCP server 也接进来。

具体：在 `BrowserToolBox.__init__` 里启动一个 MCPClient，把 MCP 提供的工具也加到 TOOLS_SCHEMA。

> 这一题做完，你已经亲手搭出"完整版企业 AI 助手"——浏览器 + RAG + MCP + 时间在同一个 agent 里。这是知识星球付费课程的**毕业作品**。

### 题 3：加事件钩子

参考 Bread Agent ch06 的 hooks 思想，给本章的 agent 加：

- `before_browser_tool`：危险动作（如表单提交）人工 y/N 确认
- `after_browser_tool`：每次浏览器操作自动截图存 `screenshots/`
- `on_message`：把对话写入 JSONL session 文件

> 你会发现 Bread Agent 的 hooks 系统在浏览器场景下**直接复用**——这就是良好抽象的力量。

---

## 6. 写在 Bread 系列四课的最后

你完成了 **Bread 系列四课**：

| 课 | 学到 | 累计行数 |
|---|---|---:|
| Bread Agent | agent 内核、工具循环、钩子、持久化、子 agent | 540 |
| Bread MCP | JSON-RPC、协议化工具、跨进程集成 | 1020 |
| Bread RAG | 切块、向量化、hybrid 检索、Agentic RAG | 1500 |
| **Bread Browser** | **DOM 抽取、浏览器循环、Agentic browsing** | **2020** |

2020 行 Python。**你现在能从零搭一个具备完整能力矩阵的企业级 AI 助手**：

- 💬 多轮对话（Bread Agent）
- 🔌 任意 MCP 工具（Bread MCP）
- 📚 私有知识库（Bread RAG）
- 🌐 用浏览器操作真实网站（Bread Browser）

**这是 2026 年市面上所有"企业 AI 助手 / 智能业务代理 / AI Operator"产品的底层架构。**

### 下一步

1. **接你公司的真实业务** —— 让 agent 做真实工作
2. **多 Agent 协作** —— planner + executor + verifier 分工
3. **加 vision 兜底** —— DOM 抽不到的内容用 GPT-4V / Claude vision
4. **Computer Use** —— Anthropic 的桌面级 agent，跨整个 OS 操作
5. **开源你自己的 agent** —— 用 Bread 系列学到的，写一个 100 stars+ 的项目

---

**祝玩得开心。**

**让你的 AI 真正去做事——不只是回答问题。**

> —— Bread Browser 课程 · 知识星球

