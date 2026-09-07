---
title: "第 4 章 · Pipeline"
slug: "bread-multi-agent-04-pipeline"
excerpt: "让多个角色协作。Pipeline，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 50
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Multi-Agent"
courseSlug: "multi-agent"
courseOrder: 5
chapter: 4
seriesOrder: 32
difficulty: 3
codeLines: 390
---
## 1. 故事：一个 LLM 写不好长内容

让一个 agent **"写一篇 800 字的博客"**——你会发现：

- 它**没有研究阶段**（直接编内容，事实错误率高）
- 它**没有大纲**（想到哪写到哪，结构松散）
- 它**没有编辑**（写完就交，啰嗦冗余）

为什么？因为人类**写长内容也不是一蹴而就的**：

```
找资料 → 列大纲 → 写初稿 → 改稿 → 终稿
```

5 个阶段是不同的脑力活，**让 LLM 一次完成等于让它边研究边大纲边写边改**——能写好才怪。

正确做法：**4 个 agent 流水线**，每人只干一件事：

```
topic ─→ Researcher（找事实）
            │
            ▼
       Outliner（拉大纲）
            │
            ▼
       Writer（扩写文章）
            │
            ▼
       Editor（润色）─→ 终稿
```

每阶段：

- **输入** 是上一阶段的输出
- **输出** 是下一阶段的输入
- **职责单一**、prompt 极其聚焦

效果：文章质量比单 agent 一发即中高 50-80%（你跑完肉眼对比就知道）。

---

## 2. 跑起来

```
cd ch04_pipeline
python main.py
```

### 预期输出

```
=== 博客主题 ===
Python 的 GIL：它是什么，为什么有人想去掉，2026 年的进展

=== Stage: researcher ===
[researcher 输出 412 字]
- GIL 是 Global Interpreter Lock，CPython 实现中保护内存的互斥锁
- 只允许同一时间一个线程执行 Python 字节码
- 设计于 1992 年，简化了 CPython 的内存管理
- ...

=== Stage: outliner ===
[outliner 输出 380 字]
# Python 的 GIL：从必要之恶到可选项

## 1. GIL 是什么
- 全局解释锁的定义
- 在 CPython 解释器中的作用
...

=== Stage: writer ===
[writer 输出 850 字]
# Python 的 GIL：从必要之恶到可选项

Python 的并发设计里藏着一道 30 年的"禁忌"——全局解释锁（Global Interpreter Lock，简称 GIL）...

=== Stage: editor ===
[editor 输出 820 字]
# 30 年的 GIL：Python 的最大遗憾，正在被 2026 年解决

...

=== 全部完成 ===
完整文章存到 output/final.md
中间产物在 output/。
```

打开 `output/final.md` —— 这是一个**4 个 LLM 协作产出**的真实博客。

每个阶段都存了一份产物（`output/researcher.md` / `outliner.md` / `writer.md` / `editor.md`），可以一一对照看演化过程。

---

## 3. 逐行精讲

### `Stage` 基类 —— 无状态的"纯函数"

```python
class Stage:
    NAME = "stage"
    SYSTEM = ""
    
    def run(self, prev_output: str, topic: str) -> str:
        resp = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": self.SYSTEM},
                {"role": "user", "content": self._build_user_msg(prev_output, topic)},
            ],
        )
        return resp.choices[0].message.content
```

注意：**Stage 没有 self.messages**。每次 run 都重新构造 messages。

这是为什么？

1. **可重跑**：你想重跑 writer 阶段（只改它的 prompt），可以直接拿前面的产物喂进去
2. **可缓存**：相同输入 → 相同输出 → 中间结果可以 cache 到文件
3. **可并行**：无状态 stage 可以 spawn 多份并行跑（ch04 不演示，但架构上支持）
4. **可单测**：每个 stage 独立测试

**"纯函数风格"** 是 pipeline 设计的核心原则。

### 4 个 stage 的差异化 system prompt

```python
class ResearcherStage(Stage):
    SYSTEM = "你是技术研究员。列出 6-10 条关键事实..."

class OutlinerStage(Stage):
    SYSTEM = "你是大纲规划师。输出 markdown 大纲..."

class WriterStage(Stage):
    SYSTEM = "你是博客作者。把大纲扩成 600-900 字的文章..."

class EditorStage(Stage):
    SYSTEM = "你是资深编辑。润色文章但不大改结构..."
```

每段 prompt **聚焦一件事**。

注意 Editor 的：

> "**不大改结构**"

这一条**至关重要**。如果不加这句，Editor 会重写整篇——前面 3 个 agent 的工作就白费了。这是 pipeline 设计里"不让下游覆盖上游"的常见技巧。

### `_build_user_msg` —— 灵活的输入拼装

```python
def _build_user_msg(self, prev_output, topic):
    return f"主题：{topic}\n\n上一阶段输出：\n{prev_output}"

# Researcher 特殊：没有 prev_output
class ResearcherStage(Stage):
    def _build_user_msg(self, prev_output, topic):
        return f"主题：{topic}"
```

每个 stage 可以**重载** user message 的拼法。Researcher 因为是首位，不需要 prev_output。

如果你想让 Writer 同时看到 researcher 和 outliner 的产物（"研究素材 + 大纲一起喂"），就让 Writer 重载这个方法。

**这种重载点是 pipeline 灵活性的关键**。

### `temperature` 阶梯

```python
ResearcherStage(temperature=0.4)
OutlinerStage(temperature=0.4)
WriterStage(temperature=0.6)   # 创作高一点
EditorStage(temperature=0.3)   # 编辑稳定一点
```

每个 stage 独立配 temperature：

- **Researcher / Outliner**: 中（0.4） —— 不要太确定（事实可以多角度），不要太散
- **Writer**: 高（0.6） —— 鼓励创作多样性
- **Editor**: 低（0.3） —— 稳定改稿，不要乱发挥

**这就是 multi-stage 系统的精细调控**。单 agent 你只能选一个 temperature。

### `BlogPipeline.run` —— 驱动器

```python
def run(self, topic):
    current = ""
    for stage in self.stages:
        current = stage.run(current, topic)
        (self.output_dir / f"{stage.NAME}.md").write_text(current, encoding="utf-8")
    return current
```

朴素的串行 chain：

```
current = ""
current = researcher.run(current, topic)
current = outliner.run(current, topic)
current = writer.run(current, topic)
current = editor.run(current, topic)
```

每步**存中间产物**——这是 pipeline 系统的另一个核心实践。

### 为什么必须存中间产物

```python
(self.output_dir / f"{stage.NAME}.md").write_text(current)
```

3 个原因：

1. **Debug**：终稿出问题，能定位是哪一阶段开始飘的
2. **重跑**：editor 不满意，可以只重跑 editor，从 writer.md 起步
3. **审计**：内容生产业务要求"知道每一稿是怎么演化的"

生产级 pipeline 会把中间产物存到对象存储 + 数据库，每次 run 有 trace_id。本课程简化用本地文件。

### 主程序极简

```python
def main():
    topic = "..."
    pipeline = BlogPipeline(client, model, output_dir=HERE / "output")
    final = pipeline.run(topic)
```

3 行 —— 因为复杂度都封装到 Pipeline 类里了。

---

## 4. 卡住了怎么办

### ❌ 终稿质量很差

肉眼对比 `researcher.md` → `outliner.md` → `writer.md` → `editor.md`，**找哪一阶段开始劣化**。

- researcher 差 → 主题描述不清晰
- outliner 差 → researcher 输出格式没遵守
- writer 差 → outline 没有给足要点
- editor 差 → 它"大改"了，前面工作浪费

针对性升级那一阶段的 system prompt。

### ❌ Editor 把文章改短了 / 改没了

system prompt 已经说"不大改结构"。可以加："**保持原长度的 ±10%**"。

### ❌ Outliner 输出的 markdown 格式不对

让它输出更死的格式：

```python
SYSTEM = "严格按以下模板输出，不要添加其他内容：\n# {{标题}}\n## 1. {{一级 1}}\n- ..."
```

或者让 outliner 输出 JSON，由代码渲染成 markdown：

```json
{
  "title": "...",
  "sections": [
    {"heading": "...", "points": ["...", "..."]}
  ]
}
```

### ❌ 想加更多阶段（比如 FactChecker）

加一个 `FactCheckerStage` 类，在 Editor 之前插入：

```python
self.stages = [Researcher, Outliner, Writer, FactChecker, Editor]
```

FactChecker 系统提示："读这篇文章，标出**可能不准确的事实**"，输出修订建议。

### ❌ 想跑得快一点

3 个层面优化：

- **小模型用在简单 stage**：Researcher / Outliner 可以用 gpt-4o-mini
- **并发**：如果未来你拆出"两个独立的 researcher 各查一面"——可以并行
- **缓存**：相同 topic 重跑时，researcher 不变就不重跑

### ❌ output/ 目录里都是旧 run 的产物

每次 run 前清空：

```python
import shutil
shutil.rmtree(self.output_dir, ignore_errors=True)
self.output_dir.mkdir()
```

或者按时间戳 `output/2026-05-19_15-30-45/researcher.md` 存——这是生产做法。

---

## 5. 思考题

### 题 1：加 SourceFinder

在 Researcher 之前加一个 `SourceFinder`，让它输出"关键学习资源链接"：

```
- https://docs.python.org/3/glossary.html#term-global-interpreter-lock
- https://peps.python.org/pep-0703/  (Making the GIL optional)
- ...
```

然后 Researcher 拿着这些"假装查过"的链接做 research。

> 真实生产里 SourceFinder 会调浏览器（Bread Browser ch05 的工具）真的查。
> 这是 ch05 的预告。

### 题 2：并行多个 Researcher

让 3 个 Researcher 同时跑，各自给自己写"角度"：

- A: 技术原理派
- B: 历史演化派
- C: 对比方案派

3 个 researcher 的产物**合并**喂给 Outliner。

提示：用 `concurrent.futures.ThreadPoolExecutor` 并行。

> 多 agent 系统的"扩张到 N 个"是真实生产里的常见需求。

### 题 3：加 critic 循环（ch02 的延伸）

让 Editor 之后再加一个 Critic 评分，不通过的话回到 Writer 重写。

```
Writer ──→ Editor ──→ Critic ──→ pass? ─yes→ done
                       │           │
                       └───────────┘ no
                                   │
                                   ↓
                                Writer 修改
```

> 这是把 ch02 和 ch04 合体——pipeline 里嵌套 critic 回路。

---

## 下一章预告

ch05 是本课**终章**，也是 Bread 系列**五课的合流点**：

**多 agent 流水线 + Bread Browser 浏览器工具**。

具体：写一个"研究并报告"系统：

```
用户问 ──→ Planner 拆任务
              │
              ▼
      ┌────── BrowserAgent 查网页（真的去 google / 维基）
      │       
      ▼       
   Summarizer 汇总成报告
```

Planner / BrowserAgent / Summarizer 是 3 个独立 agent。**这是 2026 年 OpenAI Deep Research / Perplexity Pro 等产品的核心架构**。

代码量 ~500 行。

