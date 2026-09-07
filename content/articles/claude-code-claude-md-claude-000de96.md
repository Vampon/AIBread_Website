---
title: "CLAUDE.md 完全指南：让 Claude 真正\"懂\"你的项目"
slug: claude-code-claude-md-claude-000de96
excerpt: "\"CLAUDE.md 里写了 MUST USE AGENT，全大写、加感叹号、放在最顶上——Claude 还是 80% 的时候在装瞎。\""
tag: "Claude Code"
date: "2026-06-06"
cover: "/placeholders/cover-1.svg"
readMin: 9
importedFrom: "3-Claude code系列/最佳实现/文章/02-CLAUDE-md完全指南.md"
---
> 知识星球「Claude Code 最佳实践」系列 · 第 2 篇

---

## 🎬 这条 Reddit 帖把我看笑了

去年底 r/ClaudeCode 上有条爆款帖，标题大意是：

> "CLAUDE.md 里写了 **MUST USE AGENT**，全大写、加感叹号、放在最顶上——Claude 还是 80% 的时候在装瞎。"

楼主截图，CLAUDE.md 写得跟法律条文似的，又是 `IMPORTANT`、又是 `NEVER`、又是 `ALWAYS`，结果 Claude 该忽视还是忽视。底下评论区分成两派：一派说"你这文件 800 行没人读得完"；另一派说"你不知道有 .claude/rules/ 这玩意儿？"

这件事戳中了一个真相——**CLAUDE.md 是 Claude Code 里"性价比最高的单一优化手段"，但 90% 的人不知道它的加载规则，把它写成了 README。**

今天这篇，我们就把 CLAUDE.md 从加载机制到分层结构、从字数控制到避坑姿势，**讲透**。

> 🖼️ 图片建议：开篇配图。画一个 Claude 卡通蹲在一摞高得离谱的文档前，文档最上面写着 CLAUDE.md 800 行，Claude 头顶冒一个问号。旁边对比一个简洁的 60 行 CLAUDE.md，Claude 在它面前两眼放光。色彩明快，幽默感。

---

## 一、先讲清楚：CLAUDE.md 到底是个啥

**📖 一句话定义：CLAUDE.md 是 Claude Code 启动时会自动读进上下文的"项目说明书"，告诉 AI 这个项目长什么样、用什么规范、不准做什么。**

它不是 README——README 是给人看的，CLAUDE.md 是给 AI 看的。**两者风格、详略、重点完全不同**。

举个例子，README 会写：

> "Run `npm install` to install dependencies."

CLAUDE.md 应该写：

> "运行测试前必须先跑 `npm run build`，否则 type 检查会缺失。提交代码用 `git commit -m`，**不要**带 Co-Authored-By 行（CI 会拒绝）。所有 PR 单个文件单个 commit。"

看出来差别没？**CLAUDE.md 写的全是"AI 容易做错、必须提醒"的事**——也就是"项目的隐含约定"。

---

## 二、最被忽略的杀器：三种加载机制

很多人以为 CLAUDE.md 就是放项目根目录一份，启动就读完了。

**错。Claude Code 有三种不同的加载策略，每种都是一把双刃剑。**

### 机制 1：祖先目录加载（向上扫描，立即注入）

你在哪个目录启动 Claude Code，它就从这个目录向**根目录**一路向上扫，沿途**所有** CLAUDE.md **立即注入**到上下文。

```
~/projects/my-app/         ← CLAUDE.md（项目级）
  ├── frontend/
  │    └── components/     ← 你在这里启动 Claude
  └── backend/
       └── api/
```

你在 `components/` 启动，Claude 会读：
- `components/CLAUDE.md`（如果有）
- `frontend/CLAUDE.md`（如果有）
- `my-app/CLAUDE.md`（项目根）
- `~/CLAUDE.md`（全局个人偏好，如果有）

**这是默认行为，立即生效，无需配置。**

### 机制 2：后代目录加载（向下扫描，懒注入）

子目录里的 CLAUDE.md **不会**启动时就读。**只有当 Claude 实际去读那个子目录里的文件时，那个子目录的 CLAUDE.md 才被注入**。

```
my-app/             ← 启动目录
  ├── CLAUDE.md     ← ✅ 立即加载
  ├── frontend/
  │    └── CLAUDE.md  ← ⏸️ 暂不加载，Claude 摸到 frontend/ 文件才加载
  └── backend/
       └── CLAUDE.md  ← ⏸️ 同上
```

**这就是 monorepo 的福音**——你不用把所有规则塞进根 CLAUDE.md，每个子项目放自己的，按需触发。

### 机制 3：兄弟目录互不加载

**最反常识的一条**，很多人栽在这里：

> **同一层级的两个目录，它们的 CLAUDE.md 永不互相加载。**

```
my-app/
  ├── frontend/
  │    └── CLAUDE.md  ← Claude 在 frontend 干活时只见这一份
  └── backend/
       └── CLAUDE.md  ← 这份完全看不到
```

这是**特性，不是 bug**。它保证了组件间天然隔离——后端的代码风格规范不会污染前端的工作。

**一个精妙的类比：**

> CLAUDE.md 的加载机制像**图书馆的书架**：
> - **祖先加载**像走廊上贴的总馆规（无论你去哪个分馆都得遵守）
> - **后代加载**像分馆门口的小提示牌（进了科幻区才看见科幻区的规则）
> - **兄弟不互通**像两个分馆没共享公告板（科幻区的规则不会跑去美食区）

> 🖼️ 图片建议：一张目录树插图。中间一个根目录，向下展开三层。用三种颜色高亮三种加载关系：祖先链用绿色实线箭头（立即加载）、后代用橙色虚线箭头（懒加载、写"按需触发"）、兄弟之间画一道红色 ✗（永不加载）。

---

## 三、200 行黄金线：为什么写多了反而没用

Claude 团队的 Boris 在 Twitter 上多次强调：

> **每个 CLAUDE.md 文件应该控制在 200 行以内。**

Humanlayer 团队的 Dex 走得更激进——他们的 CLAUDE.md **只有 60 行**，但他自己也承认"即便这样也不能保证 100% 遵循"。

为什么？**因为 LLM 对长指令文档有"中段失忆"现象**——文件越长，中间段被忽视的概率越高。

实操上的应对：

1. **拆**：把长 CLAUDE.md 按主题拆到 `.claude/rules/*.md`，每个 rule 文件加 `paths:` frontmatter，**只在 Claude 触碰匹配文件时才加载**

   ```yaml
   ---
   paths: ["src/api/**/*.py"]
   ---
   # Python API 模块规范
   - 所有 endpoint 必须用 Pydantic 校验
   - 错误统一抛 HTTPException
   ```

2. **包**：长指令用 `<important if="...">` 标签包起来，明确触发条件，防止被忽视

   ```markdown
   <important if="user is writing a SQL migration">
   - 所有迁移必须可回滚
   - 不允许 ALTER TABLE 不带默认值
   </important>
   ```

3. **删**：定期 review CLAUDE.md，**和源代码已经能体现的规则统统删掉**（比如"项目用 TypeScript"——这事 tsconfig.json 自己会说）

---

## 四、不同场景该写啥：4 个层级的最佳分工

实战中 CLAUDE.md 至少出现在 4 个层级，**每个层级写什么是有讲究的**：

| 层级 | 文件位置 | 该写什么 | 不该写什么 |
|------|---------|---------|-----------|
| **全局个人** | `~/.claude/CLAUDE.md` | 个人代码风格、commit 偏好、注释语言 | 项目细节 |
| **项目共享** | `<repo>/CLAUDE.md` | 团队约定的 commit 格式、PR 模板、setup/build/test 命令 | 个人偏好、子目录的事 |
| **组件 / 子模块** | `<repo>/frontend/CLAUDE.md` | 该模块特有的框架、架构、测试约定 | 其他模块的事 |
| **个人覆盖（不入 git）** | `<repo>/CLAUDE.local.md` | 临时调试指令、个人不分享的偏好 | 团队规范 |

**一个反例**：把"PR 必须 squash merge"写在全局 CLAUDE.md——结果你给别人的开源项目提 PR，AI 也给你 squash 了，崩了人家的 history。**这条该放项目级 CLAUDE.md**。

---

## 五、Dex 的"开箱即用"测试

Humanlayer 的 Dex Horthy 提了一条特别狠的验收标准：

> **任何一个开发者克隆你的仓库、启动 Claude Code，说一句"跑测试"，应该一次就成功。如果不成功，你的 CLAUDE.md 缺东西。**

按这个标准 audit 一下你现在的 CLAUDE.md：

- [ ] 写了 setup 命令吗？（`npm install` / `pip install -r requirements.txt` / `bundle install`）
- [ ] 写了 build 命令吗？（`npm run build`）
- [ ] 写了 test 命令吗？（`npm test` / `pytest`）
- [ ] 写了"测试前必须先 build / migrate / seed"这种隐含依赖吗？
- [ ] 写了环境变量需要哪些、从哪拿吗？

**少一条，AI 就可能撞墙一次。**

> 🖼️ 图片建议：一张"开箱即用 checklist"图。模拟手机便签条样式，竖向列出 5 条 checkbox，背景是 Claude Code 终端截图。色彩简洁，强调"checklist"质感。

---

## 六、🚩 5 个坑，看完今天就别再踩

### 坑 1：在子目录启动 Claude，被坑还不知道

你在 `frontend/components/` 启动 Claude，**项目根 + components 之间所有目录**的 CLAUDE.md 都会加载——**但兄弟目录 backend/ 的 CLAUDE.md 不会**。

**应对**：默认在项目根启动 Claude（除非你刻意想隔离）。

### 坑 2：CLAUDE.md 越写越长，越长越没人读

新功能加，规则加；又新功能加，又加……半年下来 800 行起步。

**应对**：每月 review 一次，超 200 行就拆到 `.claude/rules/`。

### 坑 3：写了"MUST"但 Claude 还是不听

不是 Claude 故意叛逆——是你的 MUST 淹没在长文里，模型没看到。

**应对**：关键 MUST 拿出来包 `<important if="...">` 标签，明确触发条件。

### 坑 4：把"项目用 TypeScript"这种废话写进去

源代码、配置文件已经能说明的事**不要在 CLAUDE.md 里复述**——徒增 token、稀释重点。

**应对**：CLAUDE.md 只写"AI 会做错且代码看不出"的事。

### 坑 5：用 CLAUDE.md 替代 settings.json

比如有人在 CLAUDE.md 里写 "NEVER add Co-Authored-By to commits"——结果 Claude 隔三差五还是会加。

**正解**：这件事在 `settings.json` 里 `attribution.commit: ""` 一行配置**确定性禁掉**，比写 100 遍 NEVER 都管用。

**心法**：**能用 settings.json 硬约束的，就别靠 CLAUDE.md 软提醒**——前者是 harness 强制执行，后者是模型自由心证。

---

## 七、一个推荐的项目级 CLAUDE.md 模板

直接复制改改用：

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Setup
- Install: `pnpm install`
- Build: `pnpm build`（**测试前必须先 build**）
- Test: `pnpm test`
- Dev: `pnpm dev`

## Architecture Overview
- `src/api/` — REST endpoints (FastAPI)
- `src/services/` — 业务逻辑
- `src/db/` — Prisma schema 和迁移
- 详细架构见 `docs/architecture.md`

## Coding Conventions
- 所有 endpoint 必须用 Pydantic 校验请求体
- 不准 import `*`
- 错误统一抛 `AppException`（在 `src/errors.py`）
- 日志用 `structlog`，不准用 print

## Git Rules
- 一次 commit 只动一个文件
- commit message 用英文，遵循 Conventional Commits
- 所有 PR squash merge
- **不要**加 Co-Authored-By 行（settings.json 已禁，提醒你别手动加）

## Don't Do
- 不要修改 `migrations/` 里已有的迁移
- 不要直接改 `package-lock.json`
- 不要把 secrets 写进代码（用 `.env.local`）

<important if="user is writing a database migration">
- 必须可回滚
- ALTER TABLE 必须带默认值
- 大表迁移用 `CONCURRENTLY`
</important>
```

**控制在 200 行以内、Don't Do 单独成节、危险操作包 important 标签**——这就是好 CLAUDE.md 的样子。

> 🖼️ 图片建议：一张"CLAUDE.md 解剖图"。把上面这个模板的关键区块用颜色块圈出来，每块旁边贴一个小标签解释作用（如"Setup 让 AI 知道命令"、"Don't Do 是最高效区块"、"important 标签防忽视"）。风格像 IKEA 说明书。

---

## 八、终极心法

> **CLAUDE.md 不是项目文档，是"AI 易错点提醒清单"。**
>
> 你写得越短、越具体、越聚焦在 AI 不知道的隐含约定上，它越管用。

下次提笔写 CLAUDE.md 前问自己：

1. 这条规则**源码能看出来吗**？能 → 删
2. 这条规则**AI 真的会做错吗**？不会 → 删
3. 这条规则**触发场景明确吗**？不明确 → 加 `<important if>` 标签
4. 整个文件**超过 200 行了吗**？超了 → 拆到 `.claude/rules/`

---

## 📮 下一篇预告

CLAUDE.md 把"项目级常识"给了 AI。下一步该让你的**重复劳动**自动化了——也就是**斜杠命令（Slash Commands）**。

下篇我们聊：
- Claude Code 自带 83 个官方命令，哪 10 个是你每天都该用的？
- 怎么用 `$ARGUMENTS` 和 `!` 嵌入式 shell 做参数化命令
- 为什么 Boris 说"如果你一天做超过一次的事，就该把它做成 Command"
- 一个会让你直呼"早知道"的命令模板套装

留言区分享你的 CLAUDE.md 是多少行——超过 500 行的我们一起反思一下 😏

——面包君
