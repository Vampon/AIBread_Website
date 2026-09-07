---
title: "第 2 章 · 最简 MCP client + 完整握手"
slug: "bread-mcp-02-min_client"
excerpt: "让工具即插即用。最简 MCP client + 完整握手，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread MCP"
courseSlug: "mcp"
courseOrder: 2
chapter: 2
seriesOrder: 12
difficulty: 2
codeLines: 120
---
## 1. 故事：把"手工对话"封装成一个类

ch01 的 `test_by_hand.py` 把所有逻辑堆在一个 `main()` 里：开子进程、发请求、读响应、手动维护 id... 写一次行，要复用就乱套。

这一章我们把它升级成 `class MCPClient`——封装成正经"基础设施"。用起来就像这样：

```python
with MCPClient([sys.executable, "server.py"]) as client:
    tools = client.list_tools()
    result = client.call_tool("echo", text="hello")
```

干净。**这个类下一章 ch04 接入 Bread Agent 时直接拿来用**——它就是连接 agent 世界与 MCP 世界的桥。

文件结构：

```
ch02_min_client/
├── server.py    # 跟 ch01 一样的 echo server，搬过来让本章独立可跑
├── client.py    # 本章的核心
└── README.md
```

---

## 2. 跑起来

```
cd ch02_min_client
python client.py
```

预期输出：

```
已连接 server: {'name': 'bread-mcp-echo', 'version': '0.1.0'}
server 能力: {'tools': {}}

--- 工具列表 ---
  echo: 把传入的字符串原样回声出来，前面加上 'echo: ' 前缀。

--- 调用 echo ---
  结果: echo: 你好 MCP

--- 再调一次 ---
  结果: echo: Hello again
```

![image-20260610211346727](/tutorials/bread-ai-from-scratch/image-20260610211346727.png)

看到这 4 段就算通过。client.py 内部 spawn 了 server.py 子进程，做完握手、列工具、调工具、关闭——一气呵成。

---

## 3. 逐行精讲（client.py）

### 第 1 段：构造函数 + 状态

```python
class MCPClient:
    def __init__(self, server_command: list[str]):
        self.server_command = server_command       # 比如 ["python", "server.py"]
        self.proc: subprocess.Popen | None = None  # 子进程句柄
        self._next_id = 1                          # 自动 id 计数器
        self.server_info: dict = {}                # 握手后填入
        self.server_capabilities: dict = {}
```

`server_command` 是一个 list（subprocess.Popen 的标准用法），第一个元素是可执行程序，后面是参数。

### 第 2 段：with 语法支持

```python
def __enter__(self):
    self.connect()
    return self

def __exit__(self, *exc):
    self.close()
```

定义这两个魔法方法后，`with MCPClient(...) as client:` 就能用了——自动 connect、出 with 块自动 close。**对新手友好**，避免忘了清理子进程。

### 第 3 段：connect() —— 握手

```python
def connect(self):
    self.proc = subprocess.Popen(
        self.server_command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding="utf-8",       # ★ 关键，避免中文乱码
        bufsize=1,              # 行缓冲，每行立即可读
    )

    # 1) initialize
    init_result = self._request("initialize", {
        "protocolVersion": PROTOCOL_VERSION,
        "capabilities": {},
        "clientInfo": {"name": CLIENT_NAME, "version": CLIENT_VERSION},
    })
    self.server_info = init_result.get("serverInfo", {})
    self.server_capabilities = init_result.get("capabilities", {})

    # 2) 通知 server 握手完成
    self._notify("notifications/initialized")
```

MCP 协议规定**完整握手是两步**：
1. client 发 `initialize` 请求，server 返回它的版本和能力
2. client 发 `notifications/initialized` 通知（无 id、无响应），告诉 server "我准备好了，你可以开始干活了"

**很多新手只做第一步漏掉第二步**——某些严格的 MCP server 会拒绝在 initialized 通知前响应 `tools/call`。

### 第 4 段：`_request` —— 自动 id + 错误检查

```python
def _request(self, method, params=None) -> dict:
    req_id = self._next_id
    self._next_id += 1
    req = {"jsonrpc": "2.0", "id": req_id, "method": method}
    if params is not None:
        req["params"] = params
    self._write(req)

    resp = self._read()
    if resp.get("id") != req_id:
        raise RuntimeError(f"id 不匹配: 发 {req_id}，收 {resp.get('id')}")

    if "error" in resp:
        err = resp["error"]
        raise RuntimeError(f"server error {err.get('code')}: {err.get('message')}")

    return resp.get("result", {})
```

每次自增 id，发出去后立即读响应。**id 校验**确保不会拿到串场的旧响应。**error 自动 raise**——调用方不用手工检查。

### 第 5 段：close() —— 优雅退出

```python
def close(self):
    if not self.proc:
        return
    try:
        self.proc.stdin.close()      # 关 stdin → server 收到 EOF → server 自己退出
        self.proc.wait(timeout=5)
    except Exception:
        self.proc.kill()
    self.proc = None
```

**优雅退出的关键**：关掉 server 的 stdin。MCP server 的主循环读 stdin 死循环，stdin 关闭后 `readline()` 返回空字符串，server 自然退出。

`wait(timeout=5)` 给 server 5 秒收尾时间。还不退就 `kill()` 强杀。

### 第 6 段：高层 API

```python
def list_tools(self) -> list[dict]:
    return self._request("tools/list").get("tools", [])

def call_tool(self, name: str, **arguments) -> str:
    result = self._request("tools/call", {"name": name, "arguments": arguments})
    if result.get("isError"):
        return f"[tool error] " + ...
    return "".join(c.get("text", "") for c in result.get("content", []) if c.get("type") == "text")
```

注意 `call_tool` 用 `**arguments` 接受任意关键字参数——调用方写法很自然：

```python
client.call_tool("echo", text="hello", repeat=3)
```

返回时把 `content` 数组里所有 `type=text` 的项拼起来。**忽略 image/audio 等**——教学版只关心文本工具。

---

## 4. 卡住了怎么办

### ❌ `id 不匹配`

通常是 server 在异步发了什么消息（progress notification 之类）。我们这个简化版没处理那些；ch01/ch02 的 server 不会主动发消息所以不会触发。

### ❌ client.py 跑完后 server 进程还在系统里

`close()` 没正确执行（被异常跳过）。用 `with` 语法可以避免——出 with 块自动调 close。

### ❌ `RuntimeError: server 提前关闭 stdout`

server 崩了。**最常见**是 server 不小心 `print(...)` 到 stdout 污染协议，client 解析时崩。把 server 的所有 print 改成写 stderr。

### ❌ Windows 下 subprocess.Popen 中文路径报错

Python 3.8+ 的 subprocess 默认支持 UTF-8 路径名。如果还是出问题，用 ASCII 路径放代码。

### ❌ `encoding="utf-8"` 不生效，依然乱码

确认 server.py 也加了 `sys.stdout.reconfigure(encoding="utf-8")`。**两边都要 UTF-8**才行——Python subprocess 的 encoding 是"我把字节按 utf-8 解码"，但 server 写出来的得真的是 UTF-8 才行。

---

## 5. 思考题

### 题 1：超时控制

`_read()` 一直阻塞等响应。如果 server 卡死了 client 也会卡。给 `_request` 加一个 `timeout=10` 参数——用 `select` / `threading.Timer` 实现"超时未响应就 raise"。

提示：Windows 上 `select` 不支持 pipe，所以这题对跨平台不简单。最简单的做法是单独开个读 thread + Queue。

### 题 2：连真的 MCP server

去找一个**别人写的**官方 MCP server 跑跑看，比如：

```bash
npx -y @modelcontextprotocol/server-filesystem /tmp
```

然后用我们的 MCPClient 连它：

```python
with MCPClient(["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"]) as c:
    print(c.list_tools())
```

如果能列出 `read_file`、`write_file` 等工具——**说明你写的 client 是合规的**，能用社区任何 MCP server。

### 题 3：扩展支持 resources

MCP 除了工具还有"资源"概念——`resources/list`、`resources/read`。给 MCPClient 加两个方法：

```python
def list_resources(self) -> list[dict]:
    return self._request("resources/list").get("resources", [])

def read_resource(self, uri: str) -> str:
    return self._request("resources/read", {"uri": uri})
```

我们 ch01 的 server 没实现这俩，调会报 `Method not found`——这是预期的。

---

## 这一章你学会了什么

- ✅ MCP 完整握手 = `initialize` + `notifications/initialized` 两步
- ✅ `subprocess.Popen` + `encoding="utf-8"` + `bufsize=1` 跟子进程做行级 stdio 通信
- ✅ class + `__enter__`/`__exit__` 让资源管理自动化
- ✅ id 自增 + id 校验 + error 自动 raise = 健壮的 RPC 调用

**下一章 ch03**：把 server 从"只有 echo"扩展到真实工具集（read_file / list_dir / get_time），看真正的工业级 MCP server 长什么样。

