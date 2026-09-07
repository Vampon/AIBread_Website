---
title: "第 3 章 · Agent Loop（本课灵魂章）"
slug: "bread-browser-03-agent_loop"
excerpt: "让模型操作网页。Agent Loop（本课灵魂章），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 60
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 3
seriesOrder: 25
difficulty: 3
codeLines: 330
---
## 1. 故事：从"一步"到"任务"

ch02 的 LLM 只能走一步——任务一多就跨不过来。比如"登录":

```
任务：登录 quotes.toscrape.com（用户名 admin / 密码 1234）
```

需要至少 4-5 步：

1. 点 Login 链接
2. 填用户名
3. 填密码
4. 点 Submit
5. 验证 Logout 出现（= 登录成功）

每一步**做完之后页面会变**——LLM 必须**看到新页面**才能决定下一步。

ch03 加的就是这个循环：

```python
while not done:
    snapshot = take_snapshot(page)
    action = ask_llm(task, snapshot, history)
    if action == done: break
    execute(action)
```

**这跟 Bread Agent 的 chat 循环本质相同**——只不过工具变成了 click / type，结果变成了"页面快照"而不是"文件内容"。

---

## 2. 跑起来

```
cd ch03_agent_loop
python main.py
```

### 预期输出

```
=== 任务 ===
Log into the website with username 'admin' and password '1234'. ...

=== Agent 开始 ===
  [step 0] click({'index': 1})           ← 点 Login
  [step 1] type_text({'index': 2, 'text': 'admin'})       ← 填用户名
  [step 2] type_text({'index': 3, 'text': '1234'})        ← 填密码
  [step 3] click({'index': 4})           ← 点 Submit
  [step 4] done({'answer': 'Successfully logged in...'})

=== Agent 最终回答 ===
Successfully logged in with username 'admin' and password '1234'. The "Logout" link is
visible on the page (index [1]), confirming the login was successful.
```

**5 步全自动**。最后浏览器停留 5 秒，**这时往右上角看 —— Logout 链接**。任务完成。

---

## 3. 逐行精讲

### `BrowserAgent` —— 跟 Bread Agent 类一一对应

```python
class BrowserAgent:
    MAX_STEPS = 15
    
    def __init__(self, client, model, page):
        self.client = client
        self.model = model
        self.page = page                    # ← 新成员：浏览器 page
        self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
```

跟 Bread Agent 唯一区别：多了一个 `self.page`。

- Bread Agent 的工具是 "read_file / write_file / ..."
- Bread Browser 的工具是 "click / type_text / press_key / done"

工具集换了——但**循环架构完全一样**。学完前面三课的人到这一章应该有强烈的"似曾相识"感。

### 主循环 —— 几乎是 Bread Agent 的拷贝

```python
for step in range(self.MAX_STEPS):
    resp = self.client.chat.completions.create(
        model=self.model, messages=self.messages, tools=TOOLS_SCHEMA,
    )
    msg = resp.choices[0].message
    self.messages.append(msg)
    
    if not msg.tool_calls:
        return msg.content or "..."
    
    for call in msg.tool_calls:
        ...
        result = self._execute(name, args)
        self.messages.append({"role": "tool", "tool_call_id": call.id, "content": ...})
```

注意 `if not msg.tool_calls: return`——**这就是停止条件**。
LLM 决定"不调工具，直接说话"时，循环就结束。

**ch02 我们用 `tool_choice="required"` 强制必须调工具**。ch03 改成默认 `auto`——这样最后一步 LLM 可以不调工具、直接返回总结。

### `_build_tool_result` —— 工具结果里塞"新快照"

```python
def _build_tool_result(self, action_result: str) -> str:
    self.page.wait_for_load_state("domcontentloaded", timeout=5000)
    self.page.wait_for_timeout(400)
    new_snapshot = self._snapshot()
    return f"{action_result}\n\nCurrent page (URL: {self.page.url}):\n{new_snapshot}"
```

**这是 ch03 跟 Bread Agent 最大的差异**。

Bread Agent 的工具返回："读到了文件内容" / "写入成功"——LLM 拿到字符串就够了。

浏览器 agent 的工具返回**必须包含新页面快照**——因为：

1. 点完 Login 链接，页面变了
2. LLM 需要知道**新页面长什么样**才能决定下一步
3. 每个 step 的快照不一样 → element 编号也不一样

如果你不把新快照塞回去，LLM 会**用上一步的旧编号点东西**——崩。

这一段代码是 **agent loop 在浏览器场景下的特化点**。理解了它就理解了 browser-use 的核心。

### `page.wait_for_load_state` —— 等页面稳

```python
self.page.wait_for_load_state("domcontentloaded", timeout=5000)
self.page.wait_for_timeout(400)
```

两道等待：

- **`load_state("domcontentloaded")`**：等 DOM 解析完成（不包括图片资源）
- **`wait_for_timeout(400)`**：再额外等 400ms 给 JS 渲染时间

不等的话快照可能是**点击瞬间的**——还没跳页。

`timeout=5000` 兜底：如果 5 秒还没 domcontentloaded（罕见），try/except 直接跳过，等 400ms 后凭运气抽——不阻塞 agent。

生产级 agent 会监听 network idle、特定 selector 出现等更精细的信号。本课程简化。

### system prompt 中的关键提示

```python
"Indices in [N] refer to elements in the CURRENT snapshot. After every action, you "
"receive a NEW snapshot; the indices may have changed."
```

这条**至关重要**。不告诉 LLM 这件事，它会以为编号永远不变——直接用旧编号点新页面的元素，错。

```python
"Don't repeat yourself. If an action didn't change the page, try a different one."
```

防止死循环——LLM 看到自己上次点 [5]，页面没变，第二次还点 [5]。这条 prompt 让它避免重复。

### `MAX_STEPS = 15` 兜底

```python
MAX_STEPS = 15
```

15 步对大多数任务足够。如果你看 LLM 卡在某一步反复尝试，就是**任务超出本架构能力**——可能需要：

- 加更明确的 system prompt
- 把任务拆小
- 引入子 agent（Bread Agent ch08 的模式）

---

## 4. 卡住了怎么办

### ❌ LLM 总在反复点同一个东西

通常是因为**它看不到自己之前的尝试**。检查：你是不是 `messages` 列表搞错了？每一步的 assistant message + tool result 都要 append 进 `self.messages`。

### ❌ Selenium / Playwright 报 `Timeout 30000ms exceeded`

某次 `.click()` 等不到元素。可能原因：

- 元素被 modal 遮住（要先关 modal）
- 元素正在动画中
- 你的 EXTRACT_JS 抽错了

定位办法：把 headless 改成 False 自己看着跑，肉眼定位卡哪一步。

### ❌ 中间步出错了，整个循环挂掉

我们已经包了 try/except —— action 失败会把错误信息当 tool result 喂回 LLM。LLM 会**自己改方向**（"哦，刚才那个点失败了，让我试别的"）。

这是 agent 鲁棒性的关键：**错误信息也是上下文的一部分**。

### ❌ LLM 永远不调 done

可能任务描述里**没有明确的成功信号**。改进 system prompt：

```python
"You MUST call `done` when you have completed the task. Don't keep clicking forever."
```

或者改进 task 描述："...then call done."

### ❌ LLM 觉得登录失败了但其实成功了

quotes.toscrape.com 的登录页特别——成功后跳回首页，Login 链接变成 Logout。LLM 必须**靠 snapshot 里的文字判断**。如果 system prompt 没说"用 Logout 出现判断成功"，LLM 可能误判。

任务描述里明确说出**成功信号**是最稳的。

### ❌ messages 列表越长 token 越多 → 越慢

每一步快照可能是 50-100 行。10 步累积 1000+ 行。生产级会做"只保留最近 3 步快照"的截断。本课程 ch04 起会引入这个。

---

## 5. 思考题

### 题 1：换任务

把 `task` 改成：

- **"Find the tag 'humor' and click it. Tell me how many quotes are on that page."**
  → 需要点 humor 标签链接 + 计数 + 报告
- **"Search the site for quotes by Albert Einstein."**
  → 网站没搜索功能，agent 会怎么办？（试试看）
- **"Log in, then log out."**
  → 多步：登录 → 点 Logout → 验证

观察 LLM 在不同任务下的循环长度。

### 题 2：加 `extract_text` 工具

让 agent 主动读取页面里**没出现在 interactive elements** 里的文字（如 quote 内容）。

```python
{
    "type": "function",
    "function": {
        "name": "extract_text",
        "description": "Extract the visible text of a non-interactive area by CSS selector.",
        "parameters": {
            "type": "object",
            "properties": {"selector": {"type": "string"}},
            "required": ["selector"],
        },
    },
},
```

执行：`page.locator(args["selector"]).all_inner_texts()`，返回字符串。

> 这一题为 ch04 做铺垫——任务变成"抓数据"时，必须能读非交互文字。

### 题 3：加日志 hook

参考 Bread Agent ch06 的 hooks 思路，在 `_execute` 前后插入打印：

- 开始执行 → `[before_tool] click(index=2)`
- 执行完毕 → `[after_tool] took 230ms, new url: /login`

`time.time()` 算耗时即可。

> 你会发现：每一步的耗时主要花在 **LLM 响应**（1-3s）而非浏览器操作（10-100ms）。这是为什么生产级 browser agent 不堆 LLM 调用次数。

---

## 下一章预告

ch04 把 agent 升级到能完成**真正复杂的任务**：

> "去 quotes.toscrape.com，把 humor 标签下所有引言抓下来，存成 JSON。"

涉及：多页面导航 + 翻页 + 抓非交互文字 + 数据汇总。代码量 ~430 行，是本课的**全功能演示**。

