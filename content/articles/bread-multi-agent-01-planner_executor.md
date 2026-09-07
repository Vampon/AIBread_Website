---
title: "第 1 章 · Planner + Executor"
slug: "bread-multi-agent-01-planner_executor"
excerpt: "让多个角色协作。Planner + Executor，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Multi-Agent"
courseSlug: "multi-agent"
courseOrder: 5
chapter: 1
seriesOrder: 29
difficulty: 2
codeLines: 150
---
## 1. 故事：让 LLM 别"边想边写"

单 agent 处理复杂任务时常见的失败：

> 任务："计算前 10 个素数的平均值，给出中文句子作答"
>
> 单 agent 一次性回答：
> "前 10 个素数是 2, 3, 5, 7, 11, 13, 17, 19, 23, 29，加起来等于 130，
>  平均值是 13.0。所以答案是：前 10 个素数的平均值约为 **13.0**。"
>
> ❌ 错——和是 129，不是 130。LLM 边想边算容易出错。

更好的做法：

```
Planner ── 拆任务 ──→  [
                        "列出前 10 个素数",
                        "用 calc 算它们的和",
                        "用 calc 除以 10",
                        "汇报最终答案"
                      ]

Executor ── 一步一步执行（带 calc 工具）──→ 13.0 → 中文句子
```

**思考的 agent 和动手的 agent 分开**——这是 CrewAI / AutoGen / OpenAI Swarm 等框架的核心思想，也是写得稳定的真实 multi-agent 系统的第一条原则。

---

## 2. 跑起来

```
cd ch01_planner_executor
python main.py
```

### 预期输出

```
=== 原任务 ===
计算前 10 个素数的算术平均值，给出一句完整的中文答案。

=== Planner 在思考 ===
  1. 列出前 10 个素数
  2. 计算这些素数的和
  3. 用和除以 10 得到平均值
  4. 汇报最终答案

▶ Executor 步骤 1/4: 列出前 10 个素数
  Executor: 前 10 个素数是 2, 3, 5, 7, 11, 13, 17, 19, 23, 29。

▶ Executor 步骤 2/4: 计算这些素数的和
  ↳ calc('2+3+5+7+11+13+17+19+23+29') = 129
  Executor: 它们的和是 129。

▶ Executor 步骤 3/4: 用和除以 10 得到平均值
  ↳ calc('129/10') = 12.9
  Executor: 平均值是 12.9。

▶ Executor 步骤 4/4: 汇报最终答案
  Executor: 前 10 个素数的算术平均值是 12.9。

=== 最终答案 ===
前 10 个素数的算术平均值是 12.9。
```

注意：

- **Planner 完全不调工具** —— 只产出步骤
- **Executor 不规划**，只一步一步做、调工具
- 答案是 12.9（正确），不是 13.0（单 agent 心算的错）

---

## 3. 逐行精讲

### `Planner` 类 —— 只做一件事：拆任务

```python
class Planner:
    SYSTEM = (
        "你是 Planner。接到一个任务，你的工作是把它**拆成 3-6 条具体可执行的步骤**。\n"
        ...
        "输出**严格的 JSON 数组**，不要任何额外文字、不要 markdown 代码块。"
    )
    
    def plan(self, task):
        resp = self.client.chat.completions.create(...)
        text = resp.choices[0].message.content.strip()
        # 容错剥皮
        ...
        return json.loads(text)
```

3 个设计要点：

1. **没有 messages 累积** —— Planner 是无状态的。一次输入一次输出。
2. **强制 JSON 输出** —— 下游 Executor 要按编号执行，JSON 比纯文本可靠。
3. **temperature=0.2** —— 规划要稳定，不要每次跑都给不一样的计划。

### Planner 输出的"容错剥皮"

```python
if text.startswith("```"):
    text = text.strip("`")
    if text.startswith("json"):
        text = text[4:]
text = text.strip()
return json.loads(text)
```

LLM 即使你说"不要 markdown 代码块"，它**偶尔还是会包**：

```
```json
["列出 ...", "计算 ...", ...]
```
```

强制 JSON 的更稳办法是用 OpenAI 的 `response_format={"type": "json_object"}` —— 但有些 provider 不支持。本课程用 system prompt + 手动剥皮的简单方案，足够稳定。

### `Executor` 类 —— 持有状态、按顺序执行

```python
class Executor:
    def __init__(self, client, model):
        self.messages = [{"role": "system", "content": self.SYSTEM}]
    
    def execute_plan(self, task, steps):
        self.messages.append({"role": "user", "content": f"原任务：{task}\n\n计划：\n..."})
        for i, step in enumerate(steps):
            self.messages.append({"role": "user", "content": f"现在执行第 {i+1} 步：{step}"})
            self._run_one_step()
```

Executor 跟 Planner 不同：**它有 messages**，因为后面步骤要看到前面步骤的结果。

设计模式：

- **整体任务** + **完整计划** 在第一条 user message 注入（背景信息）
- **每一步** 单独作为 user message 推进
- LLM 在每步可以调工具，可以聊（assistant message）

这模仿了 ReAct 模式：**Thought → Action → Observation** 不停轮换。

### `_run_one_step` —— 每步内部允许多次工具调用

```python
def _run_one_step(self):
    for _ in range(self.MAX_STEPS_PER_TASK):
        resp = self.client.chat.completions.create(...)
        msg = resp.choices[0].message
        if not msg.tool_calls:
            return
        for call in msg.tool_calls:
            ...
```

一个 step 内可能 LLM 想：

- "我先 calc 加法，再 calc 除法，**两次工具调用**"

所以 `_run_one_step` 是个**小循环**——上限 3 次工具调用（`MAX_STEPS_PER_TASK`），防止 LLM 死循环。

LLM 满意了（不再调工具）→ 退出小循环 → 回到大循环（下一步）。

### `calc` 工具 —— 安全的算术求值

```python
def calc(expression):
    if not re.fullmatch(r"[0-9+\-*/().\s]+", expression):
        return f"非法表达式: {expression!r}"
    result = eval(expression, {"__builtins__": {}}, {})
    return f"{expression} = {result}"
```

**`eval()` 在生产代码里通常是大坑**——任意代码执行漏洞。这里加了一层正则白名单：**只允许数字和算术运算符**。

`{"__builtins__": {}}` 把 builtins 清空——即使有人绕过正则，也无法调用 `open` / `__import__` 等危险函数。

**这是教学用法**。生产环境算术请用专门库（如 `simpleeval` / `numexpr`）。

### Planner 和 Executor **不共享 client**

```python
planner = Planner(client, model)
executor = Executor(client, model)
```

注意它们用同一个 client 实例，**但各自 messages 独立**。

这就是 multi-agent 的关键：**资源（API key / model）共用，状态隔离**。

如果你想让 Planner 用更便宜的模型（如 gpt-4o-mini），Executor 用更强的（gpt-4o），改成：

```python
planner = Planner(client, "gpt-4o-mini")
executor = Executor(client, "gpt-4o")
```

**每个 agent 独立选模型**——这是 multi-agent 系统省钱省时间的大招。

---

## 4. 卡住了怎么办

### ❌ Planner 输出 markdown 代码块导致 JSON 解析失败

已经有剥皮逻辑。如果还失败，让 Planner 重试一次：

```python
for attempt in range(3):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        text = self.client.chat.completions.create(...).choices[0].message.content
```

### ❌ Planner 把简单任务拆得过细（10 步）

system prompt 里 "**3-6 条**" 通常能限制住。如果不行，加 "**最多 5 步**" 强约束。

### ❌ Executor 跳过了某一步

可能 LLM 觉得"这步不重要"。在 system prompt 加："**严格按顺序执行每一步，不允许跳过**"。

### ❌ Executor 心算了但你想让它调 calc

强化 prompt："需要算术时**必须**调 calc 工具，不允许心算。即使是 2+2 也要调。"

### ❌ Planner 拆出 "汇报最终答案" 之后还要继续做事

system prompt 已经说"**最后一步必须是 '汇报最终答案'**"。如果 Planner 在它之后还加了步骤，就忽略它们：

```python
last_report = next((i for i, s in enumerate(steps) if "汇报" in s or "最终" in s), len(steps))
steps = steps[: last_report + 1]
```

### ❌ 任务无法完成时 Executor 死循环

`MAX_STEPS_PER_TASK = 3` 已经兜底。如果某 step 反复失败，自动跳过——但答案可能不对。可以加错误信号让最终 step 知道前面失败了。

---

## 5. 思考题

### 题 1：Planner 重新规划

如果 Executor 执行到一半发现某步做不了，应该**让 Planner 重新规划**而不是硬上。

改造：在 Executor 工具集加一个 `replan(reason)` 工具，Executor 调用它时退出当前计划，回到 Planner 给新计划。

> 这是 agent 系统的"反思 / re-plan"模式，2026 年的研究热点。

### 题 2：多个 Executor 并行

现在 4 步串行。如果步骤之间**没有依赖**（如"列素数" 和 "查素数定义"），可以并行。

让 Planner 输出**带依赖关系的 DAG**而不是线性列表：

```json
[
  {"id": 1, "step": "列素数", "deps": []},
  {"id": 2, "step": "查素数定义", "deps": []},
  {"id": 3, "step": "合并", "deps": [1, 2]}
]
```

然后 Executor 用线程池并行跑无依赖的 step。

> 这是 LangGraph 的核心抽象。本课程 ch04 会展示一个简化版。

### 题 3：换任务

把 task 改成：

- "用 Python 写一段代码计算斐波那契数列的前 20 项" —— Planner 会怎么拆？
- "给我推荐 3 本机器学习入门书" —— 不涉及计算，calc 工具用不上，Executor 会怎么样？
- "把 '我爱你' 翻译成日语、法语、德语" —— Planner 拆几步？

观察 Planner 的能力边界。**它对 LLM 的 prompt engineering 极其敏感**。

---

## 下一章预告

ch02 引入 **Critic** agent —— 在 Executor 输出后**审查质量**：

```
Planner ──→ Executor ──→ Critic ──┐
                                    │ 通过
                                    ↓
                                  最终答案
                  ↑                  │ 不通过
                  └──────────────────┘ Executor 修改
```

这是内容生产场景的标配（写作 / 代码 / 报告）。代码量 ~220 行。

