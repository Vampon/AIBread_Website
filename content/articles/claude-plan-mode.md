---
title: "Plan 模式:让 AI 先想清楚再动手"
slug: claude-plan-mode
excerpt: "给 Claude Code 加一个 --permission-mode plan,它就只列方案不动手。一篇讲清三种权限模式怎么选、plan 模式什么时候特别好用、和 acceptEdits 的搭配套路。"
tag: "Claude Code"
date: "2026-04-19"
cover: "/placeholders/cover-1.svg"
readMin: 5
---

你给 Claude Code 一句「重构一下 src/auth 模块」——它**直接动手**,改了 8 个文件 200 行。

回头你看 diff,**很多东西不是你想要的**。但 git 已经被改了,要回滚一通操作。

**这就是 plan 模式存在的理由**:让 AI **先告诉你它准备怎么做**,你确认了再开始。

## 1. 权限模式三选一

启动时加参数选模式:

```bash
claude                                  # default 模式
claude --permission-mode plan           # plan 模式
claude --permission-mode acceptEdits    # acceptEdits 模式
```

| 模式 | 行为 | 适合场景 |
|------|------|---------|
| `default` | 动手前每次问你 | 不熟的代码、生产环境 |
| `plan` | 只读,不动手 | **大需求先看方案**、给同事 review |
| `acceptEdits` | Edit 自动放行 | 重构、git 干净时狂奔 |

## 2. Plan 模式具体禁止什么

进了 plan 模式,**所有「会改环境」的工具都被关掉**:

- ❌ Edit / Write / NotebookEdit
- ❌ Bash(除非是只读命令如 `git status`)
- ❌ MCP 写工具(如 Notion 写、GitHub 创 PR)

**还能做的**:

- ✓ Read / Glob / Grep / WebFetch
- ✓ Bash 的查询命令
- ✓ TodoWrite(只是规划,不动文件)

所以 plan 模式下 Claude **能完整看一遍代码**,但**只能输出文字**——通常给你一份结构化的计划。

## 3. 实战流程:plan → 讨论 → 执行

最舒服的工作流:

```bash
# 1. 用 plan 模式启动
claude --permission-mode plan

# 2. 给一个大需求
> 重构 src/auth 模块,把 token 校验逻辑统一起来
```

它会:扫文件、读关键文件、最后给一份**步骤清单 + 预估改动**。

你看完觉得 OK,**退出**,用 acceptEdits 模式重启:

```bash
claude --permission-mode acceptEdits
> 按上次那个计划做
```

(它通过 [/resume](/blog/claude-code-session) 找回你刚才的会话)

## 4. 不退出怎么从 plan 切到执行?

`/permissions` 命令可以**会话内切换**:

```
> /permissions
[选 acceptEdits]
> 按计划做
```

但要注意:你已经从 plan 模式累积了一堆只读上下文,切到 accept 模式不会让 Claude 重新规划——它会**直接照计划做**,所以**确认计划再切**。

## 5. Plan 模式的隐藏好处:省 token

**只读工具不会改环境,意味着每次工具调用都可以被缓存**。同一个项目里反复用 plan 模式探索,后续会话的[缓存命中率](/blog/claude-code-cost)非常高,**比 default 模式便宜不止一半**。

## 6. 不要用 plan 模式的场景

- **小需求**(改一个文案、加一行 console.log):杀鸡用牛刀,直接 default。
- **你已经知道怎么改**:让它直接做,plan 是浪费一轮。
- **AI 写代码翻车多的语言/框架**:plan 模式给的方案可能本身就有问题,不如它写一版你直接看 diff。

## 7. 一句话总结

> Plan 模式 = 「先看 AI 怎么想,再决定让不让它干」。

新手用 default,熟手用 plan + acceptEdits 套路——**没人天天用 acceptEdits 单刷**,因为没人想被 AI 在不知情时改 200 行代码。

---

想直观感受 plan 模式给出的计划长什么样?去 [Claude 课](/cc) 试 `/plan` 场景。
