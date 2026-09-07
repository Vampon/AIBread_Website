---
title: "Function Calling：Tool 的底层实现机制"
slug: agent-function-calling-tool-406d819
excerpt: "上一篇我们讲了 Tool（工具）——Agent 用工具跟外部世界交互。"
tag: "AI Agent"
date: "2026-06-02"
cover: "/placeholders/cover-2.svg"
readMin: 4
importedFrom: "5-Agent/05-Function Calling.md"
---
上一篇我们讲了 Tool（工具）——Agent 用工具跟外部世界交互。

**但 Agent 怎么"知道"该调用哪个工具？怎么"告诉"大模型有哪些工具可用？工具调用的结果怎么返回给大模型？**

这背后的技术机制就是 Function Calling。

> 💡 更详细的 Function Calling 科普，请参考我之前写的《Function Calling：大模型的"双手"》（在 1-AI认知/AI基础认知 目录下）。本篇聚焦 Agent 开发视角。

---

## 📖 一句话定义

**Function Calling 是一种让大模型输出结构化"函数调用指令"而非自然语言的技术。** 大模型不直接执行函数，而是输出"我想调用这个函数，参数是这个"——由你的程序去执行。

---

## 🎬 一个精妙的类比：导演和场务

拍电影时：

- **导演**（大模型）：看剧本，决定"下一场需要什么"
- **对讲机**（Function Calling 协议）：导演通过它对讲
- **场务**（你的程序）：听到导演的指令，去执行

```
导演："下一场需要一把椅子，放在舞台中央"
        ↓ （对讲机，格式：{action: "place", object: "chair", position: "center"}）
场务：搬来椅子，放在舞台中央
        ↓ （对讲机回复："椅子放好了"）
导演："好，演员准备"
```

**大模型不自己搬椅子——它告诉场务"我需要椅子"，场务去搬，搬完了告诉它结果。**

> **🖼️ 图片建议：** 一张"导演和场务"流程图。左侧"大模型/导演"：拿着剧本，通过对讲机发出指令（标注"Function Call：{name: 'place_chair', args: {position: 'center'}}"）。中间"对讲机/协议"。右侧"程序/场务"：接收指令，实际搬椅子，通过对讲机回复结果（标注"Function Result：{success: true}"）。风格：电影片场 + 技术信息图。

---

## 🔄 Function Calling 的完整流程

```text
① 用户说："帮我查一下明天北京的天气"

② 你的程序把用户消息 + 可用工具列表发给大模型
   messages: [{"role": "user", "content": "帮我查明天北京的天气"}]
   tools: [
     {
       name: "get_weather",
       description: "查询指定城市和日期的天气",
       parameters: {
         city: "城市名",
         date: "日期"
       }
     }
   ]

③ 大模型返回一个 Function Call（不是自然语言！）
   {
     "role": "assistant",
     "content": null,               // ← 没有文字内容！
     "tool_calls": [{
       "name": "get_weather",        // ← 我要调用这个函数
       "arguments": {
         "city": "北京",
         "date": "2026-06-03"
       }
     }]
   }

④ 你的程序执行这个函数
   result = get_weather(city="北京", date="2026-06-03")
   // → {temperature: 28, weather: "晴"}

⑤ 把执行结果返回给大模型
   messages.push({
     "role": "tool",
     "tool_call_id": "...",
     "content": '{"temperature": 28, "weather": "晴"}'
   })

⑥ 大模型根据结果生成自然语言回复
   "明天北京晴天，气温 28°C，适合出行！"
```

---

## 🆚 Function Calling vs Tool：什么关系？

这两个词经常混用，但它们不是一个东西：

| | Function Calling | Tool |
|---|---|---|
| 是什么 | **协议/机制**——大模型怎么"表达"要调用函数 | **概念/实体**——Agent 可以用的外部功能 |
| 谁定义的 | AI 服务商（OpenAI/Anthropic 的 API 规范） | 你（开发者） |
| 类比 | 对讲机的通信协议 | 场务手上的工具 |
| 关系 | Function Calling 是实现 Tool 调用的技术手段 | Tool 是通过 Function Calling 暴露给大模型的功能 |

**一句话：Tool 是"什么"，Function Calling 是"怎么"。**

---

## 🧠 Agent 开发中的 Function Calling 实践

### 1. 工具描述写得好，Agent 才不会乱调用

```python
# ❌ 描述太模糊
{"name": "search", "description": "搜索"}

# ✅ 精确描述：什么时候用、返回什么
{
  "name": "web_search",
  "description": "搜索互联网获取最新信息。当用户询问实时信息、新闻、或需要最新数据时使用。",
  "parameters": {
    "query": {"type": "string", "description": "搜索关键词，使用简洁的关键词组合"}
  }
}
```

### 2. 处理错误和重试

```python
# Function Calling 可能失败
try:
    result = execute_tool(tool_name, arguments)
    return {"success": True, "data": result}
except Exception as e:
    # 把错误信息返回给大模型，让它自己决定怎么办
    return {"success": False, "error": str(e)}
    # 大模型可能会："搜索失败了，我换个关键词试试"
```

### 3. 控制并发和成本

```python
# Agent 可能同时调用多个工具
# 但要注意：每个 Function Call 都消耗 token
# 限制单次任务的工具调用次数，防止成本失控
MAX_TOOL_CALLS = 20
```

---

## 💡 总结

- **Function Calling = 大模型输出"我想调这个函数"而非自然语言的机制**
- 大模型不执行函数——它说"我要调什么"，你的程序去执行
- Function Calling 是"怎么"（机制），Tool 是"什么"（概念）
- 工具描述要精确，Agent 靠描述决定用什么工具
- 做 Agent 开发要处理调用失败、并发和成本控制

---

*下篇预告：MCP——让 Agent 能接"任何工具"的通用协议*

---

**面包君** 🍞
*比你多懂一点的朋友*
