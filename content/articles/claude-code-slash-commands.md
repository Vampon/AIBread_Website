---
title: "Slash 命令：Claude Code 的快捷开关"
slug: claude-code-slash-commands
excerpt: "Claude Code 里以 / 开头的输入会绕开模型，直接进命令分发器。一篇讲清内置命令清单、怎么自己写一个 slash 命令、以及它和插件技能的关系。"
tag: "Claude Code"
date: "2026-04-25"
cover: "/placeholders/cover-5.svg"
readMin: 5
---

你在 Claude Code 里敲 `/help`，回车，会看到一份命令列表——速度比你跟它说"列一下命令"快多了。

为什么？**因为 `/` 开头的输入根本没走模型**。

## 1. 两条输入路径

Claude Code 把你的输入分两类处理：

| 输入形式 | 怎么走 |
|---------|--------|
| `怎么把 dist 删了` | 全文打包 → 进模型推理 → 模型决定调工具 |
| `/compact` | 直接进**命令分发器** → 找到 compact 这个内置技能 → 执行 |

**前者要等模型生成（几秒）。后者瞬间执行**——差别就在这里。

## 2. 内置命令大全

最常用的几个：

```
/help        列出所有可用命令
/init        扫描项目并生成 CLAUDE.md 草稿
/compact     压缩当前对话，腾 token
/clear       清空当前会话（重开）
/permissions 打开权限设置 UI
/model       切换模型（比如 Opus → Sonnet）
/cost        看本次会话花了多少钱
/exit        退出
```

不同版本可能多几个少几个，敲 `/help` 看当前实际有的。

## 3. 自定义 slash 命令

你可以**自己写一个**。在项目根目录建：

```
.claude/commands/changelog.md
```

文件内容：

```markdown
---
description: 根据最近的 git commit 生成变更日志
---

请：
1. 跑 `git log --oneline -20` 看最近 20 个 commit
2. 按"功能 / 修复 / 重构"分类
3. 用项目根目录 CHANGELOG.md 的格式追加到文件顶部
```

下次你敲 `/changelog`，Claude Code 把这段 markdown **作为新的用户消息**塞给模型——模型按这段步骤干活。

**等于把"标准操作"封装成一键执行。**

跟普通对话相比的好处：

- 不用每次重新解释流程
- 标准化（每个团队成员敲 `/changelog` 行为一致）
- 可以 commit 进 git，团队共享

## 4. 用户级 vs 项目级

跟 [CLAUDE.md](/blog/claude-md-best-practices) 一样，slash 命令也分级：

- **项目级**：`./.claude/commands/*.md`，commit 进 git，团队共享
- **用户级**：`~/.claude/commands/*.md`，只你自己有

个人小技巧（`/standup` 写昨日今日）放用户级；项目流程（`/changelog`、`/release-prep`）放项目级。

## 5. 跟"技能"（Skills）什么关系

[Skills](/blog/claude-skills) 是更高级的封装——一个 skill 不只是一段 prompt，可能包含：

- 触发条件（关键词匹配，不一定要 slash 命令）
- 多个文件 / 工具
- 执行流程

Slash 命令是 skill 的**显式触发**。同一个能力既可以做成 skill（关键词自动加载），也可以挂个 `/<name>` 让你能手动调出来。

## 6. 一个让 AI 写命令的有趣套路

懒人推荐：

```
让 AI 帮我写一个 slash 命令，叫 /code-review，
它扫描 git diff 然后按"逻辑问题 / 风格 / 性能"分类报告
```

Claude Code 会**给你写一个 .claude/commands/code-review.md 出来**。改一下你想要的细节，commit 进项目。

下次任何成员敲 `/code-review`，享受到的是**整个团队的最佳 review 实践**。

## 7. 一句话总结

> Slash 命令 = "把一段 prompt 起个短名，将来一个键召唤它出来"。

理解这点，你会开始**把所有重复操作都封装成 `/`**——这是 Claude Code 老用户共同的习惯。

---

现场看一下 slash 命令的执行路径？去 [Claude 课](/cc)，敲 `/help` 试试。
