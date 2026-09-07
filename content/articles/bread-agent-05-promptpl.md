---
title: "第 5 章 · 多文件重构 + 系统提示词模板"
slug: "bread-agent-05-promptpl"
excerpt: "让模型开始动手。多文件重构 + 系统提示词模板，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Agent"
courseSlug: "agent"
courseOrder: 1
chapter: 5
seriesOrder: 6
difficulty: 2
codeLines: 340
---
## 1. 故事：代码长大了，要分家

ch04 的 `main.py` 已经 270 行。所有东西堆在一个文件——工具函数、工具 schema、流式逻辑、REPL、system prompt……找一段代码要拖拉滚动半天。

这一章**不引入任何新功能**，只做两件事：

1. **拆成 3 个文件**：`tools.py` / `agent.py` / `main.py`
2. **系统提示词模板化**：不再是写死的字符串，而是根据"当前可用工具 / cwd / 今天日期"动态拼装

为什么这件事值得单独一章？

- 第一次看到 `class Agent` —— 工业级 agent 的标准形态
- 第一次理解"模块分工"——`main.py` 应该只剩 REPL 外壳
- 第一次见到"system prompt 是个函数，不是个字符串"——pi-main 的 `system-prompt.ts` 也是这个思想

**后面 3 章（ch06/ch07/ch08）的代码骨架都建立在本章之上**。

---

## 2. 跑起来

```
cd ch05_promptpl
python main.py
```

**体验跟 ch04 应该完全一样**（除了启动消息换了句话）。

```
Bread Agent · v5（已重构）
输入消息开始对话；Ctrl+C 退出。

你 > 今天几号？
AI > 今天是 **2026年6月6日**。

你 > 你可以使用哪些工具
AI > 我目前可以使用以下 4 个工具：

1. **read_file** — 读取文本文件内容
2. **write_file** — 写入文本文件（会覆盖已有内容）
3. **list_dir** — 列出目录下的文件和子目录
4. **run_shell** — 执行 shell 命令（危险操作需你确认）

简单说就是：**看文件、写文件、列目录、跑命令**。需要我帮你做什么？

你 > 你当前的工作路径是？
AI > 当前工作目录是：

**`D:\Project\bread agent\bread-agent\ch05_promptpl`**

需要我列一下这个目录里有什么吗？
```

**关键观察**：问"今天几号"，AI **不需要调任何工具**就能答——因为我们在 system prompt 里**注入了当前日期**。这就是本章新加的能力。

![image-20260606143012034](/tutorials/bread-ai-from-scratch/image-20260606143012034.png)

---

## 3. 逐行精讲

### 文件结构

```
ch05_promptpl/
├── main.py     # REPL 外壳（约 35 行）
├── agent.py    # Agent 类 + build_system_prompt（约 130 行）
├── tools.py    # 工具实现 + schema（约 80 行）
└── README.md
```

### 拆分对照表（ch04 → ch05）

| 原本在 ch04 main.py 哪 | 现在在哪 |
|---|---|
| `read_file` / `write_file` / `list_dir` / `run_shell` 函数 | → `tools.py` |
| `TOOLS_SCHEMA` / `TOOLS_IMPL` dict | → `tools.py` |
| `stream_one_turn` / `non_stream_one_turn` 函数 | → `Agent._stream_one` / `Agent._non_stream_one` 方法 |
| `run_turn(messages)` | → `Agent.chat(user_input)` 方法 |
| 写死的 system 消息字符串 | → `build_system_prompt()` 函数 |
| `messages = [...]` 在 main 里定义 | → `Agent.__init__` 里维护 |

### `class Agent` 的样子

```python
class Agent:
    MAX_STEPS = 10

    def __init__(self):
        self.client = OpenAI(api_key=..., base_url=...)
        self.model = os.environ["MODEL"]
        self.messages = [{"role": "system", "content": build_system_prompt()}]

    def _stream_one(self):
        ...  # ch04 的 stream_one_turn 改成 method

    def _non_stream_one(self):
        ...  # ch04 的 non_stream_one_turn 改成 method

    def _execute_tool(self, call):
        ...  # 把工具执行抽成 method

    def chat(self, user_input: str):
        self.messages.append({"role": "user", "content": user_input})
        for _ in range(self.MAX_STEPS):
            ...  # ch04 的 run_turn 改成 method
```

**`class` 的好处**：
- `messages`、`client`、`model` 这些状态都变成 `self.xxx`，不用四处传参
- 外部用起来超清爽：`agent = Agent(); agent.chat("hello")`
- 后面 ch06/ch07/ch08 加 hooks/session 时，只需要给构造函数加参数

### 系统提示词模板化 ★

我们的实现：

```python
DEFAULT_PERSONA = """你是 Bread Agent，一个能操作文件系统和 shell 的中文助理。
工作风格：
- 必要时调用工具；不要凭空捏造文件内容
- 执行危险命令前用户会被询问，被拒绝是正常情况，礼貌改口即可
- 简洁回答；长任务结束后用一句话总结你做了什么
"""

def build_system_prompt(tools_schema, cwd=None, today=None, persona=DEFAULT_PERSONA):
    cwd = cwd or str(Path.cwd())
    today = today or date.today().isoformat()

    tool_lines = [f"- {t['function']['name']}: {t['function']['description']}" for t in tools_schema]
    tools_block = "\n".join(tool_lines)

    return f"""{persona}
# 可用工具
{tools_block}

# 上下文
当前工作目录: {cwd}
今天日期: {today}
"""
```

**为什么要这样拼装？**

| 注入的内容 | 解决的问题 |
|---|---|
| persona | 角色设定（"你是 Bread Agent..."） |
| 工具清单 | 模型在 prompt 里就看到工具用途——比单纯 `tools=` 参数效果更好 |
| 当前 cwd | agent 知道自己在哪儿，相对路径才有意义 |
| 今天日期 | 模型不需要调工具就能答"今天几号" |

`tools` 参数本身已经包含工具描述，但 LLM 实际上对**写在 system prompt 里**的内容更敏感。**所以工业级 agent 都会把工具清单同时塞进 prompt**。

---

## 4. 卡住了怎么办

### ❌ `ImportError: cannot import name 'Agent' from 'agent'`

`agent.py` 没找到。确认你 `cd` 到了 `ch05_promptpl/` 目录里，且 `agent.py` 文件存在。

### ❌ `load_dotenv()` 似乎没生效

检查 `main.py` 顶部：

```python
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
```

这一行**必须在 `from agent import Agent` 之前**——因为 `agent.py` 里读 `os.environ["OPENAI_API_KEY"]`，import 时就执行了，那时候 env 必须已经加载好。

### ❌ 改了代码但好像没生效

Python 不是 JS——改了 `agent.py` 之后必须重启 `main.py` 才能看到效果（Python 的 import 缓存）。

### ❌ 行为和 ch04 不一样

理论上应该完全一样。如果你改 system prompt 之后AI行为变了，那是正常的（system prompt 影响很大）。把 `DEFAULT_PERSONA` 改回来。

---

## 5. 思考题

### 题 1：改 persona

把 `DEFAULT_PERSONA` 改成下面这段，跑跑看：

```python
DEFAULT_PERSONA = """你是一个广东话茶餐厅老板，用粤语回答所有问题，
但工具调用时一切照常。"""
```

体验"system prompt 决定 agent 全部人格"这件事。

### 题 2：动态工具集

在 `Agent.__init__` 加个参数 `enabled_tools: list[str] | None = None`：

```python
def __init__(self, enabled_tools=None):
    # ...
    if enabled_tools is None:
        self.tools = TOOLS_SCHEMA
    else:
        self.tools = [t for t in TOOLS_SCHEMA if t["function"]["name"] in enabled_tools]
    self.messages = [{"role": "system", "content": build_system_prompt(self.tools)}]
```

然后 `Agent(enabled_tools=["read_file", "list_dir"])` 启动一个只读版的 agent。这是 ch08 子 agent "受限工具集" 的预演。

### 题 3：加项目上下文文件

在 `build_system_prompt` 里读一下当前目录的 `README.md`（如果存在），追加到 prompt 末尾：

```python
readme = Path("README.md")
context = ""
if readme.exists():
    text = readme.read_text(encoding="utf-8")[:2000]
    context = f"\n# 项目上下文（README 摘要）\n{text}\n"
```

这就是 pi-main 的"项目上下文文件"功能。让你的 agent 一上来就懂这是个什么项目。

---

## 这一章你学会了什么

- ✅ 模块化：tools / agent / main 各司其职
- ✅ `class Agent` 把状态和方法收拢
- ✅ `build_system_prompt()` 动态构建 system 消息
- ✅ system prompt 里塞工具清单 / cwd / 日期是工业级标配

**下一章 ch06**：把 ch03 那段 inline 的 `input("y/N")` **抽成正式的钩子（hook）**，让"加新功能不用改 Agent 代码"。

