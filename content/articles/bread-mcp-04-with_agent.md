---
title: "第 4 章 · 把 MCP server 接到 Bread Agent"
slug: "bread-mcp-04-with_agent"
excerpt: "让工具即插即用。把 MCP server 接到 Bread Agent，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 45
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread MCP"
courseSlug: "mcp"
courseOrder: 2
chapter: 4
seriesOrder: 14
difficulty: 3
codeLines: 250
---
## 1. 故事：让 agent 从一无所知到"我用谁的工具"

回想 Bread Agent ch02——所有工具是这样的：

```python
TOOLS_IMPL = {
    "read_file": read_file,     # 本地 Python 函数
    "write_file": write_file,
    ...
}
```

这意味着：
- 工具的代码 **必须在 agent 进程内**
- 加新工具 **必须改 agent 源码**
- 工具不能是别的语言写的
- 工具不能跑在别的机器上

MCP 解决的就是这件事。本章的 Agent 启动时：

```
1. 启动一个 MCP server 子进程（可以是任意语言写的任意 server）
2. 通过协议向它问："你有哪些工具？参数长啥样？"
3. 把拿到的 schema 翻译成 OpenAI 的格式给 LLM
4. LLM 想调工具 → 我们通过协议远程调用 → 把结果带回
```

**Agent 代码里完全没有 read_file 这个名字**——它只是一个动态拉到的字符串。

```
┌──────────────────┐                ┌────────────────────┐
│   Bread Agent    │   stdio MCP    │   MCP server       │
│  + MCPClient     │ ◄────────────► │  (任意进程/语言)    │
│                  │                │  read_file/list/...│
└──────────────────┘                └────────────────────┘
       ↑                                     ↑
   主进程跑                            子进程跑（也可以是远程）
```

把这一章跑通，你就拥有了"agent 通用工具网关"的能力——**任何符合 MCP 协议的 server，都能立刻被你的 agent 使用**。

---

## 2. 跑起来

```
cd ch04_with_agent
python main.py
```

> 本章需要 `.env`。如果你做过 Bread Agent，main.py 已经写好了回退逻辑——会自动找 `bread-agent/.env`。否则在 `bread-mcp/.env` 配。

启动后：

```
已连接 MCP server: bread-mcp-fs v0.1.0

[agent] 已发现 3 个 MCP 工具: get_time, list_dir, read_file

Bread MCP × Bread Agent · v1
输入消息开始对话；Ctrl+C 退出。

你 > 现在几点
  [step 0] mcp.call_tool get_time({})
  [step 0] -> 2026-05-18 09:15:42
AI > 现在是 2026 年 5 月 18 日 09:15:42。

你 > 列出当前目录都有什么
  [step 0] mcp.call_tool list_dir({'path': '.'})
  [step 0] -> DIR  __pycache__
FILE README.md
FILE agent.py
...
AI > 当前目录下有 5 个文件...
```

**仔细看那两行 `mcp.call_tool`** —— 这是 agent 通过 MCP 协议远程调用工具的证明。工具的真实代码跑在 `server.py` 子进程里，agent 一无所知。

---

## 3. 逐行精讲

### 文件结构

```
ch04_with_agent/
├── server.py    # ch03 的 fs server（搬来一份）
├── client.py    # MCPClient（搬来一份）
├── agent.py    # ★ 本章核心：把 MCPClient 接入 OpenAI agent
├── main.py     # REPL 入口
└── README.md
```

### `agent.py` 第 1 段：schema 翻译

MCP 和 OpenAI 的工具 schema **格式略有不同**：

| MCP | OpenAI |
|---|---|
| `{name, description, inputSchema}` | `{type: "function", function: {name, description, parameters}}` |
| `inputSchema` | `parameters` |

`mcp_schema_to_openai_tool` 就一个翻译函数：

```python
def mcp_schema_to_openai_tool(mcp_tool: dict) -> dict:
    return {
        "type": "function",
        "function": {
            "name": mcp_tool["name"],
            "description": mcp_tool.get("description", ""),
            "parameters": mcp_tool.get("inputSchema", {"type": "object", "properties": {}}),
        },
    }
```

**就这样**。MCP 的 inputSchema 本来就是 JSON Schema，OpenAI 的 parameters 也是 JSON Schema——内核完全一样。

### `agent.py` 第 2 段：Agent 构造时拉工具

```python
class Agent:
    def __init__(self, mcp: MCPClient):
        ...
        mcp_tools = self.mcp.list_tools()                                # 远程问 server
        self.tools_openai = [mcp_schema_to_openai_tool(t) for t in mcp_tools]  # 翻译
        self.tool_names = {t["name"] for t in mcp_tools}
```

**Agent 不知道有哪些工具**——它问 server 才知道。这就是动态。

### `agent.py` 第 3 段：调工具用远程调用

跟 Bread Agent ch02 的对比：

```python
# Bread Agent ch02:
result = TOOLS_IMPL[name](**args)            # 本地函数调用

# 本章:
result = self.mcp.call_tool(name, args)      # 远程 MCP 调用
```

**一行变化**。但内涵差别巨大——后者意味着 args 通过 JSON 走管道、跨进程、被 server 接收、被 server 执行、结果再 JSON 回来。

整个 chat 主循环跟 Bread Agent ch02 一模一样——agent loop 本身不依赖工具实现方式。

### `main.py`：MCPClient 的生命周期

```python
with MCPClient(server_cmd) as mcp:
    agent = Agent(mcp)
    while True:
        user_input = input("你 > ")
        agent.chat(user_input)
```

`with` 语法保证 server 子进程**进 with 块时启动、出 with 块时关闭**。Ctrl+C 退出会自动触发清理。

---

## 4. 卡住了怎么办

### ❌ `KeyError: 'OPENAI_API_KEY'`

`.env` 没找到。main.py 已经尝试了两处：
- `bread-mcp/.env`
- 兜底 `../bread-agent/.env`

都没的话，复制 `.env.example` 到 `bread-mcp/.env`，填 key。

### ❌ agent 启动后立即 `RuntimeError: server 提前关闭 stdout`

server.py 写了什么到 stdout 但不是合法 JSON-RPC。常见原因：
- server.py 里有 `print(...)` 没改成 `log(...)`
- server.py 进程加载时报错（比如 import 失败），错误信息被打到 stdout

试试单独跑 `python server.py`，然后 Ctrl+C；正常应该只看到 `[server] started, tools=[...]` 这行 stderr。

### ❌ "[step 0] mcp.call_tool xxx" 看不到打印

可能你的 PowerShell 把子进程 stderr 吞了。试试在 main.py 里把 print 直接做出来。或者用 `python main.py 2>&1` 强制合并。

### ❌ LLM 不调工具，直接编一个答案

模型有时偷懒。强化 system prompt："**任何**关于当前文件、目录、时间的问题，**必须**调工具获取真实信息，不要编造。"

### ❌ Windows 上 list_dir 给的路径有反斜杠 agent 看不懂

正常。Windows 路径 `D:\Project\...` 在 JSON 里会被转义成 `D:\\Project\\...`。LLM 完全能理解。**反过来**，你给 list_dir 传路径时也可以用正斜杠：`D:/Project/...`，pathlib 都支持。

---

## 5. 思考题

### 题 1：用社区写的 MCP server

去试一下官方 filesystem server：

```bash
npx -y @modelcontextprotocol/server-filesystem D:\Project
```

然后改 `main.py` 的 `server_cmd`：

```python
server_cmd = ["npx", "-y", "@modelcontextprotocol/server-filesystem", r"D:\Project"]
```

跑一遍——你的 Bread Agent **完全没改一行代码**，就能用别人写的、用 TypeScript 写的工具。**这就是 MCP 的价值**。

### 题 2：多 MCP server 同时接

现在 Agent 只连一个 MCP server。改成 `Agent(mcp_clients: list[MCPClient])`，把多个 server 的工具合并成一个统一工具表，按工具名记录"哪个 server 提供它"。LLM 调时路由到正确的 server。

**生产场景**：一个 agent 同时连 filesystem-mcp + git-mcp + sqlite-mcp。

### 题 3：把 Bread Agent 的钩子搬过来

把 Bread Agent ch06 的钩子系统集成进本章 agent——在 `mcp.call_tool` 前后触发钩子。比如做"远程工具调用前先 y/N 确认"。

**理解**：钩子和 MCP 是正交概念，可以叠加。这就是工程化分层。

---

## 这一章你学会了什么

- ✅ **MCP schema → OpenAI tool schema** 的字段映射（一个简单 dict 转换）
- ✅ Agent 启动时**动态拉工具清单**（不再硬编码）
- ✅ 工具调用从 `TOOLS_IMPL[name](**args)` 变成 `mcp.call_tool(name, args)`
- ✅ **agent loop 本身不变**——工具实现方式是可替换的细节
- ✅ MCP 让你能用任何语言写的、任何机器上跑的工具

**下一章 ch05（终章）**：写一个 SQLite MCP server，让 agent 真能查数据库——这是 MCP 最具实用价值的场景。

