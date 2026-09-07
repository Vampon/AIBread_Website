---
title: "第 3 章 · Router"
slug: "bread-multi-agent-03-router"
excerpt: "让多个角色协作。Router，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 45
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Multi-Agent"
courseSlug: "multi-agent"
courseOrder: 5
chapter: 3
seriesOrder: 31
difficulty: 2
codeLines: 290
---
## 1. 故事：一个 agent 不够，10 个工具又乱

回顾前两课的 Bread Agent：

- ch00-ch08 我们让**一个 agent** 同时挂 read_file / write_file / shell / get_time / search 等工具
- 工具数 8 个时已经能感觉 LLM 偶尔选错
- 工具数 > 15 时准确率显著下降

真实业务里，**一个 AI 助手往往要处理几十种业务**：

- 客服系统：售后 / 物流 / 退款 / 投诉 / 闲聊 / ...
- 内部助手：HR / 财务 / IT / 行政 / 技术 / ...

**全堆给一个 agent → 它每次都要在几十个工具里挑 → 准确率灾难**。

正确做法：**Router 分诊**。

```
用户："1+2+3=?"   ──→ Router 看一眼 ──→ MathAgent
用户："写 Python" ──→ Router 看一眼 ──→ CodeAgent
用户："你好"      ──→ Router 看一眼 ──→ GeneralAgent
```

每个专家**只懂自己那摊**：

- MathAgent：1 个工具 calc，prompt 强制"必须调"
- CodeAgent：0 工具，专攻 Python
- GeneralAgent：兜底闲聊

结果：

- **准确率高**（每个专家 prompt 极其聚焦）
- **延迟低**（Router 一次 cheap call + 专家直接答）
- **可演化**（加新业务 = 加新专家 + 改 Router system prompt）

---

## 2. 跑起来

```
cd ch03_router
python main.py
```

试 3 类输入：

```
你 > 1+2+3 等于几？
  [Router → math]  原因：包含算术运算
🧮 math: 这是简单加法：1+2+3 = 6。
        (调了 calc("1+2+3") = 6)

你 > 写一个 Python 函数反转字符串
  [Router → code]  原因：Python 编程问题
🐍 code: ```python
        def reverse(s: str) -> str:
            return s[::-1]
        ```
        切片 [::-1] 是反转字符串最 pythonic 的方式。

你 > 今天天气真不错
  [Router → general]  原因：闲聊
💬 general: 是啊，希望你今天心情也不错！☀️
```

---

## 3. 逐行精讲

### `SpecialistAgent` 基类

```python
class SpecialistAgent:
    SYSTEM = "..."
    TOOLS: list[dict] = []
    
    def __init__(self, client, model):
        self.messages = [{"role": "system", "content": self.SYSTEM}]
    
    def answer(self, user_query):
        self.messages.append({"role": "user", "content": user_query})
        for _ in range(5):
            ...
            if not msg.tool_calls: return msg.content
            for call in msg.tool_calls: ...
```

这是把 Bread Agent ch01 的最小 agent **抽象成基类**——每个专家继承，覆盖 `SYSTEM` 和 `TOOLS`。

3 个专家：

```python
class MathAgent(SpecialistAgent):
    SYSTEM = "你是数学专家..."
    TOOLS = [CALC_TOOL]

class CodeAgent(SpecialistAgent):
    SYSTEM = "你是 Python 代码专家..."
    # 无工具

class GeneralAgent(SpecialistAgent):
    SYSTEM = "你是友好的通用助手..."
    # 无工具
```

**继承的代价是 0** —— 但每个专家**独立维护自己的对话历史**。

### `Router` —— 极简分诊

```python
class Router:
    SYSTEM = (
        "你是分诊员。用户会发一句话，你判断应该交给以下哪个专家：\n"
        "  - 'math'    数学 / 算术 / 几何 / 数字相关\n"
        "  - 'code'    Python / 编程 / 代码相关\n"
        "  - 'general' 其他一切\n"
        "\n"
        "输出严格 JSON：{\"specialist\": \"math|code|general\", \"reason\": \"...\"}"
    )
    
    def route(self, query) -> tuple[str, str]:
        # 无状态、temperature=0
        resp = self.client.chat.completions.create(...)
        # 解析 JSON 返回 (specialist, reason)
```

Router 是**所有 agent 里最简单的一个**：

- **无状态**：每次新对话从头
- **温度 0**：分诊要确定，同一问题永远走同一专家
- **输出极短**：只一个 JSON

**Router 的成本是整个系统里最便宜的**——一个用户 query 只调一次 Router，几个 token。可以用最小最便宜的模型。

### Router 的"白名单兜底"

```python
spec = data.get("specialist", "general")
...
if spec not in ("math", "code", "general"):
    spec = "general"
```

防御 LLM **乱编**——它可能输出 `"finance"` 或 `"unknown"`。
**白名单兜底到 general** 让系统永不崩溃。

生产环境会进一步加：

- 日志记录每次 fallback
- 累积 fallback 多了就报警（说明 prompt 该升级）

### 主循环

```python
specialists = {
    "math": MathAgent(client, model),
    "code": CodeAgent(client, model),
    "general": GeneralAgent(client, model),
}

while True:
    query = input("你 > ")
    spec, reason = router.route(query)
    answer = specialists[spec].answer(query)
    print(f"{emoji[spec]} {spec}: {answer}")
```

**专家在 REPL 启动时各创建一份**（不是每次 query 都新建）。这样：

- 同一专家**记得用户前几轮跟它说过什么**
- 跨专家**不串扰**（math 不知道 code 在干嘛）

如果你想让"跨专家共享上下文"（如 user 在 math 问完接着问 code 想引用前一答案）——更复杂的设计，本章不涉及。这是 ch04 / ch05 的话题。

### `temperature` 的层级

```python
Router         temperature=0.0   # 必须确定
MathAgent      temperature=0.2   # 思考稳定
CodeAgent      temperature=0.2   # 代码稳定
GeneralAgent   temperature=0.2   # 这里其实可以高些，演示从简
```

实际生产里 GeneralAgent 可以用 0.7（闲聊允许多样性）。本章统一 0.2 简化。

---

## 4. 卡住了怎么办

### ❌ Router 总把代码问题路到 general

system prompt 关键词不够。加："**任何提到 'Python' / '代码' / 'function' / '函数' / 'class' / '报错' 的，必须路到 code**"。

### ❌ Router 输出 JSON 不规范

跟 ch02 同样的多层兜底（剥皮 + 截尾 + 正则）已经在代码里。如果还失败，**用 OpenAI structured outputs**（`response_format`）—— 多数 provider 支持。

### ❌ 我希望 math 处理完之后给一个完整解释，但只看到结果

MathAgent 的 system prompt 加："**先讲一句思路、再调 calc、最后总结答案**"。当前已经是这么写的，如果 LLM 偷懒就再强化。

### ❌ 加新专家麻烦

3 步即可：

1. 新建 `XxxAgent(SpecialistAgent)`，覆盖 `SYSTEM` 和 `TOOLS`
2. Router system prompt 加新类别
3. 主循环 `specialists` dict 加新条目

**专家系统的扩展性就来自这里** —— 加业务不需要改 Router 代码逻辑，改 prompt 就行。

### ❌ 一句话里包含两类问题（"3+5 等于几，用 Python 写出来"）

Router 只能选一个 specialist。当前会选 math 或 code。

进阶设计：Router 输出**路由列表**而不是单一 specialist：`{"specialists": ["math", "code"]}`，然后串联调用。
这是 ch04 流水线的思路。

### ❌ Specialist 之间冲突（math 想答 code 的问题）

Specialist 的 system prompt 加"**如果问题不在你的领域，回答 '请转给其他专家'**"。然后主循环检测这句话就再 routing 一次。

---

## 5. 思考题

### 题 1：加 confidence

让 Router 输出 `confidence`（0-1）。低于阈值时**回退到 GeneralAgent**。

```json
{"specialist": "math", "confidence": 0.65, "reason": "..."}
```

```python
if data["confidence"] < 0.5:
    spec = "general"
```

> 真实业务的"模糊查询"靠这种机制兜底。

### 题 2：加 HRAgent / 闲聊隔离

加一个 HR 专家（"你是 HR 专家，回答休假、社保、薪酬相关问题"）。

挑战：Router 怎么区分 "我想请假" 和 "今天天气不错"？提示：在 system prompt 加例子。

### 题 3：路由历史

记录每次路由的 `(query, specialist, reason)`，跑 10 个查询后打印汇总。

- 哪个 specialist 被路由最多？
- 是否有"应该路到 X 但被路到 general"的情况？

> 这就是 Router 性能监控的雏形——生产里靠它来定期升级 Router system prompt。

---

## 下一章预告

ch04 引入**多阶段流水线**：

```
任务 ──→ Researcher ──→ Outliner ──→ Writer ──→ Editor ──→ 成品
```

4 个 agent **顺序协作**，每人产出喂给下一人。我们用它生成一篇博客文章。

代码量 ~390 行，难度跟 ch03 持平但**业务感最强**——这是内容生产系统的真实架构。

