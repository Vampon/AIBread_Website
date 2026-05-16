---
title: "会话恢复:关掉终端不会丢前面的对话"
slug: claude-code-session
excerpt: "/resume 让你回到任何一次历史对话,完整上下文 + 工具记录都在。一篇讲清会话存哪里、跨项目恢复要注意什么、和 /clear /compact 的差别。"
tag: "Claude Code"
date: "2026-04-16"
cover: "/placeholders/cover-5.svg"
readMin: 5
---

新人常问:

> 「我跟 Claude Code 聊到一半要关电脑,明天还能接着聊吗?」

能。**Claude Code 把每次对话自动存到本地**,`/resume` 一键找回。这一篇讲清 session 怎么工作、什么时候该用、什么时候用 /clear 更好。

## 1. 自动保存,不需要你做任何事

每次你启动 Claude Code,它做的第一件事(在读 [CLAUDE.md](/blog/claude-md-best-practices) 之前):

1. 给当前会话生成一个 ID
2. 在 `~/.claude/sessions/` 下开一个新文件
3. **每条消息、每次工具调用、每次状态变化**都追加写入

退出时不需要 save——它**已经实时存了**。

想看自己的会话目录:

```bash
ls -la ~/.claude/sessions/
```

会看到一堆 `.jsonl` 文件,每行一个事件。

## 2. /resume 的两种用法

### 列出所有,挑一个

```
> /resume
```

输出:

```
[1] 今天 14:30 · my-tool/      · 改首页 hero 文案 (23 轮)
[2] 昨天 19:00 · my-blog/      · 写 claude-skills.md (8 轮)
[3] 3 天前    · my-api/        · 调试 webhook 鉴权 (41 轮)
```

输入 `1` 或 session ID,**完整上下文加载**:

- 消息历史
- 所有工具调用 + 结果
- 当时的 cwd / permission mode
- 当时已加载的 [skills](/blog/claude-skills)、MCP server

就像你**没退出过**。

### 直接接最近的:--continue

```bash
claude --continue
# 或简写
claude -c
```

跳过列表,**直接接最近一次**对话。最常用——早上开机第一件事。

## 3. 跨项目恢复要小心什么

如果你在 `~/my-tool/` 启动,但选了来自 `~/my-api/` 的会话,Claude Code **会警告**:

```
⚠ 警告:这个会话原 cwd 是 ~/my-api/。
里面引用的相对路径(如 ./src/auth.ts)可能在当前目录找不到。
继续恢复吗?[y/N]
```

为什么?因为历史对话里大量是 `Read("./src/auth.ts")` 这种**相对路径**——当前目录没这文件,模型回头看历史会困惑。

**两种解法**:

- **cd 过去**再 `--continue`:`cd ~/my-api && claude -c`
- **新建会话**,把需要的上下文**手动告诉它**:「我之前在 my-api 调试 webhook,核心问题是 X,现在要做 Y」

## 4. /resume vs /clear vs /compact 怎么选

容易混的三个,场景对比:

| 命令 | 行为 | 什么时候用 |
|------|------|-----------|
| `/resume` | 加载某个**历史**会话 | 接着昨天的活、找回不小心 /clear 的对话 |
| `/clear` | **清空当前**会话,重开 | 任务完全切换、上下文混乱 |
| `/compact` | 压缩当前对话历史 | 上下文快满,但任务还在继续 |

「我现在在 A 任务,要切到 B 任务」 → 大多数人用 `/clear`,少数情况 `/compact`。**不要用 /resume 切任务**——它是回到过去,不是开始新的。

## 5. /clear 后悔了怎么办

很常见:`/clear` 一下子,刚才的 30 轮对话没了——你才意识到里面有重要信息。

不用慌:

```
> /resume
[选刚才那条会话]
```

**/clear 不会删历史 session 文件**——它只是开了个新会话。旧会话还在 `~/.claude/sessions/` 里安静躺着。

## 6. 跨机同步?目前还不行

session 文件是**本地**的。换一台机器没办法直接看到原本机器的对话。

绕过办法:

- **手动同步**目录:`~/.claude/sessions/` 放进 Dropbox / 用 syncthing 同步
- **Web 版**(claude.ai/code):用账号登,会话云存
- **未来 roadmap**:Anthropic 有计划把 CLI session 也云同步,但目前没合并

## 7. 实战工作流

我个人的常态:

- **早上开机**:`claude -c`(接着昨晚)
- **任务完成,要换一个不相关的事**:`/clear`
- **任务还在做但桌面快满**:`/compact`
- **不小心 /clear 了刚才的精彩对话**:`/resume`,选最近那条
- **接同事丢过来的 issue,要参考之前类似 issue 的对话**:`/resume`,搜关键词

把这套流程跑顺,**Claude Code 就成了一个有记忆的工作伙伴**——不是每次都从零开始。

## 8. 一句话总结

> /resume = 「之前那次对话还在,继续」。

理解 session 是**自动保存的本地文件**,你就再也不会因为 「不小心退出」 而紧张——它一直在那。

---

想看会话列表长什么样、跨项目警告怎么出?去 [Claude 课](/cc) 试 `/resume` 场景。
