---
title: "第 1 章 · 最简 MCP server（echo 工具）"
slug: "bread-mcp-01-min_server"
excerpt: "让工具即插即用。最简 MCP server（echo 工具），边读边运行配套 Python 代码。"
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
chapter: 1
seriesOrder: 11
difficulty: 2
codeLines: 120
---
## 1. 故事：从 JSON-RPC 到 MCP

ch00 我们学了 JSON-RPC 2.0 的协议格式。MCP 在它之上做了一件事：**规定了一组方法名**。任何叫"MCP server"的程序，都要响应这几个固定方法：

| 方法 | 用途 |
|---|---|
| `initialize` | 握手。客户端和服务端交换协议版本、各自支持的能力 |
| `tools/list` | 列出我有哪些工具 |
| `tools/call` | 调用一个工具 |
| `resources/list` / `resources/read` | （进阶）暴露文件等资源 |
| `prompts/list` / `prompts/get` | （进阶）暴露 prompt 模板 |

这一章我们实现**最基础的 3 个**：`initialize` / `tools/list` / `tools/call`。

服务端只提供一个工具叫 `echo`——把传入的字符串原样回声出来。**重点不在工具有多牛，重点在让你看见协议消息的真实形态**。

下一章 ch02 我们会写 client 把这一切自动化；本章先**手工**跟服务器对话，让你看清每一条 JSON 来去。

---

## 2. 跑起来

```
cd ch01_min_server
python test_by_hand.py
```

`test_by_hand.py` 会：
1. spawn `server.py` 当子进程
2. 手工依次发 5 条请求（initialize / initialized notification / tools/list / tools/call echo / 一条错的）
3. 把每一条请求和响应都打印出来
4. 最后打印 server 的 stderr 日志

预期输出大致：

```
--> {"jsonrpc": "2.0", "id": 1, "method": "initialize", ...}
<-- {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05",...}}

--> {"jsonrpc": "2.0", "method": "notifications/initialized"}

--> {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
<-- {"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"echo",...}]}}

--> {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "echo", ...}}
<-- {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"echo: 你好 MCP"}],...}}

--> {"jsonrpc": "2.0", "id": 4, "method": "no_such_method"}
<-- {"jsonrpc":"2.0","id":4,"error":{"code":-32601,...}}

=== server 退出，返回码 = 0
=== server stderr ===
[server] started, protocol=2024-11-05
[server] initialize from test-by-hand 0.1.0
...
```

![image-20260610181711531](/tutorials/bread-ai-from-scratch/image-20260610181711531.png)

**这 5 次往返就是 MCP 协议的全部基础**。看明白了你就出师了。

---

## 3. 逐行精讲（server.py）

### 第 1 段：协议元信息

```python
PROTOCOL_VERSION = "2024-11-05"   # MCP 协议版本字符串
SERVER_NAME = "bread-mcp-echo"
SERVER_VERSION = "0.1.0"
```

`PROTOCOL_VERSION` 是 MCP 规范定的字符串（不是日期就能随便填）。`SERVER_NAME` / `SERVER_VERSION` 由你自己起。

### 第 2 段：日志写 stderr（不能写 stdout！）

```python
def log(msg: str):
    sys.stderr.write(f"[server] {msg}\n")
    sys.stderr.flush()
```

**全章最容易踩的坑**：MCP 用 stdout 传协议消息。如果你 `print("hello")` 一下，那串"hello"会跟协议 JSON 混在一起，client 解析时崩溃。

**所有日志、调试输出都必须走 stderr**。

### 第 3 段：发送/接收

```python
def send(obj: dict):
    line = json.dumps(obj, ensure_ascii=False)
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


def recv() -> dict | None:
    line = sys.stdin.readline()
    if not line:
        return None              # EOF
    return json.loads(line.strip())
```

跟 ch00 一样——就是按行 JSON。`flush()` 关键。

### 第 4 段：工具的"业务函数"和"schema 描述"

```python
def tool_echo(text: str) -> str:
    return f"echo: {text}"

TOOLS = [{
    "name": "echo",
    "description": "...",
    "inputSchema": {
        "type": "object",
        "properties": {"text": {"type": "string"}},
        "required": ["text"],
    },
}]
```

工具有**两个面**：业务实现 + 给外部看的 schema。**这一点 Bread Agent 学过——TOOLS_IMPL 和 TOOLS_SCHEMA**。MCP 里也一样，只是字段名叫 `inputSchema`（不是 `parameters`）。

### 第 5 段：3 个协议方法的处理函数

```python
def handle_initialize(params):
    return {
        "protocolVersion": PROTOCOL_VERSION,
        "capabilities": {"tools": {}},
        "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
    }
```

`capabilities.tools = {}` 表示"我提供工具能力"。空 dict 即可——里面可以加 `listChanged: true` 等子能力声明（进阶用法）。

```python
def handle_tools_list():
    return {"tools": TOOLS}
```

直接返回 schema 列表。

```python
def handle_tools_call(params):
    name = params.get("name")
    arguments = params.get("arguments", {})
    if name == "echo":
        result_text = tool_echo(**arguments)
        return {
            "content": [{"type": "text", "text": result_text}],
            "isError": False,
        }
    raise ValueError(f"unknown tool: {name}")
```

**注意 `content` 是个数组**——每项可以是 `{"type": "text", "text": "..."}` 或 `{"type": "image", "data": "...", "mimeType": "..."}` 等。MCP 工具结果是多模态的。

### 第 6 段：主循环

```python
while True:
    req = recv()
    if req is None: break        # EOF, exit

    method = req.get("method")
    req_id = req.get("id")       # 通知没有 id

    if method == "notifications/initialized":
        continue                  # 通知，不返回响应

    try:
        if method == "initialize":   result = handle_initialize(params)
        elif method == "tools/list":  result = handle_tools_list()
        elif method == "tools/call":  result = handle_tools_call(params)
        else:
            send({"jsonrpc": "2.0", "id": req_id,
                  "error": {"code": -32601, "message": f"Method not found: {method}"}})
            continue

        send({"jsonrpc": "2.0", "id": req_id, "result": result})

    except Exception as e:
        send({"jsonrpc": "2.0", "id": req_id,
              "error": {"code": -32603, "message": str(e)}})
```

**整个 server 就是这个 while 循环**。读一条 → dispatch → 写一条。死循环直到 stdin 关闭（EOF）。

---

## 4. 卡住了怎么办

### ❌ `JSONDecodeError` 在 client 端

99% 是 server 不小心 `print` 了什么到 stdout。检查你的代码里所有 `print(...)`——通通改成 `log(...)`（写 stderr）。

### ❌ server 启动后卡住不动

正常。MCP server 默认就是"等 stdin 输入"的状态——你直接 `python server.py` 跑它，它会卡在 `sys.stdin.readline()`。要看它干活，**必须有 client 通过 stdin 喂它**。用 `test_by_hand.py` 测它。

### ❌ Ctrl+C server 不退出

服务端在 `sys.stdin.readline()` 阻塞时按 Ctrl+C 行为各异。直接关掉父进程 `test_by_hand.py`，server 子进程会因为 stdin 关闭收到 EOF 而退出。

### ❌ 通知（initialized）发了好像没动静

对，通知就是"无需响应"。看 server stderr 日志能看到它确实处理了。

### ❌ MCP 协议版本对不上

`PROTOCOL_VERSION = "2024-11-05"` 是 MCP 草案的某个固定字符串。如果某天你接其他 server / client 报"版本不匹配"，把它升到对方支持的版本（spec 公开）。

---

## 5. 思考题

### 题 1：加第二个工具

加一个工具叫 `now`，无参数，返回当前系统时间字符串。要做的：

1. 写 `tool_now()` 函数
2. 把它加进 `TOOLS` 列表（参数 schema 写 `{"type": "object", "properties": {}, "required": []}`）
3. 在 `handle_tools_call` 里加分支

跑 `test_by_hand.py` 时手动多发一条 `tools/call name=now` 验证。

### 题 2：参数校验

如果用户调 `echo` 但不传 `text`，目前我们会抛 TypeError。改成：检测参数缺失时返回**正确的 JSON-RPC 错误**（code = -32602 "Invalid params"）。

### 题 3：MCP Inspector 实战

去 https://github.com/modelcontextprotocol/inspector 装官方的 Inspector 工具，让它连你的 server：

```
npx @modelcontextprotocol/inspector python ch01_min_server/server.py
```

如果连得上、能在 UI 里看到你的 `echo` 工具并调用——**恭喜你写的是合规的 MCP server**，市面上任何 MCP client（Cursor、Claude Code、Continue.dev 等）都能用它。

---

## 这一章你学会了什么

- ✅ MCP server = JSON-RPC 死循环 + 3 个协议方法
- ✅ `initialize` 握手交换 protocolVersion + capabilities + serverInfo
- ✅ 工具描述用 `inputSchema`（不是 Bread Agent 的 `parameters`）
- ✅ 工具结果用 `content` 数组（支持多模态）
- ✅ **日志必须写 stderr，stdout 留给协议**

**下一章 ch02**：把 `test_by_hand.py` 升级成正规的 `class MCPClient`——封装连接生命周期、自动维护 request id、支持任意工具调用。

