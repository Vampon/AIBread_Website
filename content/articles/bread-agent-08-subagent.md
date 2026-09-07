---
title: "第 8 章 · 子 Agent（终章）"
slug: "bread-agent-08-subagent"
excerpt: "让模型开始动手。子 Agent（终章），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 45
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Agent"
courseSlug: "agent"
courseOrder: 1
chapter: 8
seriesOrder: 9
difficulty: 3
codeLines: 540
---
## 1. 故事：把 agent 自己当成一个工具

到现在我们的 agent 已经会读文件、写文件、跑 shell、能多轮聊、能持久化。但有一类任务它处理得吃力：**调研类**。

> 用户："分析一下这个项目的结构，说说每个 Python 文件大概是做什么的"

主 agent 要做这事，会：
1. 调 `list_dir` 看目录
2. 调 `read_file` 读 main.py
3. 调 `read_file` 读 agent.py
4. 调 `read_file` 读 tools.py
5. ... 读 6 个文件
6. 把所有读到的内容整合后回答你

**问题在于**：6 个文件的全部内容都被 append 到了主 messages 里——上下文窗口被塞满，后续对话越来越慢、越来越贵。如果你接着问"刚才那个 README 第三行写了什么"，主 agent 还得在 6 个文件混着各种 tool 调用历史的 messages 里翻——又慢又乱。

更好的做法：**把这个调研任务外包给一个轻量子 agent**。

```
   你
    │
    ▼
┌────────────────────────┐
│   主 Agent              │  工具集: read/write/list/shell/spawn_research_agent
│                        │
│   决定调研 ─────┐       │
└─────────────────┼──────┘
                  │
                  ▼
        ┌───────────────────────┐
        │   子 Agent (research)  │  工具集: 只能 read_file / list_dir（受限）
        │                       │
        │   ... 循环 ...         │
        │   ... 返回 200 字报告  │
        └────────┬──────────────┘
                  │
                  ▼
            字符串报告 回填到主 agent 的 messages
```

主 agent 只看到一段 200 字的报告，**而不是 6 个文件的全文**。上下文干净。

---

## 2. 跑起来

```
cd ch08_subagent
python main.py
```

启动后试这一题：

```
你 > 分析一下当前目录里都有什么 Python 文件，每个文件是做什么的
```

预期输出大致如下：

```
  [hook:log] 即将调用 spawn_research_agent 参数={'question': '分析当前目录下的 Python 文件...'}

  ┌─ [subagent] 开始调研: 分析当前目录下的 Python 文件...
  │ [subagent] list_dir({'path': '.'})
  │ [subagent] read_file({'path': 'agent.py'})
  │ [subagent] read_file({'path': 'tools.py'})
  │ [subagent] read_file({'path': 'subagent.py'})
  └─ [subagent] 调研完成 (480 chars)

AI > 当前目录有 6 个 Python 文件：
- main.py: REPL 入口
- agent.py: Agent 类的核心实现
- tools.py: 工具定义
- subagent.py: 子 agent 实现
- hooks.py: 钩子系统
- session.py: 会话持久化
```

关键观察：

- 主 agent 自己**只调了 1 次工具**（`spawn_research_agent`）
- 子 agent 在 `┌─...└─` 里**自己内部循环调了多次**工具
- 主 agent 拿到的只有一段简洁的报告，**主 messages 没被 6 个文件全文撑爆**

---

## 3. 逐行精讲

### 整体结构

```
ch08_subagent/
├── main.py          # REPL（跟 ch07 几乎一样，多了一行注入）
├── agent.py         # 主 Agent（跟 ch07 一样）
├── tools.py         # 新增 spawn_research_agent schema
├── subagent.py      # ★★★ 本章核心：子 Agent 实现
├── hooks.py
└── session.py
```

### `subagent.py` —— 整章的灵魂

#### 第 1 段：受限工具集

```python
SUB_TOOLS_SCHEMA = [
    {"type": "function", "function": {"name": "read_file", ...}},
    {"type": "function", "function": {"name": "list_dir", ...}},
]

SUB_TOOLS_IMPL = {
    "read_file": _ALL_IMPL["read_file"],
    "list_dir": _ALL_IMPL["list_dir"],
}
```

**注意**：这里**故意没有** `write_file` / `run_shell` / `spawn_research_agent`。子 agent **不能写盘、不能跑命令、不能再 spawn 孙 agent**。

#### 第 2 段：子 agent 自己的 persona

```python
SUB_PERSONA = """你是一个只读调研子助手，专门帮主助手回答调研类问题。

工作风格：
- 你只能 read_file 和 list_dir，不要尝试任何其他工具
- 主动多读几个相关文件再下结论
- 用一段简短的中文报告回答主助手的问题（不超过 200 字）
- 不要询问主助手，自己拿主意
"""
```

跟主 agent 的 persona 不一样——它是**为子任务定制**的。

#### 第 3 段：子 agent 的循环（精简版）

```python
def spawn_research_agent(question: str) -> str:
    client = OpenAI(...)
    messages = [
        {"role": "system", "content": system_prompt},   # 用 SUB_PERSONA + 受限工具清单
        {"role": "user", "content": question},          # 主 agent 提的问题
    ]

    for step in range(MAX_SUB_STEPS):
        resp = client.chat.completions.create(
            model=model, messages=messages, tools=SUB_TOOLS_SCHEMA,   # ★ 受限工具集
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return msg.content or "(子助手无返回)"

        for call in msg.tool_calls:
            # ... 执行工具
            if name not in SUB_TOOLS_IMPL:
                result = f"子助手无权调用工具: {name}"   # ★ 即使模型幻觉调坏工具也挡住
            else:
                result = str(SUB_TOOLS_IMPL[name](**args))
            # ...
```

**看明白了吗？这跟 ch02 的循环几乎一模一样**。我们绕了 6 章回到原点，但你看代码的眼光已经不同。

子 agent 的循环没有：
- 流式（不需要——它的输出不给人看，给主 agent 看）
- 钩子（不需要——它在沙箱里，主 agent 的钩子不该作用到它）
- 会话持久化（不需要——它是短命任务）

**精简到极致 = 你真正理解了哪些是核心、哪些是装饰**。

### `tools.py` 的变化

在 TOOLS_SCHEMA 里多了 spawn_research_agent 的描述：

```python
{"type": "function", "function": {
    "name": "spawn_research_agent",
    "description": (
        "派一个只读子助手去调研一个具体的问题（例如分析项目结构、汇总几个文件的内容）。"
        "子助手只能 read_file 和 list_dir，不能写盘也不能跑 shell。"
        "它会返回一段自然语言的调研报告。"
        "适合主助手需要把'脏活/费 token 的搜索'隔离出去的场合。"
    ),
    "parameters": {"type": "object",
        "properties": {
            "question": {"type": "string", "description": "要让子助手回答的具体问题"},
        },
        "required": ["question"]}}},
```

**注意 description 怎么写**——它不仅说"这是个调研工具"，还**告诉模型何时用、何时不用、子助手有什么限制**。`description` 写得好是 prompt engineering 的核心。

### `main.py` 的关键 1 行

```python
from tools import TOOLS_IMPL
from subagent import spawn_research_agent
TOOLS_IMPL["spawn_research_agent"] = spawn_research_agent   # ★ 注入

from agent import Agent
```

**注入的时序很关键**：必须在 `from agent import Agent` 之前。因为 agent.py 在 import 时就会读 TOOLS_IMPL 这个字典——它读到的必须已经包含 spawn_research_agent。

为什么不直接把 `spawn_research_agent` 写在 `tools.py` 里？因为 `tools.py` 不能 import `subagent.py`，而 `subagent.py` 反过来要用 `tools.TOOLS_IMPL["read_file"]`。**循环 import 死锁**。这种"主程序注入"的姿势是 Python 解决循环依赖的常见模式。

---

## 4. ★ 全章最重要的思想：工具集就是权限边界

把这句话读三遍：

> **工具集就是权限边界。**
> **工具集就是权限边界。**
> **工具集就是权限边界。**

子 agent 想做坏事？做不到——它的 `SUB_TOOLS_IMPL` dict 里根本**没有** `run_shell`。即使它的 LLM 幻觉出一个 `run_shell` 工具调用，下面这行代码也会挡住：

```python
if name not in SUB_TOOLS_IMPL:
    result = f"子助手无权调用工具: {name}"
```

这就是"工具集 = 权限"的实现——一个 dict 包含什么 key，agent 就只能做什么。这同样适用于：

- 给**用户访客版**的 agent 只放 read_file（只读模式）
- 给**生产环境**的 agent 只放查询数据库的工具（不能写）
- 给**爬虫 agent** 只放 web_fetch（碰不到本地文件）

---

## 5. 卡住了怎么办

### ❌ 主 agent 不调 spawn_research_agent，自己埋头读文件

模型偏好问题。可以：
- 在 `DEFAULT_PERSONA` 里更强调："**调研类问题必须**优先派 spawn_research_agent"
- 或者直接问："**请派一个子助手去**分析这个项目"

### ❌ `ImportError: cannot import name 'spawn_research_agent' from 'subagent'`

确认 `subagent.py` 在同一目录、文件名拼写正确。

### ❌ 子 agent 跑死了不返回

可能是 `MAX_SUB_STEPS` 太小（默认 8）或模型在重复调用工具。把 MAX 调大到 15 试试。

### ❌ 主 agent 看到子 agent 报告之后又自己重做了一遍

调一下子 agent 的 PERSONA，让它的报告**结构化、明确**。或者让主 agent 的 persona 加一句"**信任子助手的报告**"。

---

## 6. 思考题

### 题 1：并行子 agent

主 agent 一次 tool_calls 里可以有**多个** spawn_research_agent（让它去查 3 个不同的问题）——但当前实现是**串行**的。改成 `concurrent.futures.ThreadPoolExecutor` 让 3 个子 agent 并发跑。OpenAI SDK 是 thread-safe 的。

提示：把 `for call in assistant_msg.tool_calls` 改成线程池 map。**注意 tool 结果 append 的顺序仍要和 tool_calls 顺序一致**（OpenAI 校验）。

### 题 2：透传子 agent 的内部消息

现在主 agent 看到的只是子 agent 的**最终报告字符串**，看不到子 agent 内部读了哪些文件。改成让 spawn_research_agent 返回一个结构化结果：

```python
{"answer": "...", "trace": ["list_dir", "read_file(agent.py)", "read_file(tools.py)"]}
```

主 agent 拿到 trace 后可以在自然语言回答里说"我让子助手读了 3 个文件并..."。

### 题 3：失败回退

让子 agent 把答案以 `{"ok": true/false, "answer": "..."}` 的 JSON 返回。主 agent 如果看到 `ok=false`，**自己接管**子任务（用更宽的工具集硬上）。

这是真实工业 agent 的常见模式——**分层授权**：先用受限子 agent 尝试，失败才用宽权限主 agent。

---

## 7. 写在课程的最后

到这里你已经掌握了：

- ✅ messages 列表是对话的全部
- ✅ Agent 循环 = `while tool_calls: 调工具 → 回填`
- ✅ 多轮对话 = messages 持续累积
- ✅ 流式 = 边收 chunk 边打字（工业级要拼 delta）
- ✅ 钩子 = 事件 → 回调列表
- ✅ 系统提示词模板 = persona + tools + 上下文
- ✅ 持久化 = JSONL + 干净轮次边界
- ✅ 子 agent = 工具集即权限边界

回头看一眼 `pi-main/` 那 25 个 TypeScript 文件、上万行代码——**你现在能看懂大部分了**。它的复杂度来自工程化（多 provider、TUI、压缩、事件树、MCP、OAuth…），不来自概念。

**你写的这 540 行 Python，就是 pi-main 的灵魂。**

### 下一步建议

1. **加 MCP 支持**：接入一个标准 MCP server（比如 filesystem-mcp），让你的 agent 能用社区写好的工具
2. **加上下文压缩**：messages 超过 N 条时，让 LLM 把前半段总结成一句话
3. **接入真实业务**：把你的 agent 连到内部数据库、CRM、邮件系统——它就能为你打工了
4. **TUI 美化**：用 `rich` 或 `prompt_toolkit` 让 REPL 更好看
5. **网页化**：用 FastAPI 把 Agent 包成接口，前端用 Vue/React 做聊天界面

祝玩得开心。

> —— Bread Agent 课程 · 知识星球

