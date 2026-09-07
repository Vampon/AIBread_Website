---
title: "第 5 章 · RAG 接入 Bread Agent（终章）"
slug: "bread-rag-05-with_agent"
excerpt: "让模型找到资料。RAG 接入 Bread Agent（终章），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 45
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread RAG"
courseSlug: "rag"
courseOrder: 3
chapter: 5
seriesOrder: 21
difficulty: 3
codeLines: 480
---
## 1. 故事：让 agent 自己决定"要不要查知识库"

ch00-ch04 我们的 RAG 是被动的——你写代码"先 search 再 ask"。所有问题都强制走一遍检索。

但真实场景里：

| 用户输入 | 应该查知识库吗 |
|---|---|
| "你好" | ❌ 闲聊，不用 |
| "今天天气怎样" | ❌ 与业务无关 |
| "加盟费多少？" | ✅ 业务问题 |
| "你们 vegan 选项有什么？" | ✅ 业务问题 |
| "上一问的学徒，工资呢？" | ✅ 上下文延续 |
| "再问一遍刚才的问题" | ❌（上一轮已经查过，不用再查） |

让 agent **自己决定**——这就是 **Agentic RAG**。

实现：把 RAG 的 hybrid search 包成一个 `search_knowledge_base(query)` 工具，扔给 Bread Agent 的工具调用循环。**Agent 在多轮对话里自己判断要不要调它**。

---

## 2. 跑起来

```
cd ch05_with_agent
python main.py
```

第一次跑会建库 + 存 pkl。之后秒开。

试这一组对话：

```
你 > 你好，今天天气怎么样
AI > 你好！我是 Bread 面包工坊客服...天气信息我没法提供...
                                              ↑ 没调工具

你 > 加盟费多少？培训要多久？
  [step 0] search_knowledge_base(query='加盟费多少')
  [step 0] search_knowledge_base(query='培训要多久')
                                              ↑ 自己分了 2 次查
AI > 知识库里没有相关加盟费和培训信息...建议邮件 HR

你 > 学徒呢？工资多少
  [step 0] search_knowledge_base(query='烘焙学徒工资待遇')
                                              ↑ 自己理解了"学徒"=上一轮延续
AI > 烘焙学徒月薪 6-9k，包食宿...[hr_policy.md]
```

3 件关键事情发生了：

1. **闲聊不调工具** —— agent 主动判断"不需要查"
2. **一次提问可能多次查** —— agent 自己拆问题
3. **多轮上下文影响检索 query** —— agent 从对话历史里抽出"学徒"作为新 query

这就是 Bread Agent 的工具调用循环 + Bread RAG 的检索能力合体后的效果。

---

## 3. 逐行精讲

### 把 RAG 包成工具

```python
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": (
                "在 Bread 面包工坊的内部知识库里检索相关信息。"
                "适用场景：用户问公司、产品、政策、HR、招聘等内部资料相关问题。"
                "返回 top-3 最相关的文档片段（含来源文件名和相似度分数）。"
                "**当用户问任何具体业务问题时，优先调此工具**，不要凭记忆回答。"
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "检索查询..."},
                },
                "required": ["query"],
            },
        },
    },
]
```

**整个 RAG-Agent 集成的核心就是这段 schema**——你把 RAG 当函数暴露，LLM 自己决定何时调它。

`description` 写得**很重要**：要明确告诉模型"何时调、何时不调"。本课程的写法是"业务问题必须调，闲聊别调"，反映在 system prompt 里再强调一遍。

### `_execute_tool` 把检索结果格式化

```python
def _execute_tool(self, name, args) -> str:
    if name != "search_knowledge_base":
        return f"未知工具: {name}"
    query = args.get("query", "")
    results = self.rag.search_hybrid(query, k=3)
    if not results:
        return "(无命中)"
    blocks = []
    for i, (score, c) in enumerate(results, 1):
        blocks.append(f"[{i}] 来源={c.source} 相似度={score:.3f}\n{c.text}")
    return "\n\n---\n\n".join(blocks)
```

工具返回**纯文本字符串**——把 top-3 chunks 格式化得清楚（带来源、分数、内容）。模型接到这串文本后会自己 parse 出引用。

注意：**别返回结构化 JSON**给模型——LLM 处理自然文本比处理 JSON 更稳。

### RAGAgent.chat 循环

```python
def chat(self, user_input: str) -> str:
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
            ...  # 执行工具，append tool 结果
```

**这个循环跟 Bread Agent 的 chat 完全一样**——agent 的"内核"不变，唯一区别是工具集变了。

### system prompt 的微妙之处

```python
"你是 Bread 面包工坊的客服助理。当用户问任何具体业务问题时，**必须**先用 "
"search_knowledge_base 工具检索知识库，再基于检索结果回答；不要凭记忆/常识答业务问题。"
"回答时引用来源（如：[bread_workshop.md]）。"
"如果检索结果里没有答案，必须说『知识库里没有相关信息』，不要瞎编。"
```

3 条铁律：

1. **业务问题必须调工具**（防止 LLM 自我幻觉）
2. **必须引用来源**（提供可追溯性）
3. **检索无结果时不瞎编**（最重要的反幻觉规则）

工业级 RAG 系统的核心反幻觉防线就这 3 条。**你能掌握并强制 LLM 遵守它们，你的 RAG 就比 80% 的项目稳定。**

---

## 4. 卡住了怎么办

### ❌ Agent 不调工具，直接编了答案

通常是 system prompt 不够硬。再强化一遍："任何与公司/产品/政策相关的问题，**必须**先调 search_knowledge_base，不允许凭记忆回答"。

### ❌ Agent 调了工具但忽略结果，回答还是自我发挥

很罕见。如果发生，把 `description` 改成 "**严格基于此工具返回的内容回答，不允许补充任何额外信息**"。

### ❌ Agent 一直循环调工具不停

把 `MAX_STEPS` 调小（如 5）兜底。同时检查工具返回的格式——如果格式让 LLM 困惑，它会反复查。

### ❌ 多轮对话越聊越慢

每次调 API 都把整个 messages 列表发出去——Tokens 累积。生产环境会做"上下文压缩"（让 LLM 自己总结历史成一段）或"历史截断"（只保留最近 N 轮）。本课程不实现。

### ❌ Agent 的 search query 写得不好

模型有时会把用户原话直接当 query。可以在 system prompt 里加："改写用户问题为简洁的检索查询，去掉口语化、保留关键名词"。

---

## 5. 思考题

### 题 1：加 list_sources 工具

让 agent 主动列出可用文档：

```python
{
    "type": "function",
    "function": {
        "name": "list_knowledge_sources",
        "description": "列出当前知识库里的所有文档来源（文件名）。",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
},
```

实现 `RAGIndex.list_sources()` 返回唯一文件名列表。这样用户问"你们有什么资料"agent 能直接回答。

### 题 2：加权重 prompt

在 system prompt 里加："**优先**采信相似度 > 0.5 的结果；如果所有结果都 < 0.3，应该说'知识库里没有相关信息'。"

然后跟踪：是否 hallucination 减少了？

### 题 3：跟 Bread MCP 合体

把这章的 RAGAgent 改造成 MCP server：暴露 `search_knowledge_base` 作为 MCP 工具。然后任何 MCP client（Bread Agent / Claude Code / Cursor）都能用你的 RAG。

**这就是工业产品化路径**——把每一块能力 MCP 化，agent 通过协议组合各种工具。

---

## 6. 写在课程的最后

到这里你已经完成了 Bread 系列三课：

| 课程 | 你学会的 |
|---|---|
| Bread Agent | agent 循环、工具调用、钩子、持久化、子 agent |
| Bread MCP | JSON-RPC 协议、server/client、协议级集成 |
| **Bread RAG** | **切块、向量化、hybrid 检索、Agentic RAG** |

把三者合在一起——你写的代码量在 1500 行左右——就是一个**完整功能的企业级智能体**：

- 能持续多轮对话（Bread Agent）
- 能通过 MCP 接入任意外部工具（Bread MCP）
- 能基于私有知识库回答问题（Bread RAG）

这就是 2026 年初市面上大多数 "企业 AI 客服 / 内部助手 / 智能业务代理" 产品的底层架构。**你现在能从零搭起一份**。

### 下一步建议

1. **接你公司的真实知识库**（把 docs/ 换成实际产品手册、工单库、API 文档）
2. **接专业向量数据库**（Chroma / Qdrant / Milvus），替换 pickle
3. **加 watch 机制**（文档变化自动重建索引）
4. **多模态 RAG**（图片、表格、PDF 解析；用 multimodal embedding）
5. **GraphRAG**（用知识图谱增强 RAG，把"关系"也喂给 LLM）

祝玩得开心。

> —— Bread RAG 课程 · 知识星球

