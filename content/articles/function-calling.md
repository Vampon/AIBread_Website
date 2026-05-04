---
title: "Function Calling 一文看懂：让 AI 真的能干活"
slug: function-calling
excerpt: "AI 不知道今天的天气、查不了你的订单，怎么办？给它一组「按钮」让它自己选着按。这就是 Function Calling，是所有 Agent 的底层。"
tag: "AI 概念"
date: "2026-04-26"
cover: "/placeholders/cover-4.svg"
readMin: 8
---

如果只允许你了解一个 AI 时代的新概念，我会推荐 **Function Calling**。它是从"AI 会聊天"到"AI 真能干活"的关键拐点。

读完你会知道：Function Calling 是啥、怎么工作、为什么所有 Agent 产品都建立在它之上。

## 1. 为啥需要 Function Calling

大模型有个尴尬的事实：**它不知道任何"实时"或"私人"的东西**。

| 问题 | 大模型能答吗 |
|------|------------|
| 解释什么是光合作用 | ✓ |
| 现在北京几点 | ✗ |
| 我的订单到哪了 | ✗ |
| 查一下苹果今天股价 | ✗ |
| 帮我发邮件给老王 | ✗（它没有邮箱权限）|

它只能给你"一般性的建议"，干不了"具体的事"。

最早大家是怎么解决的？**让 AI 输出一段指令，人工去执行**：

> 你：现在北京几点？
> AI：抱歉我不知道。建议你查 time.is/Beijing。
> 你：（自己打开浏览器查……）

这特别傻。能不能让 AI **自己去查**？

**Function Calling = 给 AI 一组"按钮"，让它自己选着按。**

## 2. 一句话原理：把工具描述给 AI，让 AI 选

整个流程极简：

```
1. 程序员准备一组工具，每个工具有 (名字 + 描述 + 参数)
2. 把工具列表 + 用户问题一起发给 AI
3. AI 看完想：「这个问题需要调 get_time 工具，参数 city = 北京」
4. AI 输出：{ tool: "get_time", args: { city: "北京" } }
5. 程序拿到这个，去真的调 get_time API，得到 "21:34"
6. 把结果再喂回 AI
7. AI 用自然语言回复用户：「现在北京时间 21:34」
```

**关键点**：AI 不直接执行。它只是**说出想调用什么**。真正去调的是外面的程序。

> 像你点外卖。你不是直接进后厨炒菜，你只是**点单**——告诉商家"我要这道菜"。然后餐厅去做，做好端给你。AI 在这里就是那个点单的客人。

## 3. 一个具体例子：天气助手

假设你做了一个天气 Bot。给 AI 配一个工具：

```js
{
  name: "get_weather",
  description: "查询某个城市当前天气",
  parameters: {
    city: { type: "string", description: "城市名，比如 北京、上海" }
  }
}
```

**用户对话流程**：

```
用户：今天上海天气怎么样？

[ 后台 ] AI 看到工具列表 + 问题 → 决定要调 get_weather
[ 后台 ] AI 输出：{ tool: "get_weather", args: { city: "上海" } }
[ 后台 ] 你的程序：调 OpenWeatherMap API → 得到 "晴，22℃"
[ 后台 ] 把 "晴，22℃" 喂回 AI

AI：上海今天天气晴朗，气温 22℃，挺舒服的。要不要加件薄外套？
```

**注意**：用户**没看到中间过程**。对用户来说，就是问了个问题、AI 回答了，但中间 AI 偷偷调用了一个真实 API。

## 4. 它真正的威力：让 AI 学会"用任何工具"

天气只是开胃菜。Function Calling 真正的威力在于——**任何能用代码调的事，AI 都能间接做**。

| 工具 | AI 能干什么 |
|------|-----------|
| `send_email(to, subject, body)` | 发邮件 |
| `query_db(sql)` | 查公司数据库 |
| `book_meeting(time, attendees)` | 订会议室 |
| `search_jira(keyword)` | 查项目工单 |
| `get_order_status(order_id)` | 查用户订单 |
| `calculate(expression)` | 算数学题（AI 自己算容易错）|
| `run_python(code)` | 跑代码 |
| `web_search(query)` | 上网搜索 |

**当工具足够多时，一个 AI 就能干一个员工的活儿了**。

## 5. 这就是 Agent 的底层

[上一篇讲 Agent](/blog/agent-explained) 时提到 Agent 三件套：感知 → 规划 → 行动。

**"行动"这一步靠什么？—— Function Calling**。

Agent 多步任务的执行流程：

```
循环 N 次 {
  AI 看当前状态（感知）
  ↓
  AI 决定下一步用哪个工具（规划 + Function Calling）
  ↓
  程序调用工具，执行
  ↓
  把结果喂回 AI（更新状态）
}
直到 AI 说"任务完成"
```

> **没有 Function Calling 就没有 Agent。** Function Calling 是 AI 从"答题机"升级到"执行机"的开关。

## 6. 普通用户能感受到吗？

能。你已经在用了，只是没意识到：

- **ChatGPT 的联网搜索**：背后就是 `web_search` 工具调用
- **ChatGPT 上传 Excel 让它分析**：背后调 `run_python` 跑数据分析
- **Claude 在 Cursor 里改代码**：调 `read_file`、`edit_file` 工具
- **扣子 / Dify 搭的 Bot**：你在拖工具节点，本质就是配置 Function Calling
- **GPTs**：自定义的 Action 就是 Function Calling

**Function Calling 是 AI 产品爆发的真正分水岭**。2023 年之前，AI 只能聊天；之后，AI 开始真的能做事——这一切的开关就是这个。

## 7. 自己怎么用上

你不需要会写代码，也能用上 Function Calling：

**入门级**：

- 用 **ChatGPT 联网搜索** / **Claude 工具集成** —— 已经内置工具
- 用 **GPTs Marketplace** —— 现成的工具型 GPT
- 用 **扣子 / Dify** 拖拽搭一个带工具的 Bot

**进阶级**（懂点代码）：

- 用 **OpenAI / Anthropic API + 你自己的工具** —— 写一个真正的小 Agent
- 用 **MCP Server** —— [让你的工具变成所有 AI 都能用的标准接口](/blog/mcp-protocol)

## 8. 三句话复盘

- **Function Calling = 让 AI 知道有哪些工具可用，并自己选择调用哪个**
- **AI 只输出意图，真正执行的是外面的程序**
- **它是 Agent / GPTs / Cursor / 扣子……所有 AI 应用的底层基础**

> 下次再听到"Agent 时代"、"AI 工具调用"、"模型能上网了"——背后都是 Function Calling 在工作。

延伸阅读：[Agent 到底是个啥](/blog/agent-explained) · [MCP：AI 的 USB 接口](/blog/mcp-protocol) · [RAG 入门](/blog/rag-intro)
