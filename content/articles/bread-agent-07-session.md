---
title: "第 7 章 · 会话持久化（JSONL）"
slug: "bread-agent-07-session"
excerpt: "让模型开始动手。会话持久化（JSONL），边读边运行配套 Python 代码。"
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
chapter: 7
seriesOrder: 8
difficulty: 3
codeLines: 470
---
## 1. 故事：让对话"过夜"

到目前为止，我们的 agent 一关机就把对话忘光了。下次启动它不记得"昨天你让我帮你做的那件事"。

这一章给 agent 加上"记忆"——把 messages 列表**存到硬盘**，下次启动可以加载回来继续。

我们加两个 slash 命令：(这里最好解释一下什么是slash命令，就是claude code里那种/命令)

```
/save 工作笔记       # 把当前对话存到 sessions/工作笔记.jsonl
/load 工作笔记       # 把对话读回来，agent 从断点继续聊
/list                # 列出所有保存过的会话
```

底层格式是 **JSONL**（一行一个 JSON），不是一整个大 JSON。

但这一章**真正的核心不在代码，在工程坑**——**何时保存才安全**。下面就讲这件事。

---

## 2. 跑起来

```
cd ch07_session
python main.py
```

试这个流程（**分两次启动 Python 来验证持久化**）：

### 第一次启动

```
你 > 列出当前目录文件
AI > [切换到非流式模式获取工具调用...]
  [hook:log] 即将调用 list_dir 参数={}
AI > 当前目录包含：

- 📁 `__pycache__/`
- 📄 `agent.py`
- 📄 `hooks.py`
- 📄 `main.py`
- 📄 `README.md`
- 📄 `session.py`
- 📄 `tools.py`

你 > /save 我的笔记
已保存 5 条消息 → sessions\我的笔记.jsonl

你 >
再见！
```

![image-20260606230219558](/tutorials/bread-ai-from-scratch/image-20260606230219558.png)

### 第二次启动

```
python main.py

你 > /list
可用会话： 我的笔记

你 > /load 我的笔记
已加载 5 条消息。

你 > 刚才那个目录里第一个文件叫什么
AI > 第一个文件是 `agent.py`（如果把 `__pycache__` 目录也算上，那它排在最前面）。
```

![image-20260606230338281](/tutorials/bread-ai-from-scratch/image-20260606230338281.png)

**第二次启动是新的 Python 进程，原本应该完全失忆**——但通过 `/load` 恢复了上下文。这就是持久化的价值。

---

## 3. 逐行精讲

### JSONL 格式长什么样

打开 `sessions/我的笔记.jsonl`：

```jsonl
{"role": "system", "content": "你是 Bread Agent..."}
{"role": "user", "content": "列出当前目录文件"}
{"role": "assistant", "content": null, "tool_calls": [{"id": "call_xxx", ...}]}
{"role": "tool", "tool_call_id": "call_xxx", "content": "FILE main.py\nFILE README.md\n..."}
{"role": "assistant", "content": "当前有 6 个文件..."}
{"role": "user", "content": "/save 我的笔记 这条不会出现因为/save是slash命令"}
```

**为什么用 JSONL 不用一整个 JSON 数组？**

- 追加写不用整段重写
- 一行损坏不影响其他行
- 终端里 `cat` / `Get-Content` 直接肉眼可读
- claude code、pi 等agent产品也用 JSONL

### ★★★ 关键工程坑：什么时候才能保存？★★★

**OpenAI 协议有个铁律**：

> 每一条 `assistant` 消息里如果带了 `tool_calls`，**后面必须紧跟着所有对应的 `tool` 消息**，且 `tool_call_id` 一一对得上。否则下一次发请求时，server 会直接拒掉。

所以下面这种状态**绝对不能保存**：

```
... 之前的对话 ...
[user] 列出文件
[assistant] (有 tool_calls=[call_1])      ← 此时 /save 就完蛋
... 还没来得及 append 那条 tool 消息
```

下次 `/load` 回来发请求，OpenAI 会报 `tool_calls 缺少对应 tool 回复`，整个会话作废。

**安全的保存时刻**：只在"模型给出无 tool_calls 的 assistant 消息"这种**干净轮次边界**保存。简单说就是 agent **完整地处理完一轮**、已经用自然语言回答用户了。

`session.py:is_clean_boundary` 实现这个判断：

```python
def is_clean_boundary(messages: list) -> bool:
    if not messages:
        return True
    last = _message_to_dict(messages[-1])
    if last.get("role") == "assistant" and last.get("tool_calls"):
        return False   # 中间状态，禁止保存
    return True
```

`main.py` 在 `/save` 之前调这个判断，处于中间状态就拒绝并提示用户。

> 这就是 pi agent中harness/session/` 里 "save point" 机制的核心。pi 那边复杂得多（session tree、branch、压缩），但内核就这一条规则。

### `_message_to_dict()` 兼容 OpenAI SDK 对象

```python
def _message_to_dict(msg):
    if isinstance(msg, dict):
        return msg
    return msg.model_dump(exclude_none=True)
```

为什么需要它？因为 `client.chat.completions.create()` 返回的 assistant 消息是个 **Pydantic 对象**（`ChatCompletionMessage`），不是 dict——直接 `json.dumps(msg)` 会报错。

`.model_dump(exclude_none=True)` 把 Pydantic 对象转成纯 dict，可以序列化。`exclude_none=True` 去掉 `None` 字段，文件更干净。

我们在 messages 里既有 dict（user/tool 是我们自己 append 的）也有 Pydantic 对象（assistant 是从 OpenAI 返回的），所以要兼容。

### slash 命令识别

`main.py:handle_slash_command`：

```python
def handle_slash_command(cmd, agent):
    parts = cmd.strip().split(maxsplit=1)
    name = parts[0]
    arg = parts[1] if len(parts) > 1 else ""

    if name == "/save":
        # 检查干净边界
        msgs = agent.get_messages()
        if not is_clean_boundary(msgs):
            print("⚠ 当前处于中间状态，暂不能保存。")
            return True
        path = save_session(arg, msgs)
        print(f"已保存 {len(msgs)} 条消息 → {path}")
        return True

    if name == "/load":
        msgs = load_session(arg)
        agent.replace_messages(msgs)
        print(f"已加载 {len(msgs)} 条消息。")
        return True

    # ... /list /help
```

REPL 主循环里先看输入是不是 `/` 开头——是的话路由到 `handle_slash_command`，不是的话才发给 agent。

---

## 4. 卡住了怎么办

### ❌ `/save` 时报 `当前处于中间状态`

正常。意味着上一轮 agent 调用工具中途被 Ctrl+C 中断了。**再聊一句话让它跑完一个完整回合**，再 /save。

### ❌ `/load` 后再发问题报 `tool_calls 缺少对应 tool 回复`

说明你保存的 JSONL **不是在干净边界**——这通常发生在你绕过了 `is_clean_boundary` 检查直接写文件的情况。正常通过 `/save` 不会发生。

### ❌ Windows 上 sessions 目录里中文文件名乱码

Python 创建的文件名应该是 UTF-8，但 Windows 资源管理器有时显示为乱码。**实际名字是对的**，不影响 `/load`。或者用英文名：`/save daily_chat`。

### ❌ JSONL 文件可以手动编辑吗

可以。但**改完要确保**：
- 每一行还是合法 JSON
- 不破坏"assistant.tool_calls 后必跟 tool"的规则
- 最后一条不是带 tool_calls 的 assistant

### ❌ /save 之后看不到 sessions 文件夹

它在 `ch07_session/sessions/` 下（当前工作目录）。`dir sessions` 或 `ls sessions` 看看。

---

## 5. 思考题

### 题 1：自动保存

注册一个 `on_assistant` 钩子（ch06 学过），每次模型给出最终回答时自动 `/save autosave`：

```python
def auto_save(content, **_):
    if is_clean_boundary(agent.get_messages()):
        save_session("autosave", agent.get_messages())

hooks.register(EVENT_ON_ASSISTANT, auto_save)
```

这样**你忘了 /save 也不怕**——上一次完整回答之后的状态总是被存着。

### 题 2：会话目录化

把单文件 `<name>.jsonl` 改成目录 `<name>/`，里面：

```
sessions/我的笔记/
├── messages.jsonl
└── meta.json    # { "model": "glm-5.1", "created_at": "2026-05-17T..." }
```

这是为"多会话管理 / branch" 做铺垫——比如能记下"这条会话用的是哪个模型"。pi agent 的 session 就这么干。

### 题 3：思考 `/reset` 要不要做

`/reset` 就是 `messages = [messages[0]]`（只留 system）。我**没做**这个命令——因为代码就一行，没教学价值。

但产品上常常需要。你能想出比单纯 `/reset` 更有用的变体吗？例如：
- `/branch`：把当前 messages 存档后清空（保留入口）
- `/undo`：撤销最后 N 条消息
- `/compact`：让 LLM 把超长历史压缩成一段摘要（这就是 pi-main 的 compaction）

---

## 这一章你学会了什么

- ✅ JSONL 格式：一行一条 message，append-friendly
- ✅ Pydantic 对象用 `.model_dump()` 转 dict
- ✅ **干净轮次边界** invariant：tool_calls 后必跟 tool，违反就崩
- ✅ slash 命令路由：`/` 开头不走 LLM，走本地处理

**下一章 ch08（终章）**：让 agent 调度 agent —— **子 agent**。一个工具能 spawn 出新的 Agent 实例完成子任务，**工具集就是权限边界**。

