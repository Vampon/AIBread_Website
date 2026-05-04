---
title: "Claude Code 上手指南：终端里的 AI 同事"
slug: claude-code-guide
excerpt: "Claude Code 不是 IDE，是个跑在命令行里的 AI 编程 Agent。它能读你的代码、改你的文件、跑你的命令。一篇讲清它和 Cursor 的区别、装机配置、真实使用场景。"
tag: "AI 工具"
date: "2026-04-27"
cover: "/placeholders/cover-6.svg"
readMin: 11
---

如果你最近一段时间在程序员圈里晃荡，肯定听到过 **Claude Code**。Anthropic 出的命令行编程工具，2025 年彻底火了。

但很多人没搞清楚它和 Cursor 的差别。这篇文章讲透：**Claude Code 是个啥、跟 Cursor 哪不一样、怎么装、怎么用、坑在哪**。

> 注：这是面向有一点编程背景的读者。完全没敲过代码的，可以先收藏，等你试着写第一行代码的时候再回来。

## 1. Claude Code 不是 IDE，是 CLI

打开它，你看到的不是花哨的窗口、不是侧边栏。**就是一个命令行**。

```bash
$ claude
> _
```

你在这里跟 Claude 对话。它能：

- **读你的项目代码**（不用你复制粘贴）
- **改文件**（自己定位文件、自己改）
- **跑命令**（`npm install`、`pytest`、`git diff` 等等它自己执行）
- **看到结果再决定下一步**

你不需要切到 IDE 里复制代码、贴回 ChatGPT、再贴回去。**它就在你的项目里干活**。

> **本质上 Claude Code 是一个"编程版的 Agent"**。底层就是 [Function Calling](/blog/function-calling) + [MCP](/blog/mcp-protocol) + 一个非常聪明的模型。

## 2. Claude Code vs Cursor：到底哪不同

最常见的混淆。简短版：

| 维度 | Cursor | Claude Code |
|------|--------|-------------|
| 形态 | IDE（fork 的 VSCode）| 命令行 CLI |
| 主战场 | 代码补全 + 边写边问 | 大块任务、自主执行 |
| AI 能动手吗 | 主要建议，部分能动手 | **大幅度自主**——读、写、跑 |
| 适合场景 | 边写代码边咨询 | 让它自己干一段时间，回头看结果 |
| 上手成本 | 跟 VSCode 差不多 | 命令行不熟悉的人门槛高 |
| 价格 | $20/月，模型默认 Sonnet/GPT-4o | 按 Claude API 用量计费，或 $20/月 Pro |

**画风对比**：

- **Cursor**：你在打字写函数，它弹出建议帮你补完。你在主导，它在辅助。
- **Claude Code**：你跟它说"加一个用户登录功能"，它自己找文件、改代码、跑测试、报告结果。**它在主导，你在 review**。

> **不是替代关系**。 很多人 Cursor 写日常代码，Claude Code 跑较大任务。两个都用。

## 3. 怎么装

环境要求：装了 Node.js（>= 18）。

```bash
npm install -g @anthropic-ai/claude-code
```

第一次运行：

```bash
claude
```

会弹出登录链接，浏览器登录 Anthropic 账号即可。**国内能不能用**：能，但 Anthropic API 在国内访问不稳定，需要在 `~/.config/claude/config.json` 里配代理。

## 4. 第一次用：3 个上手任务

进入项目目录后，跑 `claude`。然后试试：

### 任务 1：让它解释代码

```
> 解释一下 src/utils/auth.ts 里的逻辑，这个文件做啥的
```

它会读这个文件，然后讲给你听。**不需要你贴代码**。

### 任务 2：让它改一行代码

```
> 把 src/components/Button.tsx 里的默认颜色从蓝色改成绿色
```

它会：找到文件 → 定位到颜色的那一行 → 改 → 让你确认（默认开 `--auto-edit` 时就直接改）。

### 任务 3：让它写一个功能

```
> 帮我加一个 dark mode 切换。可以用 Tailwind 的 dark: 前缀。
> 状态用 localStorage 存。在 Header 右边加一个图标按钮。
```

它会：读你的项目结构 → 制定改动计划 → 创建 / 修改若干文件 → 跑 `npm run build` 验证 → 跟你汇报。

**第一次看到一个"AI 同事"在自己的项目里干活，那种感觉很奇妙**。

## 5. 几个关键配置

### `CLAUDE.md` —— 项目说明书

在项目根目录放一个 `CLAUDE.md`，写清楚：项目是干啥的、用了什么栈、有哪些约定、跑命令的方式。

每次启动 Claude Code 时，它会自动读这个文件作为长期记忆。**这个习惯能让它效率提升一倍以上**——它不会再问"我应该用 npm 还是 pnpm"这种基础问题。

> 这个网站的 [`CLAUDE.md`](/blog) 就是给 Claude Code 写的。可以参考。

### `.claude/settings.json` —— 权限与钩子

可以配置：

- **允许 / 禁止哪些 Bash 命令**（比如禁止 `rm -rf`）
- **写入文件前要不要确认**
- **钩子（hooks）**：在某些事件触发时自动执行命令（比如保存代码时自动跑 lint）

### `--dangerously-skip-permissions`

这个参数让 Claude Code **完全不问、自动执行所有动作**。**慎用**。只在你完全信任任务、且能 git 回滚的情况下用。

## 6. 5 个真实使用场景

我自己最常用的：

1. **重构现有代码**："把 src/ 下所有的 var 都改成 const，并跑一遍 ESLint"
2. **写测试**："给 src/utils/date.ts 写一份完整的单元测试"
3. **看陌生代码库**："这是我刚 clone 的项目，帮我画一下整体架构图"
4. **批量小改**："给所有 React 组件加上中文 JSDoc 注释"
5. **从需求文档到 PR**：写一份 markdown 描述功能 → 让 Claude Code 自己实现 → 看 git diff → 提交

**最强的能力是 \"半自主跑长任务\"**：你说一个目标，它干 5–20 分钟，期间它会自己写代码、跑测试、报错时自己排查、需要你拍板时停下来问你。

## 7. 坑和注意事项

⚠️ **它会犯错**。改错文件、删错代码、跑错命令——都见过。**对策**：每次让它干活之前先 commit 一次，干完看 `git diff` 再决定提不提交。

⚠️ **大改动容易跑飞**。任务太大它会"想太多"——开始改一堆无关的文件、写一堆冗余抽象。**对策**：把大任务**拆小**，让它一次只干一个功能。

⚠️ **token 烧得快**。一个稍微复杂的任务可能消耗几百万 token，按 API 计费的话 $5–$20 一次。**对策**：用 Pro 套餐（包月），或在 `CLAUDE.md` 里限制它读的范围。

⚠️ **它可能瞎装包**。它觉得需要某个库就 `npm install` 装上了。**对策**：留意 package.json 的变动，不要的就回退掉。

## 8. 它适合谁

✅ **适合**：

- 已经会基础编程，想加速日常开发
- 需要快速接手陌生项目、读老代码
- 业务原型阶段，要一周搭完一个 MVP
- 写测试、写脚手架、做批量重构这种繁琐活

❌ **不适合**：

- 完全不会编程的——你 review 不了它的输出，反而危险
- 安全要求极高的代码（金融、医疗）——出错代价大
- 需要深度系统设计的任务——它擅长写代码，不擅长架构决策

## 9. 三句话复盘

- **Claude Code = 命令行里的编程 Agent，能直接读改你的项目**
- **跟 Cursor 互补**——Cursor 适合边写边问，Claude Code 适合让它自己干一阵
- **关键是 `CLAUDE.md` + 拆小任务 + git 安全网**

> 下一个 AI 编程工具浪潮已经到了——从"代码补全 (Copilot)"，到"代码助手 (Cursor)"，到"代码 Agent (Claude Code、Devin)"。**会编程的门槛在慢慢被推平。但能 review 别人代码、能拆解需求的能力反而越来越值钱**。

延伸阅读：[Agent 到底是个啥](/blog/agent-explained) · [MCP：AI 的 USB 接口](/blog/mcp-protocol) · [Function Calling 看懂](/blog/function-calling)
