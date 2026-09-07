---
title: "第 0 章 · Dialogue"
slug: "bread-multi-agent-00-dialogue"
excerpt: "让多个角色协作。Dialogue，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 25
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Multi-Agent"
courseSlug: "multi-agent"
courseOrder: 5
chapter: 0
seriesOrder: 28
difficulty: 1
codeLines: 80
---
## 1. 故事：把对方的话当 user message

单 agent 时代你写的是这样的代码：

```python
messages = [
    {"role": "system", "content": "你是 ..."},
    {"role": "user", "content": "用户输入"},
    {"role": "assistant", "content": "模型回复"},
]
```

`user` 是真实的人。`assistant` 是 LLM。

**多 agent 系统的本质**：把另一个 LLM 的回复当作 `user` 喂给自己。

```
[Alice 的视角]
  system: 你是 Alice ...
  assistant: "Bob，咱们辩论..."     ← Alice 自己说的
  user: "Alice，Go 才是 ..."        ← Bob 的话，但对 Alice 而言是 'user'
  assistant: "但 Python ..."
  user: "..."
```

LLM 的 chat completions API **不区分** user 是人还是另一个 LLM——只要 role 对得上。这就是所有 multi-agent 框架的底层 trick。

---

## 2. 跑起来

```
cd ch00_dialogue
python main.py
```

### 预期输出

```
🐍 Alice: Bob，我们来辩论一下：写 AI agent，Python 显然比 Go 更合适，你怎么看？

🦫 Bob: Alice，Python 在原型阶段确实快，但生产环境部署 Go 二进制单文件、
       启动 50ms vs Python 进程 1-2 秒。并发 goroutine 模型比 Python GIL ...

🐍 Alice: Bob，你说的部署优势我承认，但 AI agent 的核心是 LLM 调用——
        90% 时间在等 API 响应，并发不是瓶颈。Python 生态里 openai SDK ...

🦫 Bob: ...
```

6 轮交替发言。**两个 LLM 实际上在你眼前互相说服**。

最后打印两 agent 各自的 messages 长度——会看到它们记的"自己听到什么 / 自己说了什么"完全不同。

---

## 3. 逐行精讲

### `Speaker` 类 —— 最简 agent

```python
class Speaker:
    def __init__(self, client, model, name, persona):
        self.client = client
        self.model = model
        self.name = name
        self.messages = [{"role": "system", "content": persona}]
```

**唯一的状态是 `messages`**。没有工具、没有钩子、没有持久化。

每个 Speaker 维护**自己的视角**——它只看到对方的发言（作为 user），不看到对方的内部思考。

### `hear()` 和 `speak()` —— 两步分离

```python
def hear(self, text):
    self.messages.append({"role": "user", "content": text})

def speak(self):
    resp = self.client.chat.completions.create(...)
    text = resp.choices[0].message.content
    self.messages.append({"role": "assistant", "content": text})
    return text
```

为什么要拆？因为对话不是 1:1 round-trip。

某些场景下：

- A 说话 → B 听 → C 听 → B 说话（3 人对话）
- A 说话 → A 说更多（连续发言）
- 系统注入消息 → 所有 agent 都听

把 `hear`（写 user）和 `speak`（调 LLM）拆开，**这些场景都能套用**。

如果你写 `def chat(other_text)` 把两步合并，遇到上面任何一种就要重构。**先抽象、少耦合**是多 agent 设计的关键原则。

### 主循环

```python
last_utterance = opening
speakers = [bob, alice]

for i in range(ROUNDS):
    speaker = speakers[i % 2]
    speaker.hear(last_utterance)
    reply = speaker.speak()
    last_utterance = reply
```

非常朴素：

1. 维护 `last_utterance`（上一个发言）
2. 轮到的 speaker 听 + 说
3. 更新 `last_utterance`

**这个循环本质上是个驱动器（driver）**。后续章节我们会有更复杂的驱动器：

- **Planner-Executor**（ch01）：Planner 说 → Executor 听并执行 → 不再回 Planner
- **Critic 循环**（ch02）：Executor → Critic → Executor 再改 → ...
- **Router 分发**（ch03）：Router 决定 → 转给某个专家
- **Pipeline**（ch04）：A → B → C 单向流

它们的共同点：**谁听谁说，由驱动器决定**。Speaker 类本身不需要变。

### persona 写法的小技巧

```python
"你是 Alice，一个资深 Python 开发者。你坚信 Python 是写 AI agent 最好的语言。"
"对方是 Bob，他更喜欢 Go。"
"规则：每次回复 2-3 句话，论据具体（不要喊口号），可以反驳对方上一句话。"
"保持友好但坚定。"
```

3 段：

- **身份**：你是谁
- **关系**：对方是谁、你跟对方什么关系
- **行为规则**：回复多长、什么风格、能做什么不能做什么

这 3 段对所有 multi-agent 的 persona 都适用。**写好就值 10 分加成**。

### `temperature=0.7`

```python
self.client.chat.completions.create(..., temperature=0.7)
```

辩论场景适合略微 random（0.7 是个常见值）。如果两人都用 `temperature=0`（确定输出），对话会很机械。

后续章节里：

- **Planner / Critic**：低 temperature（如 0.2），追求稳定
- **Writer / Creative**：高 temperature（0.7-1.0），追求多样性

---

## 4. 卡住了怎么办

### ❌ 两人观点 60 秒后趋同

LLM 倾向"和稀泥"。persona 里加强："**不要轻易认同对方**。每次回复要明确指出你不同意对方的哪一点。"

### ❌ 一方变成 yes-man

通常是模型不够"硬"。可以试用更大的模型，或在 persona 加："你必须始终代表 X 立场。即使被反驳得无话可说，也要找新角度坚持。"

### ❌ 输出越来越长

每次回复 100 字符 +。persona 加："每次回复**不超过 60 字**" 控制长度。

### ❌ 跑很慢

每轮串行：A 等响应 → B 等响应。6 轮 = 6 次 API 调用 ≈ 10-30 秒。
ch04 我们会演示**并行多 agent**（独立 agent 同时跑）。

### ❌ 我想看每个 agent 的完整 messages

加打印：

```python
import json
print(json.dumps(alice.messages, ensure_ascii=False, indent=2))
```

你会发现 Alice 视角下 **她说的全是 assistant，Bob 说的全是 user**。这就是 multi-agent 的关键。

---

## 5. 思考题

### 题 1：加第三个 agent —— Judge

引入 `judge = Speaker(... persona="你是裁判，听完辩论给出胜者。")`。

辩论结束后让 judge `hear` 全部对话（拼接），让它 `speak` 一个评判。

> 这就是"裁判 agent"模式的雏形——ch02 的 Critic 是它的兄弟。

### 题 2：辩论改成 3 人

把 Alice / Bob / Carol 写成 3 个 speakers，每人代表一个语言。
轮流发言：A → B → C → A → B → C ...

> 多人对话的难点：每个 speaker 听到的 user 不止一个人。怎么标识发言人？
> 提示：把每次 `hear(text)` 改成 `hear(f"[{from_name}] {text}")`，让 LLM 自己分辨。

### 题 3：让 agent 自动结束

在 persona 里加："如果你被说服了，回复 'I agree' 结束辩论。"

外层循环检测：`if "I agree" in reply: break`。

> 这是**协议化通信**的雏形——agent 用特定标记表达控制信号。ch01 的 Planner 用 JSON 表达"任务完成"是同一思想。

---

## 下一章预告

ch01 引入**Planner-Executor 模式** —— 两个 agent **角色不同**：

- Planner 把复杂任务拆成步骤列表（输出 JSON）
- Executor 拿到列表逐条执行（带工具）

这是真实业务里最常用的 multi-agent 拓扑。代码量 ~150 行。

