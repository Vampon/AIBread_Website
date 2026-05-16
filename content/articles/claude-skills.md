---
title: "Skills：教 Claude 学会一招的标准格式"
slug: claude-skills
excerpt: "Skill 是 Claude Code 里「一段标准化的工作流」。比 slash 命令更结构化，能自动加载，还能跨项目复用。一篇讲清 skill 怎么写、和 hooks/subagents 的差别。"
tag: "Claude Code"
date: "2026-04-22"
cover: "/placeholders/cover-2.svg"
readMin: 5
---

你跟 Claude Code 说"review 一下这个 PR"，它没问你具体怎么 review，直接开始干活——按一套**清晰的流程**：先看 diff、按类型分类问题、给优先级、最后输出报告。

它怎么知道要这么做？因为有人写过一个 **review skill**——一段固化的"我接到 review 任务就这么干"的标准流程。

## 1. Skill = "起了名字的工作流"

回想 [slash 命令](/blog/claude-code-slash-commands)：你敲 `/changelog`，Claude 按你写好的 prompt 干活。

Skill 是它的进阶版，多了三件事：

| 维度 | Slash 命令 | Skill |
|------|-----------|-------|
| **触发** | 显式（你敲 `/xxx`）| 显式 + **隐式**（关键词自动加载） |
| **内容** | 一段 markdown prompt | prompt + 工具偏好 + 触发规则 + 多文件 |
| **复用** | 项目内 / 用户级 | 还可发布成插件，跨项目装 |

## 2. 一个 skill 长什么样

`.claude/skills/code-review/SKILL.md`：

```markdown
---
name: code-review
description: 当用户要求 review 代码、看 PR、检查改动时使用
allowed-tools: [Read, Grep, Glob, Bash(git diff:*)]
---

接到 review 任务时按这个流程：

1. 跑 `git diff main...HEAD` 看所有改动
2. 按文件分组
3. 对每个文件检查：
   - 逻辑问题（边界条件、错误处理）
   - 性能（明显的 N+1、不必要的循环）
   - 风格（是否符合项目 CLAUDE.md 的约定）
4. 输出报告，格式：

   ## 总结
   - 高风险：N
   - 中风险：N
   
   ## 详情
   <按风险级排序>

不要直接改代码，只报告问题。
```

注意 `description` 里写了**触发条件**——这一句是给主代理看的："什么样的用户消息该激活我"。

## 3. 隐式触发：用户没敲 `/code-review` 也能用

用户说"帮我看一下这个改动"——主代理读到这句，判断 description 匹配，**自动加载** code-review skill 的内容到当前上下文，然后按里面的流程干活。

**用户感知不到 skill 的存在**——它就是"Claude 突然变得很会 review"。

## 4. 跟 hooks / subagent 的区别

容易混淆，给一张对比表：

| 机制 | 何时介入 | 主要价值 |
|------|---------|---------|
| **Skill** | 用户消息进来时按描述匹配 | 标准化某类任务的**做法** |
| **Subagent** | 主代理自己决定派 | 隔离上下文，跑大任务 |
| **Hook** | 工具调用前 / 后 / 提交前等节点 | 在执行流里**加一层自定义代码** |

实战常常**同时用**。比如 review 这件事：

- **skill** 定义"review 怎么做"
- skill 里说**派一个 subagent** 去跑测试（避免污染主上下文）
- 用户接受改动时，**hook** 自动 `git commit`

## 5. 怎么发现新 skill 该写

观察自己的工作流。重复做的事都是 skill 候选：

- 每次 PR 后写 changelog → `/changelog` 或 `changelog` skill
- 每次新功能要写 5 个测试用例 → `add-tests` skill
- 每周三整理周报 → `weekly-summary` skill（你周三说"帮我整一下本周"它自动加载）

写一个 skill 通常 10 分钟。但下次它每次执行都按你的标准流程——长期看是几十倍回报。

## 6. 共享 skill：插件市场

你写好的 skill 可以**打包成插件发布**——别的团队装上后，他们的 Claude Code 也会该这一招。

主流来源：

- 官方 marketplace
- 公司内部分发
- 个人在 GitHub 上分享

> 这一点和 [MCP](/blog/mcp-protocol) 配合很妙：MCP 给 AI 装"新工具"，skill 给 AI 装"新做法"。两个都装上，AI 能干的事**指数级**增加。

## 7. 一句话总结

> Skill = "把一个工作流写下来，让 Claude 自动按这个流程做事"。

理解这点你就理解了**为什么不同人手里的 Claude Code 表现差很多**——不是模型不一样，是**他们装的 skill 不一样**。

---

想直观看 skill 是怎么自动加载的？去 [Claude 课](/cc) 触发 review skill 场景。
