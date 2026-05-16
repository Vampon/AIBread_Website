---
title: "Claude Code 权限系统：在动手之前先问一声"
slug: claude-code-permissions
excerpt: "Claude Code 默认会先问你才执行 Bash、Edit 这种「动手」工具。这是它和 ChatGPT 最关键的安全设计。一篇讲清四种权限模式、白名单怎么写、怎么放心地放它跑。"
tag: "Claude Code"
date: "2026-04-29"
cover: "/placeholders/cover-2.svg"
readMin: 6
---

第一次用 Claude Code 的人最常的反应是：

> "它弹这么多确认窗，烦死了。"

但你换个角度想：**你愿意让一个素未谋面的程序，未经允许就跑 `rm -rf` 删你的文件吗？**

这就是 Claude Code 权限系统存在的理由——它默认**保守**，让你保留所有动手权的最终决定权。

## 1. 工具分两类：动嘴的 vs 动手的

Claude 用[工具循环](/blog/how-claude-uses-tools)干活。但工具其实分两类：

| 类别 | 例子 | 默认行为 |
|------|------|---------|
| **只读** | Read、Glob、Grep | **不问，直接跑** |
| **会改环境** | Bash、Edit、Write | **每次都弹窗问** |

你让它读 README，它直接读。你让它删 dist 目录，它会停下来问你"我要 `rm -rf dist`，你确定？"

## 2. 三种权限决定

弹窗里你有三个按钮：

- **允许一次**：本次执行，下次类似操作还会再问。
- **允许本会话**：这把对话里同一个工具不再问。退出 Claude 重启又恢复要问。
- **拒绝**：模型收到拒绝信号，**会换思路**——它知道这条路不通，可能转去用别的工具，或者告诉你"那我做不了"。

> 拒绝**不是**抛错让它崩。是把"被拒绝"这个事实告诉模型，让它继续推理。这点很妙。

## 3. 四种权限模式（启动参数）

启动 `claude` 时可以选模式：

```bash
claude                              # 默认：动手前问
claude --permission-mode acceptEdits  # 自动接受所有编辑
claude --permission-mode plan         # 计划模式：先告诉你它要做什么，不真的做
claude --dangerously-skip-permissions # 全部跳过（沙箱里玩）
```

**实战推荐**：

- **新项目 / 不熟悉的代码**：默认模式，老老实实问。
- **重构 / 大批量改动**：`acceptEdits`，省得每次按允许。但**前置条件是 git commit 干净**——出问题能 `git reset` 回来。
- **想看它会做什么但不想真做**：`plan` 模式，相当于让它写计划书。
- **`--dangerously-skip-permissions`**：只有在 docker / 一次性 VM 这种隔离环境里玩。**别在真正项目里开**。

## 4. 永久白名单：写在 settings.json

每次都按"允许本会话"也累。可以把信任的命令固化下来：

```json
// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(npm test)",
      "Read",
      "Glob",
      "Grep"
    ]
  }
}
```

这样：

- `Read` / `Glob` / `Grep` 全自动放行（其实它们默认也不问，写一下更明确）
- `Bash(git status)` 和 `Bash(npm test)` 这两个具体命令直接跑，不问
- 其他 Bash 命令照旧弹窗

支持**精确匹配**，也支持模式（看官方文档配置语法）。**别贪图省事写 `Bash` 全允许**——等于把厨房钥匙全交出去。

## 5. 进阶：用 hooks 加自定义检查

如果默认权限粒度不够细，可以接 [hooks](/blog/claude-code-hooks)。

比如你不想让它执行任何含 `rm` 的 Bash：

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/check-bash.sh" }] }
    ]
  }
}
```

每次 Bash 工具被调用前，先跑你的脚本。脚本里检查参数，遇到 `rm` 就 `exit 1`——hook 失败 = 工具被拒绝。

## 6. 为什么这套设计很重要

ChatGPT / Claude 网页版只能写字，最坏结果是**给你错信息**。

Claude Code 能动手，最坏结果是**真的删掉东西、推到 main 分支、跑掉钱包里的钱**（API 调用是收费的）。

弹窗确认机制 + 白名单 + hooks 三层防御，把"AI 失误"的代价**压到你能 review 的范围内**。麻烦，但值得。

> 这是一种**生活智慧**：不是不让 AI 干活，是**让你能随时按停**。

---

想直观感受一次权限弹窗？去 [Claude 课](/cc) 输入"帮我删掉 dist 目录"，看模型怎么停下来等你决策。
