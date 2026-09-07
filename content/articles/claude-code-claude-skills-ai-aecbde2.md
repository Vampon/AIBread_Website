---
title: "Claude Skills 揭秘：让 AI 自动触发你的能力"
slug: claude-code-claude-skills-ai-aecbde2
excerpt: "\"Claude Code Skills 基本上等于 YC 上一轮一半 AI Wrapper 创业的死刑判决书。\""
tag: "Claude Code"
date: "2026-06-06"
cover: "/placeholders/cover-2.svg"
readMin: 11
importedFrom: "3-Claude code系列/最佳实现/文章/05-Skills揭秘.md"
---
> 知识星球「Claude Code 最佳实践」系列 · 第 5 篇

---

## 🎬 一个被低估的现象

Reddit 上有个梗——

> **"Claude Code Skills 基本上等于 YC 上一轮一半 AI Wrapper 创业的死刑判决书。"**

为什么这么说？

因为 Skill 这个东西**太轻、太通用、太可分享**——任何一个"做某件特定事的 AI 小工具"，本来要开个 SaaS 才能卖的，现在变成一个文件夹塞进 `.claude/skills/`，谁都能用。

Anthropic 自己的官方 Skill 库（`anthropics/skills`）现在已经 147k star。社区 Matt Pocock 的 Skill 库 118k。`awesome-agent-skills` 收录了 1400+ 个第三方 Skill。

**Skill 正在变成 Claude Code 生态最热的"积木"。**

而 Thariq（Anthropic 内部讲 Claude Code 内核的人）写过一篇文章总结他们打磨 Skill 的所有教训——**今天这篇就基于他的精华 + 官方 best practice，把 Skill 怎么写、怎么不被忽视、怎么避坑，讲透。**

> 🖼️ 图片建议：开篇配图。中间画一个 Claude 卡通，周围漂浮一圈技能卡片（每张写着一个 Skill 名：weather-fetcher、pdf-extractor、color-palette-gen……），Claude 伸手抓住其中一张正在用。下方一行小字 "Claude 自己挑技能用"。风格漫画感。

---

## 一、Skill 到底是什么

**📖 一句话定义：Skill 是一段可被 Claude 自动调用或 `/` 手动触发的能力，定义在 `.claude/skills/<name>/SKILL.md` 里，描述会被注入到会话上下文供 Claude 语义匹配。**

它最像三件套里的"Skill"那部分——**Claude 自己根据你说的话决定何时用**。

**Skill vs Subagent vs Command 的关键差异**（再来一次，因为太重要）：

|  | Skill | Subagent | Command |
|---|---|---|---|
| Claude 自动触发 | ✅ | ✅ | ❌ |
| 独立上下文 | ❌（默认） | ✅ | ❌ |
| 用户 `/` 触发 | ✅ | ❌ | ✅ |
| 适合"复用能力" | ✅ 最佳 | ⚪ 不算 | ⚪ 不算 |

**一个精妙的类比：**

> Skill 像**侍者口袋里的速记小抄**——
>
> - 客人说一句话，侍者从口袋里**自动**翻出对应的小抄看一眼
> - 小抄上写着"碰到 XX 类需求时怎么做"
> - 侍者按小抄做出标准动作
> - 小抄可以反复用、可以多人共享、可以版本管理

整个 Skill 的设计哲学就藏在这个类比里：**轻、可发现、可复用**。

---

## 二、最小 Skill 长啥样

新建 `.claude/skills/weather-fetcher/SKILL.md`：

```yaml
---
name: weather-fetcher
description: Use this skill when the user asks about weather, temperature,
  or climate of any city. Fetches current temperature from Open-Meteo API.
---
## How to fetch weather

1. 解析用户提到的城市名
2. 用 Open-Meteo geocoding 拿经纬度：
   `https://geocoding-api.open-meteo.com/v1/search?name={city}`
3. 用 forecast API 拿当前温度：
   `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m`
4. 返回温度（摄氏 + 华氏）和当前时间

## Gotchas
- 城市名拼写错误：先用 geocoding 校验，找不到时反馈给用户
- API 限速：失败时返回友好错误，不要疯狂重试
```

存盘。下次有人说"Dubai 现在多少度"，Claude **自己就会用上这个 Skill**。

---

## 三、Frontmatter 字段速查

| 字段 | 作用 | 高频度 |
|------|------|--------|
| **`name`** | Skill 名（同时是 `/name` 命令） | 🟦 必学 |
| **`description`** | **触发器**——告诉模型何时该用我 | 🟦 必学（生死线） |
| `argument-hint` | 自动补全提示 | 🟦 高频 |
| `disable-model-invocation` | `true` = 禁止自动调用，只允许 `/` 触发 | 🟦 高频 |
| `user-invocable` | `false` = 不出现在 `/` 菜单（只作为后台知识） | 🟦 高频 |
| `allowed-tools` | 该 Skill 激活时允许使用的工具白名单 | 🟦 高频 |
| `model` | Skill 激活时使用的模型 | ⚪ 进阶 |
| `context` | `fork` = 在独立子代理上下文跑 | ⚪ 进阶 |
| `agent` | 配合 `context: fork`，指定 agent 类型 | ⚪ 进阶 |
| `paths` | glob 限定——只在 Claude 操作匹配文件时才加载 | ⚪ 进阶（大仓库必备） |
| `hooks` | Skill 级生命周期钩子 | ⚪ 进阶 |

---

## 四、`description` 是生死线（再强调一次）

Thariq 把这条放在他 Skill 系列文章的**第一条**：

> **"Description 是给模型的触发器，不是给人看的简介。"**

写法的核心区别：

❌ 反面教材 1：
```yaml
description: A PDF text extractor.
```
人看得懂，**模型不知道何时该用**。

❌ 反面教材 2：
```yaml
description: This skill extracts text from PDF files using PyMuPDF.
```
还是在讲"是什么"。

✅ 正面教材：
```yaml
description: Use this skill when the user uploads a PDF file or asks to
  extract / search / summarize text inside a PDF. Triggers on .pdf paths,
  phrases like "this PDF", "the document", or "what's in attachment".
```

**模型一看就知道**：用户提到 PDF / 文档 / attachment / 上传 .pdf 后缀 → 我该上场。

**记住骨架**：

```
Use this skill when [触发场景 + 关键词清单 + 句式举例]
```

---

## 五、Skill 不是文件，是文件夹

很多人以为 Skill 就是一个 SKILL.md。**错。Skill 是一个文件夹**，里面除了 SKILL.md 还能放：

```
.claude/skills/pdf-extractor/
  ├── SKILL.md            ← 入口（必有）
  ├── references/         ← Claude 按需读的参考资料
  │    ├── pymupdf-api-cheatsheet.md
  │    └── common-pdf-formats.md
  ├── scripts/            ← 可直接调用的脚本
  │    ├── extract.py
  │    └── search.py
  └── examples/           ← Few-shot 示例
       ├── input-resume.pdf
       └── expected-output.json
```

**这就是 Thariq 反复强调的 "progressive disclosure"（渐进式披露）**：

- SKILL.md 写**最精炼的指令** —— 只占少量 token
- 真要查细节，Claude 自己去读 `references/` 里的具体文档
- 真要执行复杂操作，Claude 调 `scripts/` 里的代码而不是自己重造

**主上下文不会一次性吃下整个 Skill 的全部内容**——这就是它"轻"的秘密。

> 🖼️ 图片建议：一张"Skill 文件夹解剖图"。左边是 SKILL.md（小盒子，标"入口、精炼指令"），向右展开三个子文件夹（references / scripts / examples），每个旁边小标签解释作用。下方一句话："Claude 只在需要时打开下层抽屉"。风格像收纳整理图。

---

## 六、Thariq 的 9 条 Skill 黄金法则

直接搬运 Thariq 在 Anthropic 内部精华 + 我个人实测的补充：

### 1. **`description` 是 trigger 不是 summary** ✅（已讲）

### 2. **不要说废话**

Skill 别教 Claude 它已经知道的事。**只写能把它"推出默认行为"的内容**。

❌ "Read the file carefully" —— Claude 默认就会
✅ "永远先调 `validate_input()`，否则后续步骤会静默失败" —— 改变默认行为

### 3. **不要把 Claude 当流水线工人**

**给目标和约束，不要给一步步流程**。Claude 自己会规划。

❌ "Step 1: open file. Step 2: parse JSON. Step 3: ..."
✅ "目标：把 JSON 转成 Markdown 表格。约束：保留 nested 结构、空字段显示 `—`。"

### 4. **每个 Skill 都加 Gotchas 小节**

**最高信号区域，集中放 Claude 的失败点**：

```markdown
## Gotchas
- 千万不要直接 LIMIT 1，会漏读 metadata（这是 v2.3 API 的 bug）
- 用户上传中文 PDF 时要指定 encoding='utf-8'，否则乱码
- 返回的 timestamp 是 UTC，不是用户本地时间——必须转
```

**每次 Claude 在这个 Skill 上踩坑了**，你就回来加一条 Gotcha。Skill 会**越用越聪明**。

### 5. **把脚本和库塞进 Skill**

让 Claude 调你写好的脚本，而不是每次重写。

```markdown
## Usage
直接调用 `scripts/extract.py <pdf-path>`，
不要自己重新实现 PDF 解析。
```

### 6. **`paths:` glob 限定，节省上下文预算**

```yaml
---
paths: ["**/*.sql", "migrations/**"]
---
```

这个 Skill 只在 Claude 操作 SQL 文件或 migrations 目录时**才加载到上下文**。

**大仓库必备**——否则 100 个 Skill 的 description 把上下文撑爆。

### 7. **`context: fork` 让重活不污染主对话**

```yaml
---
context: fork
agent: general-purpose
---
```

Skill 激活时**单独开个子代理上下文**，跑完只返回结果到主对话。**适合**：要读大量文件、跑长测试、做复杂分析的 Skill。

### 8. **`disable-model-invocation: true` 给纯手动 Skill**

有些 Skill 你**不希望 Claude 自动触发**（比如"删除 production 数据"），加上这个字段，只能 `/` 手动触发。

### 9. **embedded `!command` 注入动态上下文**

SKILL.md 里可以嵌入 shell：

```markdown
当前 git branch:
!`git branch --show-current`

最近 3 个 commit:
!`git log -3 --oneline`
```

Skill 激活时这些命令**先跑**，结果连同提示词一起注入。**让静态 Skill 变成"半动态"模板**。

---

## 七、上下文预算：为什么 Skill 不能堆太多

Claude Code 把所有 Skill 的 `description` **每轮都注入会话**，让模型挑选。

但这件事有上限：

- 单 description 最长 **1536 字符**
- 所有 Skill listing 共占上下文的 **~1%**

**如果你装了 50 个 Skill**，预算撑不下，Claude Code 会**自动折叠** —— 模型可能看不到部分 Skill，**触发失败但你不知道为啥**。

**应对策略**：

1. 高频 Skill 描述短而精；低频 Skill 加 `paths:` 限定
2. 同一领域多个 Skill 可以**合并** —— 一个 SKILL.md 处理多种相关场景
3. 不再用的 Skill **及时删** —— 不要囤积

---

## 八、Claude Code 自带的 10 个官方 Skill

很多人不知道——**Claude Code 出厂自带一堆官方 Skill**。这些是你的"基础设施"，**先用透了再自己写**：

| Skill | 用途 |
|-------|------|
| **`code-review`** | 多维度 PR 审查（**Boris 推荐杀招**） |
| **`simplify`** | 让 Claude 简化刚写的代码 |
| **`verify`** | 自我验证修改是否生效 |
| **`run`** | 启动并运行项目，截图确认 |
| **`debug`** | 系统化调试模式 |
| **`loop`** | 把任务设为定时循环 |
| **`batch`** | 批量处理一组文件 |
| **`claude-api`** | Claude API / SDK 参考（写 LLM 应用时自动激活） |
| **`fewer-permission-prompts`** | 扫描历史会话，推荐权限白名单 |
| **`run-skill-generator`** | 帮你写新 Skill 的元 Skill |

**直接试一下**：让 Claude 写一段函数，然后说"用 simplify"——你会爱上这个体验。

---

## 九、🚩 5 个新手必踩的坑

### 坑 1：`description` 写成了 summary

后果：Claude 永远不会自动触发你的 Skill。
**应对**：按"Use this skill when ..."骨架重写。

### 坑 2：Skill 数量爆炸，预算溢出

后果：部分 Skill 静默不触发，debug 困难。
**应对**：加 `paths:` 限定、合并近似 Skill、定期清理。

### 坑 3：让 Skill 干本该是 Subagent 的活

后果：Skill 在主对话里跑，结果读了 50 个文件污染上下文。
**应对**：复杂 Skill 加 `context: fork`，或者改做 Subagent。

### 坑 4：Skill 和 Command 同名

后果：行为不一致，自动触发走 Skill，`/` 触发走 Command。
**应对**：命名时区分（动词 vs 名词），或者本来就只用一个。

### 坑 5：写步骤式指令把 Claude 框死

```
❌ Step 1: ...  Step 2: ...  Step 3: ...
```
后果：Claude 不再思考，只机械执行，碰到边界情况就崩。
**应对**：写"目标 + 约束"而不是"流程"。

---

## 十、心法总结

> **写 Skill 像写"侍者的口袋小抄"——短、精、只写能改变默认行为的事。**

四个一定要记住的原则：

1. **`description` 是 trigger** —— "Use this skill when ..." 句式
2. **文件夹结构 + progressive disclosure** —— SKILL.md 精炼，细节进子目录
3. **Gotchas 是最高信号区** —— Claude 每次踩坑都回来加一条
4. **不要堆 Skill** —— 上下文预算有限，少而精胜过多而杂

写完一个 Skill 后**测三遍**：

- 用不同句式触发它能不能正常激活？
- 它会不会在不该触发的场景**误激活**？
- 它的 Gotchas 小节真的覆盖了已知坑点吗？

通过这三关的 Skill，才是合格 Skill。

> 🖼️ 图片建议：一张"Skill 质检三关"流程图。竖向 3 个关卡，每关一个机器人头像 + 一句话检查项，通过画绿勾，失败画红叉。底部"通过三关 = 合格 Skill"印章。

---

## 📮 下一篇预告

讲完了**扩展能力三件套**（Command / Agent / Skill），下一篇我们换轨道——讲**底层骨架** `settings.json`。

下篇我们聊：
- 80+ 设置、200+ 环境变量，从哪里入手不迷茫？
- 5 级配置优先级：Managed > CLI > local > project > user，**坑深的很**
- 权限的 allow / ask / deny 三规则 + 6 种 permission mode，搭配怎么不让自己被各种弹窗烦死
- `bypassPermissions` 为啥被新版本"加强了"——为什么 Boris 现在推荐 `auto` mode 替代它
- `sandbox` 是怎么一行配置就帮你减少 84% 弹窗的

留言区说一下**你目前装了几个 Skill**——超过 30 个的我们一起反思一下 😏

——面包君
