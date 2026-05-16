---
title: "CLAUDE.md：贴在冰箱上的项目家规"
slug: claude-md-best-practices
excerpt: "每个项目根目录里那个 CLAUDE.md 是什么？为什么 Claude Code 启动就要读它？怎么写一份好的家规让 AI 少跑冤枉路？这一篇有实战模板。"
tag: "Claude Code"
date: "2026-04-26"
cover: "/placeholders/cover-4.svg"
readMin: 6
---

每次你在某个项目里启动 Claude Code，它做的第一件事不是回应你的问题，而是**找 `CLAUDE.md`**。

找到就把内容塞进系统提示词。这意味着：**写在 CLAUDE.md 里的每一句话，都会影响这个项目里所有未来对话**。

理解了这点，你就理解了为什么资深 Claude Code 用户花在写 CLAUDE.md 上的时间，**不比写代码少**。

## 1. 三层记忆：项目 / 用户 / 企业

CLAUDE.md 其实有三个位置：

| 层级 | 位置 | 谁能看到 |
|------|------|---------|
| **项目级** | `./CLAUDE.md`（项目根目录） | 当前项目里的所有协作者 |
| **用户级** | `~/.claude/CLAUDE.md` | 只有你自己（跨所有项目）|
| **企业级** | 公司分发的统一配置 | 公司全员 |

三层会**叠加**注入。冲突时**项目级优先**——所以个人偏好（"我喜欢 tab 不喜欢空格"）写用户级，项目特有规则写项目级。

## 2. 一份好的 CLAUDE.md 长什么样

看一下 AI面包君这个站的真实 CLAUDE.md（节选）：

```markdown
# AI面包君 · 项目说明

面向**非从业者**的 AI 知识分享站。

## 技术栈
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3，主题色定义在 tailwind.config.ts

## 常用命令
\`\`\`bash
npm run dev       # 开发，默认 :3000
npm run build     # 生产构建
\`\`\`

## 加新文章
在 content/articles/ 新建 <slug>.md，frontmatter 必须有 title、slug、excerpt、tag、date……

## 配色 / 排版约定
- 用 bread-* token，不要写裸 hex
- 卡片标准：rounded-2xl border border-bread-100 bg-white shadow-sm

## 内容口吻约定
写给非从业者，要：
- 用生活类比替代术语
- 列表 + 加粗强调要点
- 不卖焦虑、不喊口号
```

注意它讲的不是"代码长什么样"——那 AI 自己 grep 就能知道。它讲的是**AI 自己看不出来的东西**：

- **为什么这个项目存在**（受众、定位）
- **跑起来需要哪些命令**（避免它瞎猜命令名）
- **代码里看不出来的约定**（口吻、配色、目录命名）
- **明确禁忌**（不要改 X、不要用 Y）

## 3. 不要写的内容

CLAUDE.md 里**不要**塞这些（写了也是浪费 token）：

- ❌ 项目结构详细说明（AI 自己跑 `ls -R` 几秒钟搞定）
- ❌ 第三方库的用法（AI 比你还熟）
- ❌ "请说中文"这种重复的口吻指令（说一次就够了）
- ❌ 长篇大论的"项目愿景"（几句话就行，不是融资 PPT）

**核心原则**：**只写 AI 看代码看不出来的东西**。

## 4. /init 命令：让 AI 自己写一份草稿

懒人法：在项目根目录敲：

```
/init
```

Claude Code 会自己**扫一遍项目**（用 Glob + Read），然后给你写一份 CLAUDE.md 草稿。你 review 一下、补一些 AI 看不出来的（比如团队协作约定、上线流程），就能用。

这比你从零写好得多——它知道这是 Next.js 项目，知道你 package.json 里的 scripts，知道目录结构。

## 5. 进阶：动态记忆 / 子目录 CLAUDE.md

大项目里你可以**每个子模块各放一份 CLAUDE.md**：

```
my-project/
├── CLAUDE.md          # 全局约定
├── frontend/
│   └── CLAUDE.md      # 前端专属（React 风格、路由约定）
└── backend/
    └── CLAUDE.md      # 后端专属（数据库 schema、API 约定）
```

Claude Code 看上下文需要时会读子目录的那份——不是开局全部加载，而是**按需读**。

## 6. 怎么 review 一份 CLAUDE.md 写得好不好

看三个指标：

1. **新成员（人或 AI）只读这份能不能跑起来项目？** 跑不起来 → 关键命令没写。
2. **有没有重复代码已经讲清楚的事？** 有 → 删。
3. **里面的约定真的被代码遵守吗？** 不被遵守 → CLAUDE.md 在撒谎，要么改 CLAUDE.md，要么改代码。

第 3 点尤其重要。**CLAUDE.md 撒谎比没写更糟糕**——AI 会以"撒谎的版本"为基准生成代码。

## 7. 一句话总结

> CLAUDE.md = 给"每一个未来的 Claude 会话"写的开场白。

写得好，AI 帮你省时间。写得糟，AI 帮你制造问题。

---

想直观看 `/init` 怎么扫项目然后注入记忆？去 [Claude 课](/cc) 敲 `/init`，每一步都有原理同步。
