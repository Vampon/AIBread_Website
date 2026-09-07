---
title: "第 3 章 · 真实工具集 MCP server"
slug: "bread-mcp-03-real_tools"
excerpt: "让工具即插即用。真实工具集 MCP server，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 35
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread MCP"
courseSlug: "mcp"
courseOrder: 2
chapter: 3
seriesOrder: 13
difficulty: 2
codeLines: 180
---
## 1. 故事：把 echo 换成真实工具

ch01 的 echo server 只是教学用——没人真的需要"回声"。这一章我们把它升级成 3 个真有用的工具，它们和 Bread Agent ch02 的工具一一对应：

| 工具 | 作用 |
|---|---|
| `read_file` | 读取文本文件内容 |
| `list_dir` | 列出目录下文件 |
| `get_time` | 返回当前系统时间 |

工程上的关键升级有 4 点：

1. **dispatch 表注册工具**（不再 if-elif 一堆）
2. **schema 和实现配对存放**（看 `TOOL_REGISTRY`）
3. **工具失败用 `isError=true` 返回**（不抛异常给协议）
4. **handler 也用 dict 分发**（看 `HANDLERS`）

`TOOL_REGISTRY` 就是 Bread Agent 里 TOOLS_IMPL + TOOLS_SCHEMA 的合体版——加新工具只用加一项 dict 项，主循环代码一行不用改。

文件结构：

```
ch03_real_tools/
├── server.py    # 真实工具集 server
├── client.py    # ch02 的 MCPClient（复用）
├── demo.py      # 演示脚本：连 server + 调 4 个用例
└── README.md
```

---

## 2. 跑起来

```
cd ch03_real_tools
python demo.py
```

预期输出：

```
已连接: bread-mcp-fs v0.1.0

--- list_tools ---
  read_file  读取一个文本文件的内容（超过 4000 字会截断）。
  list_dir   列出一个目录下的文件和子目录。
  get_time   返回服务器当前的本地时间（精确到秒）。

--- 调 get_time ---
  结果: 2026-05-17 23:01:23  (error=False)

--- 调 list_dir(.) ---
  结果:
FILE README.md
FILE client.py
FILE demo.py
FILE server.py

--- 调 read_file(README.md) ---
  前 200 字: # 第 3 章 ...

--- 调一个会出错的：read_file(不存在的文件) ---
  isError=True, 错误信息: FileNotFoundError: ...
```

最后一行**重点看**——工具执行报错时，server 没崩，而是返回了 `isError=true` + 错误说明。

---

## 3. 逐行精讲（server.py）

### 第 1 段：工具注册表

```python
TOOL_REGISTRY: dict[str, dict] = {
    "read_file": {
        "schema": {
            "name": "read_file",
            "description": "...",
            "inputSchema": {...},
        },
        "impl": tool_read_file,
    },
    ...
}
```

每一项有两部分：
- `schema`：给 MCP client 看的 JSON Schema（在 `tools/list` 时返回）
- `impl`：真正的 Python 函数（在 `tools/call` 时调用）

**为什么放在一起**？因为它们**必须配对修改**——schema 里说 `required: ["path"]`，impl 就得接收 path 参数；不一起改容易出 bug。这是个朴素但有效的工程约束。

### 第 2 段：`tools/list` 变简单了

```python
def handle_tools_list() -> dict:
    return {"tools": [t["schema"] for t in TOOL_REGISTRY.values()]}
```

一行。注册表里有什么就列什么。

### 第 3 段：`tools/call` 的优雅 dispatch + 错误处理

```python
def handle_tools_call(params):
    name = params.get("name")
    arguments = params.get("arguments", {}) or {}

    entry = TOOL_REGISTRY.get(name)
    if entry is None:
        raise ValueError(f"unknown tool: {name}")

    try:
        result = entry["impl"](**arguments)
        return {
            "content": [{"type": "text", "text": str(result)}],
            "isError": False,
        }
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"{type(e).__name__}: {e}"}],
            "isError": True,
        }
```

**关键点**：

- **"工具不存在"**：抛 ValueError → 协议层错误（JSON-RPC error 字段，code -32603）
- **"工具执行失败"**：捕获后返回 `isError=true` → **应用层错误**（JSON-RPC 响应是成功的，但 result 里有 isError 标记）

为什么要区分？因为 **agent 拿到工具错误**应该**继续工作**（读 isError → 把错误信息回喂给 LLM → 重试或换法）；但 **agent 拿到协议错误**就是 client 写错了（method 拼错之类），不应该假装"工具失败"。

**这跟 Bread Agent ch02 的"错误回喂"思想完全一致**——MCP 协议把它标准化了。

### 第 4 段：HANDLERS dict 取代 if-elif

```python
HANDLERS = {
    "initialize": lambda p: handle_initialize(p),
    "tools/list": lambda p: handle_tools_list(),
    "tools/call": lambda p: handle_tools_call(p),
}

# 主循环里：
handler = HANDLERS.get(method)
if not handler:
    send(...错误响应...)
    continue
result = handler(params)
```

加新协议方法只用加一项。`resources/list` / `resources/read` / `prompts/list` 等都可以这么扩。

---

## 4. 卡住了怎么办

### ❌ 调 `read_file` 报 `参数类型错误`

工具 schema 里说 `required: ["path"]`，但你没传 path——但我们没在 server 做 schema 校验。**生产级 MCP server 应当用 jsonschema 库校验**，教学版省了。可以作为思考题。

### ❌ 中文文件名读不到

`Path(path)` 在 Windows 上对中文路径正常，但你传的 path 字符串本身要是 UTF-8 编码。如果直接在 shell 里手敲中文，注意终端编码。

### ❌ `read_file` 返回的内容看不全

我们有 4000 字截断（防止把 client 上下文撑爆）。要看完整文件，改 `tool_read_file` 把 `if len(text) > 4000` 那段注释掉。

### ❌ 想加自己的工具

3 步：
1. 写一个普通 Python 函数
2. 在 `TOOL_REGISTRY` 加一项（schema + impl）
3. 重启 server——主循环代码不用改

---

## 5. 思考题

### 题 1：加 write_file 工具

学着加一个 `write_file(path, content)`。schema 里 required 是 `["path", "content"]`，impl 把内容写到文件（用 `pathlib.Path.write_text`）。

加完后用 demo.py 多调一个 `c.call_tool("write_file", path="test.txt", content="hello")` 验证。

### 题 2：用 jsonschema 校验参数

`pip install jsonschema`，然后在 `handle_tools_call` 调 impl 之前先校验：

```python
from jsonschema import validate, ValidationError

try:
    validate(arguments, entry["schema"]["inputSchema"])
except ValidationError as e:
    return {
        "content": [{"type": "text", "text": f"参数不合法: {e.message}"}],
        "isError": True,
    }
```

这样调用方传错参数会拿到清晰的错误，而不是 Python 的 TypeError。

### 题 3：暴露 resources

MCP 不只能暴露**工具**，还能暴露**资源**（文件、API 响应等可读对象）。给 server 加两个方法：

```python
"resources/list": lambda p: {"resources": [
    {"uri": "file:///cwd/", "name": "Current Directory", "mimeType": "inode/directory"},
]},
"resources/read": lambda p: {"contents": [
    {"uri": p["uri"], "mimeType": "text/plain", "text": "..."},
]},
```

跑 demo.py 时改成调 `c._request("resources/list")` 直接看效果。**这是 ch04 把 MCP 接到 Bread Agent 的下一步铺垫**。

---

## 这一章你学会了什么

- ✅ **TOOL_REGISTRY** 把 schema 和 impl 配对——加工具只加一项，主循环不动
- ✅ **协议错误 vs 应用错误**：方法不存在抛 JSON-RPC error；工具执行失败用 `isError=true`
- ✅ 用 dict + lambda 把 method dispatch 写得很优雅（**HANDLERS**）
- ✅ MCP 工具的错误处理思想 = Bread Agent 的"错误回喂"

**下一章 ch04（重头戏）**：把这个 server 接入 **Bread Agent**——让 agent 透明地调用 MCP 工具，就像它们是本地工具一样。**MCP 的价值在这一章才真正显形**。

