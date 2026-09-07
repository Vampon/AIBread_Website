---
title: "第 5 章 · Multi-Agent + Bread Browser（终章）"
slug: "bread-multi-agent-05-with_browser"
excerpt: "让多个角色协作。Multi-Agent + Bread Browser（终章），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 60
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Multi-Agent"
courseSlug: "multi-agent"
courseOrder: 5
chapter: 5
seriesOrder: 33
difficulty: 4
codeLines: 500
---
## 1. 故事：OpenAI Deep Research / Perplexity Pro 是怎么做的

2024 年起最火的 AI agent 形态是 **"研究 agent"**：

- **OpenAI Deep Research**（2024 末发布）
- **Perplexity Pro Search**
- **You.com Research Mode**
- **Anthropic Claude with Computer Use**

它们的共性 —— **用户问一个研究性问题，它去网上搜十几个网页、读完后写成报告**。

底层架构惊人统一：

```
用户："研究一下 ..."
         ↓
  ┌───────────────┐
  │   Planner     │  拆成 5-10 个独立检索任务
  │ （强模型）     │
  └───────┬───────┘
          │ 子任务 1, 2, 3, ...
          ↓
  ┌──────────┬──────────┬──────────┐
  │ Worker 1 │ Worker 2 │ Worker N │  并行抓网页
  │ (browser)│          │          │
  └─────┬────┴────┬─────┴─────┬────┘
        │         │           │
        └─────────┴───────────┘
                  ↓
           ┌────────────┐
           │ Summarizer │  汇总成研究报告
           │  （强模型） │
           └────────────┘
```

这一章把 Bread 系列的 4 块拼成这套结构：

| Bread 课程 | 在这里的角色 |
|---|---|
| Bread Agent | Planner / Summarizer 的循环架构 |
| Bread Browser | BrowserWorker 的浏览器工具 |
| Bread Multi-Agent ch01 | Planner-Worker 拓扑 |
| Bread Multi-Agent ch04 | Pipeline 阶段划分 |

---

## 2. 跑起来

```
cd ch05_with_browser
python main.py
```

需要装 Playwright（之前几章可能没装）：

```
pip install playwright
python -m playwright install chromium
```

### 预期输出

```
=== 研究主题 ===
quotes.toscrape.com 上 'love'、'life'、'humor' 三个标签下的代表性引言

=== 阶段 1: Planner 在拆任务 ===
  1. [love-quotes] 访问 /tag/love/，抽出所有 quote 文本和作者
     起始 URL: https://quotes.toscrape.com/tag/love/
  2. [life-quotes] 访问 /tag/life/，抽出所有 quote 文本和作者
     起始 URL: https://quotes.toscrape.com/tag/life/
  3. [humor-quotes] 访问 /tag/humor/，抽出所有 quote 文本和作者
     起始 URL: https://quotes.toscrape.com/tag/humor/

=== 阶段 2: 派 3 个 BrowserWorker 同时干活 ===

  --- Worker 1/3  [love-quotes] ---
      [worker step 0] open_url(https://quotes.toscrape.com/tag/love/)
      [worker step 1] extract_text('.quote .text')
      [worker step 2] extract_text('.quote .author')
     ✓ findings 长度：512 字

  --- Worker 2/3  [life-quotes] ---
      ...
     ✓ findings 长度：488 字

  --- Worker 3/3  [humor-quotes] ---
      ...
     ✓ findings 长度：540 字

=== 阶段 3: Summarizer 写终稿 ===

=== 最终研究报告 ===
# Quotes to Scrape 三大标签的代表性引言研究

## 摘要
本报告汇总 quotes.toscrape.com 上 'love'、'life'、'humor' 三个标签下的核心引言，...

## 主要发现
### 1. Love 标签
- "It is better to be hated for what you are..." — André Gide
- ...

### 2. Life 标签
...

### 3. Humor 标签
...

## 总结
三大标签呈现出截然不同的思想气质：love 偏哲理、life 含警句、humor 多妙喻。...
```

打开 `output/03_report.md` —— 这是 3 个独立 agent 协作产出的真实报告。

中间产物全存了：`01_plan.json`（Planner 计划）/`02_findings.json`（每个 worker 抓到的内容）。

---

## 3. 逐行精讲

### `BrowserWorker` —— 短命子 agent

```python
class BrowserWorker:
    MAX_STEPS = 8
    
    def __init__(self, client, model, page):
        self.messages = [{"role": "system", "content": self.SYSTEM}]
    
    def run(self, subtask_description, starting_url):
        # agent loop with browser tools
        # ends with `report(findings)` tool call
        ...
```

每个 BrowserWorker 是一个**完整的小 agent**：

- 有 system prompt（限定它的角色）
- 有 messages
- 有循环（最多 8 步）
- 跑完一次就**销毁**（page.close(), object garbage collected）

**为什么不复用？** —— 三个原因：

1. **作用域隔离**：A worker 不知道 B worker 抓了什么，**避免污染**
2. **失败隔离**：A 卡住不影响 B
3. **可并行**：独立的 worker 可以并发跑（本章串行，思考题里改并行）

这就是 Bread Agent ch08 的 **sub-agent** 模式在 multi-agent 系统里的应用。

### `report` 工具 —— 明确的终止信号

```python
{
    "type": "function",
    "function": {
        "name": "report",
        "description": "Submit findings for this sub-task and exit.",
        "parameters": {
            "type": "object",
            "properties": {"findings": {"type": "string"}},
        },
    },
},
```

普通 Bread Agent 是"LLM 不调工具就退出"。但 BrowserWorker 想要**结构化的产出**——它必须把 findings 显式 return 给上层。

加一个 `report` 工具：worker 调 `report(findings="...")` = 工作完成 + 提交成果 + 退出循环。

```python
if name == "report":
    return args.get("findings", "")
```

**这种"agent 用工具表达控制流"** 是 multi-agent 设计的标准做法。

### Planner 输出"带 starting_url 的子任务"

```python
[
  {"label": "love-quotes", "description": "抽出 ...", "starting_url": "https://..."},
  ...
]
```

比 Bread Multi-Agent ch01 的 Planner 多了两个字段：

- **`label`**: 后续 Summarizer 引用时用，例如 "Love 标签的发现"
- **`starting_url`**: 直接告诉 worker 从哪开始，省一步 Router 决策

Planner 此时 = "**研究主管**"。它决定要查哪些方向、每个方向去哪查。**Worker 不需要再判断"该去哪个网站"**，只要做"在 X 网站做 Y"。

### Summarizer 的"引用约束"

```python
SYSTEM = (
    "...\n"
    "- 引用必须出自下面的子任务发现，不要凭记忆补充。\n"
    "- 如果某子任务发现为空或失败，要在报告里如实说明。"
)
```

这是**研究 agent 的核心反幻觉规则**。

Summarizer 如果"创造性补充"了 worker 没抓到的内容 → 报告失去可信度。
规则严格执行："**没抓到就说没抓到**"。

OpenAI Deep Research 在这一块做得最严——每一句话都带 citation。本课程简化没做 citation 但思想相同。

### `with sync_playwright() as p` —— 浏览器生命周期

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    for task in subtasks:
        page = browser.new_page()
        worker = BrowserWorker(client, model, page)
        findings[task["label"]] = worker.run(...)
        page.close()
    browser.close()
```

3 层结构：

- **playwright 进程**：整个程序一个，`with` 自动管理
- **browser 实例**：3 个 worker 共用（节省启动时间 ~2 秒/个）
- **page**：每个 worker 一个（**隔离 cookie / localStorage**）

如果你想"每个 worker 独立浏览器"（更彻底隔离），改成每次 `p.chromium.launch()`，慢 6 秒。

### 中间产物存盘

```python
out_dir = HERE / "output"
out_dir.mkdir(exist_ok=True)

(out_dir / "01_plan.json").write_text(...)
(out_dir / "02_findings.json").write_text(...)
(out_dir / "03_report.md").write_text(report)
```

3 个文件对应 3 个阶段。

**debug 神器**：

- 报告不对 → 看 `03_report.md` vs `02_findings.json`，判断是 Summarizer 编了 vs. worker 漏抓了
- worker 漏抓 → 看 `01_plan.json`，判断是 Planner 拆错了 vs. worker 执行差

每一个 multi-agent 系统都需要这种 **trace**。

---

## 4. 卡住了怎么办

### ❌ Planner 输出格式错（不是 list of dict）

跟 ch01 同样的多层兜底——剥皮 + 截尾 + 正则。当前代码已包。

### ❌ Worker 不调 report 就走完 8 步

强化 Worker system prompt："**必须**通过 `report` 工具结束任务，否则视为失败。"
或者把 `MAX_STEPS` 增到 12-15。

### ❌ Worker 调 report 但 findings 为空

很罕见。可能 Worker 没抓到有效内容。看 `02_findings.json` 里那条 worker 的输出 + 它的 messages（要 debug 加打印）。

### ❌ Worker 卡在某页面（点了错按钮跳出主题）

8 步 MAX_STEPS 兜底——但 findings 会很差。
对策：Planner 给 starting_url 时**给最具体的**（直接是目标页面，不是首页），减少 worker 漫游空间。

### ❌ Summarizer 编内容（写了 worker 没抓的）

Summarizer system prompt 已经强约束。如果还编，温度调到 0.0。
或者改成更"硬"的 prompt："只引用以下 findings 里**直接出现的句子**。"

### ❌ 跑得慢（每个 worker 2 分钟）

- worker 的 LLM 调用是大头。换更快的模型（gpt-4o-mini / glm-4-flash）。
- workers **并行**跑（见思考题 1）—— 3 workers 并行只用单 worker 的时间。

### ❌ 浏览器开得太多窗口（强迫症受不了）

`headless=True` —— 后台跑，看不到。
但调试期间保持 `False` 看着才能放心。

---

## 5. 思考题

### 题 1：让 workers 并行

3 个 worker 当前是串行 —— 用 `concurrent.futures.ThreadPoolExecutor`：

```python
from concurrent.futures import ThreadPoolExecutor

def run_one_worker(task):
    page = browser.new_page()
    worker = BrowserWorker(client, model, page)
    return task["label"], worker.run(task["description"], task["starting_url"])

with ThreadPoolExecutor(max_workers=3) as ex:
    results = list(ex.map(run_one_worker, subtasks))
findings = dict(results)
```

> 注意：Playwright 的 sync API **可以在不同线程的不同 page 上并发**，但同一个 page 不能。
> 实测 3 worker 并行 = 单 worker 时间 × 1.1（几乎免费的 3 倍加速）。

### 题 2：加 Critic 重跑机制

参考 ch02 的 Critic：让 Critic 看 Summarizer 写的报告，评分。
如果分数低（如 < 7），**让 Planner 重新规划**——或许子任务拆得不全。

```python
report = summarizer.write(topic, findings)
review = critic.review(topic, report)
if not review["pass"]:
    additional_subtasks = planner.replan(topic, review["feedback"], existing_findings=findings)
    # 派 more workers
    ...
```

> 这是真正"研究型 agent"的核心机制。OpenAI Deep Research 平均跑 3-5 个研究 loop 才出最终报告。

### 题 3：换成真实站点

把 `base_url` 改成你公司的内部 wiki（如果允许）或 Wikipedia：

```python
topic = "Python 的 GIL 历史和 PEP 703 的现状"
base_url = "https://en.wikipedia.org"
```

Planner 会怎么拆？Worker 在 Wikipedia 上 navigate 会顺利吗？观察。

> 这一题让你**首次让 agent 在真实大型站点工作**——绝大多数生产级 browser agent 都从这一步开始踩坑。

---

## 6. 写在 Bread 系列五课的最后

恭喜——你完成了 **Bread 系列五课**：

| 课 | 学到 | 累计行数 |
|---|---|---:|
| Bread Agent | agent 内核、工具循环、钩子、持久化、子 agent | 540 |
| Bread MCP | JSON-RPC、协议化工具、跨进程集成 | 1020 |
| Bread RAG | 切块、向量化、hybrid 检索、Agentic RAG | 1500 |
| Bread Browser | DOM 抽取、浏览器循环、Agentic browsing | 2020 |
| **Bread Multi-Agent** | **Planner-Executor、Critic、Router、Pipeline、研究 agent** | **2540** |

**2540 行 Python**。

你现在能从零搭：

- 💬 多轮对话 agent（Bread Agent）
- 🔌 协议化工具（Bread MCP）
- 📚 私有知识库 RAG（Bread RAG）
- 🌐 浏览器自动化（Bread Browser）
- 🤝 多 agent 协作 / 研究型 agent（**本课**）

**这是 2026 年初市面上所有"企业 AI 助手 / 智能业务代理 / AI Operator / Research Agent"产品的底层架构。** 你能从 0 实现的部分覆盖了 LangChain / CrewAI / AutoGen / browser-use / Skyvern / Perplexity 等项目的核心思想。

### 下一步建议

1. **接你的真实业务** —— 把 5 课学到的拼起来，做一个**真正帮你或你公司省时间的 agent**
2. **Computer Use** —— Anthropic 的 Claude computer-use API，能直接操作整个桌面（不只是浏览器）
3. **多模态 RAG / Vision agent** —— Bread Browser 切 vision 兜底、PDF/图像理解
4. **Production hardening** —— Observability（LangSmith / Helicone）、缓存、限流、错误回退
5. **开源你自己的 agent 项目** —— 你已有完整能力做一个 100+ stars 的开源 agent 框架

---

**祝玩得开心。**

**这个时代缺的不是模型，是会让模型协作的人——而你现在就是。**

> —— Bread Multi-Agent 课程 · 知识星球

