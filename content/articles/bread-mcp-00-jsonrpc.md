---
title: "第 0 章 · JSON-RPC 2.0 入门 + stdio 通信"
slug: "bread-mcp-00-jsonrpc"
excerpt: "让工具即插即用。JSON-RPC 2.0 入门 + stdio 通信，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 20
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread MCP"
courseSlug: "mcp"
courseOrder: 2
chapter: 0
seriesOrder: 10
difficulty: 1
codeLines: 40
---
## 1. 故事：MCP 是套在 JSON-RPC 上的一身衣服

MCP 这个协议听起来很高大上，但它的**地基**只是个老古董——**JSON-RPC 2.0**，2010 年的标准。如果你听过 JSON-RPC，那 MCP 对你来说就是 "在 JSON-RPC 里规定了一组方法名"，仅此而已。

这一章我们什么 MCP 都不讲，只讲清楚 JSON-RPC 2.0 长什么样、stdin/stdout 怎么传消息。整章一行 import 都不需要、只用标准库 `json`——就是为了让你直观感受到："哦 网络协议没那么神秘，就是俩程序按规定格式发字符串而已"。

---

## 2. 跑起来

```
cd ch00_jsonrpc
python main.py
```

你会看到一段格式化打印，展示：

```
============================================================
一条 JSON-RPC 请求长这样：
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "add",
  "params": { "a": 3, "b": 5 }
}

============================================================
成功响应：
{ "jsonrpc": "2.0", "id": 1, "result": 8 }

失败响应：
{ "jsonrpc": "2.0", "id": 1, "error": {...} }

...
```

![image-20260610180950876](/tutorials/bread-ai-from-scratch/image-20260610180950876.png)

看明白就行。这一章没有"输出对就算通过"的硬性要求——目的是建立直觉。

---

## 3. 逐行精讲

### 一条 JSON-RPC 请求的 4 个字段

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "add",
  "params": { "a": 3, "b": 5 }
}
```

| 字段 | 含义 |
|---|---|
| `jsonrpc` | **固定**是字符串 `"2.0"`。表示这是 JSON-RPC 2.0 |
| `id` | 调用方自己给的"流水号"。可以是数字或字符串。响应会带上**同一个 id** 让你知道是哪个请求的答复 |
| `method` | 你想调的方法名 |
| `params` | 参数。可以是 dict (`{"a": 3, "b": 5}`) 也可以是 list (`[3, 5]`) |

### 成功响应只有 3 个字段

```json
{ "jsonrpc": "2.0", "id": 1, "result": 8 }
```

注意 `id` 必须**等于**请求的 id——这就是"请求和响应配对"的凭据。

### 失败响应也只有 3 个字段，但 result 换成 error

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": "..."   // 可选，额外信息
  }
}
```

`error.code` 有 5 个标准值（见代码顶部 `ERROR_CODES` 字典）。

### stdio 传输：一行一个 JSON

JSON-RPC 协议本身**不规定**传输方式（你可以用 HTTP、WebSocket、stdio、命名管道……都行）。MCP 用 stdio：**把 JSON 序列化成字符串，每行一条，写到 stdout / 读 stdin**。

```python
def send(obj: dict):
    line = json.dumps(obj, ensure_ascii=False)
    sys.stdout.write(line + "\n")
    sys.stdout.flush()                # ← 不 flush 可能卡在缓冲区，对端读不到

def recv_from_stdin() -> dict:
    line = sys.stdin.readline()
    return json.loads(line.strip())
```

**这 7 行就是 MCP 通信的全部底层**。下一章 ch01 我们就在这之上盖 MCP 的"上层建筑"。

### 通知（Notification）—— 一个补充

JSON-RPC 还有个"通知"概念：**不带 id 的请求**。发送方不期待响应。MCP 里有少数几个方法是通知形态（比如初始化完成的 `initialized`）——下章会见到。

---

## 4. 卡住了怎么办

### ❌ 输出乱码

Windows 上常见。我们的 main.py 没强制 UTF-8（演示性脚本，简单点）。如果乱码，临时设个环境变量：

```
set PYTHONIOENCODING=utf-8
python main.py
```

### ❌ "JSON-RPC 跟 REST API 啥区别"

简化版回答：
- REST 用 HTTP 动词 + URL 表达"做什么 + 对什么做"
- JSON-RPC 用 method 字段直接表达"调哪个函数"
- REST 是面向资源，JSON-RPC 是面向远程函数调用

两者各有适用场景。**MCP 选 JSON-RPC 是因为它更接近"调用函数"的心智**——这跟 LLM tool calling 是一个抽象层。

---

## 5. 思考题

### 题 1：错误码

把 `request` 字典里 `"method": "add"` 改成 `"method": "subtract"`，然后假设服务端没实现 subtract，写出应该返回的错误响应 dict（参考 `error_response`）。

### 题 2：批量请求

JSON-RPC 2.0 支持一次发**一个数组**装多个请求，服务端返回一个数组装多个响应。**手动构造**一个数组装 2 个请求（一个加法、一个乘法），打印出来。

### 题 3：通知

写出一条"通知"形态的 JSON-RPC 消息（不带 id），方法名是 `cancel`，参数是 `{"task_id": 42}`。这是 MCP 里取消进行中任务的标准姿势。

---

## 这一章你学会了什么

- ✅ JSON-RPC 2.0 请求 / 响应 / 错误的标准字段
- ✅ stdio 通信：一行一个 JSON
- ✅ id 是请求-响应配对的凭据
- ✅ 5 个标准错误码（-32600 ~ -32700）
- ✅ 通知 = 不带 id 的请求（fire-and-forget）

**下一章 ch01**：在 JSON-RPC 之上盖 MCP 的"上层建筑"——实现 `initialize` / `tools.list` / `tools.call` 三个 MCP 标准方法，让任何 MCP client 都能调你的服务器。

