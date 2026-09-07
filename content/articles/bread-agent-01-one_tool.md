---
title: "第 1 章 · 第一次工具调用"
slug: "bread-agent-01-one_tool"
excerpt: "让模型开始动手。第一次工具调用，边读边运行配套 Python 代码。"
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
chapter: 1
seriesOrder: 2
difficulty: 2
codeLines: 80
---
## 1. 故事：让 AI"动手"，不只是"动嘴"

ch00 我们的 AI 像个**博学但被关在房间里的人**——它能说话，能回答你"中国首都是哪儿"这种它脑子里有答案的问题。

但你问它"**现在几点了**"，它怎么办？它的训练数据停在去年某月，它不知道此刻是几点。它要么诚实说"我不知道"，要么瞎编一个。

**真正的智能体必须能去外面查**——比如查系统时钟、查天气、查数据库。在 LLM 的世界里，这叫"**工具调用（tool calling / function calling）**"。

这一章的目标：**让 AI 不再脑补时间，而是要求我们的程序去查系统时间，再用查到的真实时间回答用户**。

整个流程长这样（看不懂没关系，跑完代码再回来看就懂了）：

```
你："现在几点？"
   │
   ▼
+----------------------------------+
|  第 1 次请求 LLM（带工具清单）   |
+----------------------------------+
   │  LLM 决定："我要调 get_current_time"
   ▼
+----------------------------------+
|  我们的 Python 真的去执行那个函数 |
|  → 返回 "2026-05-16 14:32"        |
+----------------------------------+
   │
   ▼
+----------------------------------+
|  第 2 次请求 LLM（带工具结果）   |
+----------------------------------+
   │
   ▼
你：（看到）"现在是 2026 年 5 月 16 日 14:32。"
```

注意：这一章**故意只做"一次工具调用 + 一次最终回答"**，没有循环。下一章 ch02 才有真正的循环。先建立"两次请求"的心智模型。

---

## 2. 跑起来：先看到 AI 真的"动手"了

### 跑命令

```
cd ch01_one_tool
python main.py
```

> 用 Anaconda 环境的同学：把 `python` 换成 `D:\anaconda3\envs\xxxxx\python.exe`。

### 预期输出

```
[工具调用] get_current_time({})
[工具返回] 2026-05-16 14:32:08

[最终回答] 现在是 2026 年 5 月 16 日 14:32。
```

**重点是中间那两行 `[工具调用]` 和 `[工具返回]`**——它们证明了 AI 真的让我们的 Python 去查了系统时间，不是脑补的。

如果这两行没出现（AI 直接给了个时间但没调工具），可能是模型偷懒了——继续往下读，思考题第 3 题会教你怎么"逼"它调工具。

![image-20260523113442192](/tutorials/bread-ai-from-scratch/image-20260523113442192.png)

---

## 3. 逐行精讲：80 行代码的心脏在哪

打开 `main.py`，**重点看 3 个部分**（其他部分跟 ch00 大同小异）：

### 第 1 部分：工具的"身体"——一个普通的 Python 函数

```python
def get_current_time() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
```

这就是个普通函数，没什么神秘。它读取系统时间，返回一个字符串。**重点：AI 自己不能调 `datetime.now()`，必须我们的程序代它执行**。

### 第 2 部分：工具的"说明书"——TOOLS_SCHEMA

```python
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "获取当前的系统时间。当用户询问现在几点、今天几号时调用。",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]
```

**这个 dict 长得很复杂，但你必须看懂它**，因为后面所有工具都长这样。

- `type: "function"` —— 固定写法，表示这是个函数
- `name` —— 工具名，**必须和 Python 函数名一致**
- `description` —— **★ 全章最重要的字段**。LLM **只看这段文字**来决定要不要调你的函数。如果你写"获取股票价格"，AI 永远不会在用户问"几点"时调你
- `parameters` —— 这个工具需要什么参数（JSON Schema 格式）。`get_current_time` 不需要参数，所以 `properties` 是空对象

> 这个 dict 的格式是 OpenAI 官方规定的，DeepSeek/Qwen/Moonshot 等都遵循。学一遍走遍天下。

### 第 3 部分：连接"说明书"和"身体"——TOOLS_IMPL

```python
TOOLS_IMPL = {
    "get_current_time": get_current_time,
}
```

这是一个字典：**工具名 → Python 函数**。

为什么需要它？因为 AI 返回的是字符串名字（"get_current_time"），我们得知道这个名字对应哪个真实函数。这个字典就是查找表。

### 第 4 部分：核心流程——`chat()` 函数

我把它分两段讲。

#### 第 4a 部分：第一次请求

```python
response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    tools=TOOLS_SCHEMA,  # ← 新增：把工具清单告诉 LLM
)
assistant_msg = response.choices[0].message

if not assistant_msg.tool_calls:
    return assistant_msg.content
```

跟 ch00 的差别就两处：
1. 多了 `tools=TOOLS_SCHEMA` 参数（告诉 AI 它能调哪些工具）
2. 多了 `if not assistant_msg.tool_calls` 的判断（万一 AI 不调工具直接答了，我们就提前返回）

#### 第 4b 部分：把 AI 的"工具调用请求"先 append 到 messages

```python
messages.append(assistant_msg)
```

**这一行不能省**。OpenAI 协议要求：assistant 的 tool_calls 消息必须**保留在对话历史**里，后续的 tool 结果消息才能跟它配对。漏了这行下次请求会报错。

```
[messages] [{'role': 'system', 'content': '你是一个友好的中文助理，必要时使用工具。'}, {'role': 'user', 'content': '现在几点了？'}, ChatCompletionMessage(content='', refusal=None, role='assistant', audio=None, function_call=None, tool_calls=[ChatCompletionMessageToolCall(id='call_ec5f78b3803347f08cd05c90', function=Function(arguments='{}', name='get_current_time'), type='function')], reasoning_content='用户询问现在几点了，我需要调用获取当前时间的工具。')]
```



#### 第 4c 部分：执行工具，写回结果

```python
for tool_call in assistant_msg.tool_calls:
    name = tool_call.function.name
    args = json.loads(tool_call.function.arguments or "{}")

    result = TOOLS_IMPL[name](**args)

    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(result),
    })
```

- `tool_call.function.name` —— AI 想调哪个工具
- `tool_call.function.arguments` —— **是个 JSON 字符串**（不是 dict！）所以要 `json.loads` 转
- `TOOLS_IMPL[name](**args)` —— 找到对应的 Python 函数并调用。`**args` 是 Python 的"字典解包"语法，把 `{"x": 1, "y": 2}` 变成 `x=1, y=2` 传给函数
- 最后我们以 `role="tool"` 把执行结果 append 回 messages
- **`tool_call_id` 必须和 AI 那条消息里的 id 对得上**——这是配对凭据，错了 OpenAI 会拒绝

> [!NOTE]
>
> 把结果打印展示一下

#### 第 4d 部分：第二次请求

```python
final = client.chat.completions.create(
    model=MODEL,
    messages=messages,
)
return final.choices[0].message.content
```

现在 messages 长这样：

```
[system] 你是个友好助理
[user]   现在几点？
[assistant] (tool_calls: get_current_time)
[tool]   2026-05-16 14:32
```

```
[messages] [{'role': 'system', 'content': '你是一个友好的中文助理，必要时使用工具。'}, {'role': 'user', 'content': '现在几点了？'}, ChatCompletionMessage(content='', refusal=None, role='assistant', audio=None, function_call=None, tool_calls=[ChatCompletionMessageToolCall(id='call_ec5f78b3803347f08cd05c90', function=Function(arguments='{}', name='get_current_time'), type='function')], reasoning_content='用户询问现在几点了，我需要调用获取当前时间的工具。'), {'role': 'tool', 'tool_call_id': 'call_ec5f78b3803347f08cd05c90', 'content': '2026-05-23 22:48:37'}]
```

把这一堆再发一次给模型，它会读到"哦工具已经查到时间了"，于是用中文回答用户。**这一次它不会再要工具了，会给纯文本回答**。

---

## 4. 卡住了怎么办

### ❌ 模型直接给了个时间但没调工具

模型的脾气问题——有些模型在"description 写得不够诱导"的情况下会偷懒。可以试：
- 把 description 改成更明确的："**必须**调用此工具才能获取真实当前时间。**不要**自行编造时间。"
- 或者换更明确的提问："请通过工具获取一下现在的时间"

### ❌ `tool_call_id 不匹配` 错误

可能是你改代码时漏了 `messages.append(assistant_msg)` 那行，导致 tool 消息找不到对应的 assistant tool_calls。

### ❌ `json.JSONDecodeError`

AI 偶尔会给坏 JSON 当参数。我们的 `args = json.loads(... or "{}")` 在参数为空时已经兜底成 `{}`。如果是格式真的坏掉，下一章 ch02 教你怎么把错误回喂给模型让它自己改。

### ❌ ch00 能跑这章跑不了

99% 是 `tools=TOOLS_SCHEMA` 写错了——这个参数的结构一旦不对，OpenAI 会直接拒绝整个请求。仔细比对你的 schema dict 和 main.py 里的样板。

---

## 5. 思考题

### 题 1：加第二个工具

加一个 `get_weekday() -> str` 函数（返回"星期一"~"星期日"），把它注册到 TOOLS_SCHEMA 和 TOOLS_IMPL。然后问 AI"今天周几"，看它会不会调对工具。

提示：
- Python 里 `datetime.now().weekday()` 返回 0-6
- 把 ch01 改成支持多工具，你会发现 TOOLS_IMPL[name] 这种查表写法的好处

### 题 2：带参数的工具

把 `get_current_time` 改成接受一个 `timezone: str` 参数（"Asia/Shanghai" / "America/New_York" / "UTC"），返回指定时区的时间。

提示：
- Python 用 `zoneinfo.ZoneInfo` 处理时区
- TOOLS_SCHEMA 的 parameters.properties 里要描述 timezone 这个 string 参数
- 还要把 timezone 加进 `required` 列表

跑：问 AI"纽约现在几点"，看它能不能传对参数。

### 题 3：故意"骗"模型

把 `description` 改成 `"获取股票实时价格"`（其他不变），然后问"现在几点"——观察 AI 还会不会调用这个工具。

**目的**：让你直观体会 description 字段在 AI 决策中的核心地位。**Prompt engineering 的一大块工作就是写好这段描述**。

---

## 这一章你学会了什么

- ✅ 工具 = 一个 Python 函数 + 一份 JSON Schema 描述
- ✅ TOOLS_SCHEMA 给 AI 看，TOOLS_IMPL 给我们自己查表
- ✅ 一次工具调用 = 两次 LLM 请求 + 一次 Python 执行
- ✅ `tool_call_id` 是配对凭据，不能搞错
- ✅ description 字段决定 AI 何时调你的工具

**下一章 ch02**：把"两次请求 + 一次执行"扩展成**真正的循环**，让 AI 能连续调用多个工具完成复杂任务。**这是整门课最重要的一章**。

