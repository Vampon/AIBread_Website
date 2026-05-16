---
title: "Hooks：在工具调用前后插一脚"
slug: claude-code-hooks
excerpt: "Hooks 是 Claude Code 的「中间件」。每次模型要调工具、每次它响应你之前，hooks 都能跑你写的脚本，做检查、改写、甚至拦截。一篇讲清四种 hook、配置语法、实战场景。"
tag: "Claude Code"
date: "2026-04-23"
cover: "/placeholders/cover-1.svg"
readMin: 6
---

[权限系统](/blog/claude-code-permissions)给你"允许/拒绝"两个粗按钮。但很多时候你想要的是**更细的控制**：

> "Bash 命令我都允许，但**不能含 rm**。"
>
> "改代码可以，**但每次改完自动跑一下 prettier**。"
>
> "对话每次结束**自动 commit 一下进度**。"

这种细活，是 Hooks 的舞台。

## 1. Hooks = "在关键节点跑你的脚本"

Claude Code 在执行过程中有一些**已知节点**：

- 模型决定要调一个工具时（**PreToolUse**）
- 工具刚执行完时（**PostToolUse**）
- 模型给你最终回复之前（**Stop**）
- 你按下回车提交输入时（**UserPromptSubmit**）

每个节点你都可以挂一段**自己的脚本**。脚本能：

- 看到这一刻的上下文（哪个工具、参数是啥）
- **改写**参数（比如自动给所有 Bash 命令加 `--dry-run`）
- **拦截**（exit code 非 0 → 工具被取消）
- 输出新内容塞回去（比如告诉模型"我帮你跑了 lint，结果是……"）

是 Claude Code 里**最强大也最容易玩坏**的功能。

## 2. 配置长什么样

写在 `.claude/settings.json` 或 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/check-bash.sh"
          }
        ]
      }
    ]
  }
}
```

意思：每次 Claude 要用 Bash 工具，先跑 `check-bash.sh`。脚本看到工具参数（从 stdin 读 JSON），决定 `exit 0`（放行）还是 `exit 1`（拦下）。

## 3. 四种 hook 速查

| Hook | 触发时机 | 典型用途 |
|------|---------|---------|
| `PreToolUse` | 工具调用前 | 拦截危险命令、改写参数 |
| `PostToolUse` | 工具调用后 | 自动跑格式化、记录日志 |
| `UserPromptSubmit` | 你按回车后、模型还没看到前 | 给输入加上下文 |
| `Stop` | 模型给最终回复前 | 自动 commit、自动测试 |

## 4. 实战：拦截危险 Bash

`.claude/check-bash.sh`：

```bash
#!/usr/bin/env bash
# 从 stdin 读 hook 输入，包含工具调用的 JSON

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

# 拦截含 rm -rf 的命令
if echo "$command" | grep -qE 'rm\s+-rf'; then
  echo "Blocked: rm -rf 不允许执行" >&2
  exit 1
fi

exit 0
```

记得 `chmod +x .claude/check-bash.sh`。

## 5. 实战：保存即格式化

`.claude/auto-prettier.sh`：

```bash
#!/usr/bin/env bash
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path')

# 只对代码文件跑
if [[ "$file" =~ \.(ts|tsx|js|jsx|json|md)$ ]]; then
  npx prettier --write "$file" >/dev/null 2>&1
fi
```

settings.json：

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": ".claude/auto-prettier.sh" }] }
    ]
  }
}
```

效果：每次 Claude Edit / Write 一个文件，自动跑 prettier 格式化。**模型不需要知道 prettier 存在**。

## 6. 注意事项

**a) Hooks 跑得慢就一切都慢。** 每次工具调用都加几百毫秒，30 个工具调用就是几秒延迟。脚本写得轻一点。

**b) Hooks 不要修改它不该修改的东西。** PreToolUse 改个参数 OK；改了之后跟模型期望的不一致，模型会迷茫。

**c) 调试技巧**：脚本里 `echo "..." >&2` 输出到 stderr，Claude Code 会显示，能看到 hook 跑了啥。

**d) 别让 hooks 替代权限**。权限系统是给"是否动手"的粗判断；hooks 是给"动手时具体怎么动"的细控制。两个互补。

## 7. 一句话总结

> Hooks = "把 Claude Code 的关键事件接出来跑你的代码"。

它让 Claude Code 从一个"AI 助手"变成"AI 助手 + 一套你定制的护栏"。**老用户和新用户的差距，一半在这里。**

---

想看 hook 怎么拦截一个危险 Bash？去 [Claude 课](/cc) 试 hooks 场景。
