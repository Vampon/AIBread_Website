---
title: "第 2 章 · Critic"
slug: "bread-multi-agent-02-critic"
excerpt: "让多个角色协作。Critic，边读边运行配套 Python 代码。"
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
chapter: 2
seriesOrder: 30
difficulty: 3
codeLines: 220
---
## 1. 故事：让 LLM 自己改自己

让一个 LLM "**写一条机智的推特**"——它出的稿子常常：

- 长度超标（要求 140 字，它写了 200 字）
- 不够机智（套话堆叠）
- 技术细节出错（GIL 写成"全局锁"，技术圈会被骂）

让**同一个 LLM** 重新审视自己的稿，再改一遍——通常能显著改善。这就是 **"LLM-as-judge"** 模式。

但更稳的做法是：**用一个独立的 agent 当 Critic**，跟 Executor 完全隔离：

```
任务 ──→ Executor 出稿 ──→ Critic 评分
                              │
                          通过│不通过
                              ↓ ↑
                          最终答案  ↑
                                ↑   │
                                └───┘ Executor 拿反馈再改
```

为什么不让 Executor 自己评？

1. **Confirmation bias**：刚写完自己满意，倾向于打高分
2. **角色混淆**：同一上下文切换创作/批评 → LLM 不稳定
3. **可观测性差**：Critic 独立时你能看清楚每一稿被怎么 review 的

---

## 2. 跑起来

```
cd ch02_critic
python main.py
```

### 预期输出

```
=== 任务 ===
写一条不超过 140 字的中文推特，主题是 Python 的 GIL。要求风格机智、技术准确。

--- Round 1 ---
📝 Executor 草稿（138 字符）：
Python 的 GIL 就像办公室唯一的微波炉：一次只能热一个人的饭。
你以为多线程能并发？不，大家排队等饭🍱。这就是为啥 CPU 密集型还是要走 multiprocessing。

🔎 Critic 评分：7/10  通过：False
   反馈：GIL 比喻贴切但解释偏弱，可以加一句"I/O 密集型其实没问题"避免误导。

--- Round 2 ---
📝 Executor 草稿（137 字符）：
Python 的 GIL 像办公室唯一的微波炉：CPU 密集大家排队等饭🍱。
但 I/O 密集（爬虫、API 调用）反而不受影响——大家在等饭时可以同时刷手机。

🔎 Critic 评分：9/10  通过：True
   反馈：技术准确性、机智度都到位，长度合规。通过。

✅ 审查通过！

=== 最终稿 ===
Python 的 GIL 像办公室唯一的微波炉：CPU 密集大家排队等饭🍱。
但 I/O 密集（爬虫、API 调用）反而不受影响——大家在等饭时可以同时刷手机。
```

2-3 轮迭代后通常能通过。比一发即中的稿子质量高 30-50%（实测）。

---

## 3. 逐行精讲

### Executor 有状态 + Critic 无状态

```python
class Executor:
    def __init__(self, ...):
        self.messages = [...]  # ← 有 messages
    
    def write(self, instruction):
        self.messages.append({"role": "user", "content": instruction})
        ...

class Critic:
    def review(self, original_task, draft):
        # 每次重新构造 messages，不累积
        resp = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": ...},
                {"role": "user", "content": ...},
            ],
        )
```

为什么 Executor 要 messages、Critic 不要？

- **Executor** 需要看到自己的上一稿 + Critic 的反馈才能"针对性修改"
- **Critic** 每次评估应该**独立** —— 别被自己上一轮的评分影响

**这是教学上最重要的细节**：multi-agent 设计里"哪些 agent 有记忆、哪些没有"决定了系统行为。

### Critic 的输出契约 —— JSON

```python
"输出**严格 JSON**：{\"score\": int, \"pass\": bool, \"feedback\": str}"
"- pass = true 当且仅当 score >= 8 且所有硬指标（长度）合格。"
"- feedback 是给作者的具体修改建议（不超过 60 字）。"
```

3 个字段：

- **`score`**: 数字打分（人类好理解）
- **`pass`**: 布尔结果（程序好判断）
- **`feedback`**: 文本（喂给下一轮 Executor）

**为什么不只用 score**？因为 LLM 评分不稳定 —— 同一稿件不同时间可能 7 或 8。
**为什么不只用 feedback**？因为程序需要明确的"是否继续循环"信号。
**两者结合最稳**。

`pass = score >= 8 且硬指标合格` 是 Critic 自己判断，主程序只看 `pass` 字段。

### 容错的 JSON 解析

```python
last_brace = text.rfind("}")
if last_brace != -1:
    text = text[: last_brace + 1]
```

LLM 偶尔会在 JSON 之后**多加几句解释**：

```
{"score": 9, "pass": true, "feedback": "..."}

这条推特写得不错，建议直接采用。
```

最后一个 `}` 之后的内容是噪声 —— 截掉。

再加一道兜底：如果 JSON 还是解析不了，用正则抠出 `score` / `pass`：

```python
score_m = re.search(r'"score"\s*:\s*(\d+)', text)
pass_m = re.search(r'"pass"\s*:\s*(true|false)', text)
```

**生产代码值得这种鲁棒性**——一次解析失败可以接受，整个流水线挂掉不能接受。

### 主循环——反馈喂给下一轮

```python
instruction = task  # 第一轮
for round_idx in range(1, MAX_ROUNDS + 1):
    draft = executor.write(instruction)
    review = critic.review(task, draft)
    if review["pass"]:
        break
    # 把 Critic 反馈包装成 Executor 的下一句 user message
    instruction = f"Critic 给出反馈：{feedback}\n请针对性修改你的上一稿，重新输出推特正文。"
```

第一轮 instruction = 原任务。第二轮起 instruction = 反馈。

Executor 收到反馈时**已经有上一稿在 messages 里**（assistant role），所以它知道"上一稿是什么 + 怎么改"。

### `MAX_ROUNDS = 4` 兜底

```python
for round_idx in range(1, MAX_ROUNDS + 1):
    ...
else:
    print(f"达到最大轮数，仍未通过")
```

Python 的 `for...else`：循环**正常结束**（没 break）才进 else。

如果 4 轮都不通过 —— **接受最后一稿、退出**。不要无限循环。

实际生产里 `MAX_ROUNDS = 3-5` 是合理范围。超过 5 轮还不通过通常是任务本身设计有问题，不是 Executor 不够努力。

### temperature 的差异

```python
# Executor 创作：0.7
self.client.chat.completions.create(..., temperature=0.7)

# Critic 评分：0.2
self.client.chat.completions.create(..., temperature=0.2)
```

**Critic 用低 temperature 让评分更稳定**——同一稿件被评 10 次都该是相同分数（确定性强）。
**Executor 用高 temperature 让创作多样化**——前后稿应有不同尝试。

这是 multi-agent 系统调参的经验：**思考类 agent → 低 temp、创作类 agent → 高 temp**。

---

## 4. 卡住了怎么办

### ❌ 永远不通过（4 轮全 7 分）

通常 Critic 标准太高。在 system prompt 里降标准："**score 7 以上即可通过**"。

或者改 `pass` 逻辑：`"score >= 7"` 而不是 8。

### ❌ 第一轮就过了，看不到迭代

Executor 太强或 Critic 太宽。让 Critic 严格："**对任何不完美的地方都要扣分**"，或加更多硬指标（必须含 emoji、必须包含 "GIL" 字面词等）。

### ❌ Executor 不改前后稿，每轮重新创作

Executor system prompt 已经说"**针对性修改而不是从头重写**"。如果仍重写，问题在于 messages 里**没有清晰的"上一稿"标记**。改成：

```python
instruction = (
    f"你的上一稿是：\n{prev_draft}\n\n"
    f"Critic 反馈：{feedback}\n"
    f"请基于上一稿做最小修改，重新输出。"
)
```

### ❌ Critic 反馈太抽象（"加强机智度"）

Critic system prompt 加："**反馈必须包含具体修改建议**（如改某词、删某句、加某细节）。"

### ❌ JSON 解析失败

已经多层兜底（剥皮 + 截尾 + 正则）。如果还失败，**打印 raw text**，肉眼看 LLM 输出了啥，针对性加规则。

### ❌ 任务太主观，Critic 评分摇摆

写诗、画 emoji 这种主观任务 LLM-as-judge 不稳。可以让 **3 个 Critic 投票**（多数派胜出）——但这是另一个章节的内容。

---

## 5. 思考题

### 题 1：3 个 Critic 投票

把 1 个 Critic 改成 3 个不同视角的 Critic：

- TechCritic（技术准确性）
- StyleCritic（风格机智度）
- LengthCritic（长度合规）

三者独立 review，**三票全通过**才算 pass。

> 这是"专家委员会"模式，质量门更严。

### 题 2：让 Executor 看到所有历史草稿

当前 Executor 看到的 messages 是"草稿 → 反馈 → 草稿 → 反馈 ..."。
但 LLM 实际上更需要看到的是"**哪些尝试 Critic 说不好、为什么**"。

改造 Executor.write，把 instruction 改成包含**所有历史轮次**的总结：

```
你已经尝试过：
  v1: "..."  Critic 说 "太长"
  v2: "..."  Critic 说 "技术错误"
现在 Critic 又说："..."
请写第 3 版。
```

> 这能减少 Executor "兜圈子"（同一错误反复犯）的概率。

### 题 3：自动选模型

实验把 Executor 改成弱模型（`gpt-4o-mini` / 小开源模型）、Critic 改成强模型。

观察：通过率会降吗？平均轮数会变吗？

> 真实业务里这种**"弱执行 + 强审查"** 比例是省钱的法宝——
> 强模型每次贵，但只 review 不创作，调用次数远少于 Executor。

---

## 下一章预告

ch03 引入 **Router** —— 第一个"分诊"agent：

```
用户问 ──→ Router 判断类型 ──→ 转给某个专家 agent ──→ 专家答
            （数学 / 代码 / 通用）
```

代码量 ~290 行，难度比 ch02 略低（核心是分类逻辑），但**真实业务**应用极广（客服系统、智能助手都是这种结构）。

