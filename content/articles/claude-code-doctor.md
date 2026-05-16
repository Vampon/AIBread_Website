---
title: "/doctor:装完先跑这个,省半小时排查"
slug: claude-code-doctor
excerpt: "新装的 Claude Code 跑不起来?第一件事跑 /doctor。一篇讲清它检查什么、最常见的红叉怎么解、为什么这一步能省掉两小时折腾。"
tag: "Claude Code"
date: "2026-04-17"
cover: "/placeholders/cover-4.svg"
readMin: 4
---

新装 Claude Code 第一次跑就报错的概率,比你想的高。

不是软件烂,是 Claude Code 依赖的东西多——**API key、MCP server、权限文件、Node 版本**——任何一个出问题它都启动不了或者不正常。

`/doctor` 就是一键扫所有这些。**装完第一件事**,不是 `/help`,是 `/doctor`。

## 1. 它都查什么

进入 Claude Code 输入 `/doctor`,大概会输出 8-10 项:

```
✓ Anthropic API key            (ANTHROPIC_API_KEY 已设置)
✓ Model connectivity           (claude-opus-4-7, 320ms)
✓ settings.json valid          (~/.claude/settings.json)
✓ MCP server: notion           (3 tools loaded)
✗ MCP server: github           (stdio handshake timeout)
✓ Project CLAUDE.md            (./CLAUDE.md, 38 lines)
⚠ Node version                 (v18.20.0, recommend v20+)
✓ Permission mode              (default)
```

每一项独立打勾打叉。fail 项**会给一行修复建议**。

## 2. 最常见的 4 个红叉 + 解法

### a) ✗ Anthropic API key 没设

最常见。意味着你装好了 CLI 但没配 key。

```bash
# 临时
export ANTHROPIC_API_KEY=sk-ant-xxx

# 永久(macOS / Linux)
echo 'export ANTHROPIC_API_KEY=sk-ant-xxx' >> ~/.zshrc

# Windows PowerShell
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-xxx", "User")
```

也可以不用环境变量,登录 Pro/Max 账号——Claude Code 会自动拿 token。

### b) ✗ MCP server 握手超时

[MCP](/blog/claude-code-mcp) server 跑不起来。最常见原因:

- **第三方服务的 token 过期**(GH_TOKEN / NOTION_TOKEN 等)。去对应平台重新生成。
- **server 包没装**:settings.json 写了 `npx -y @xxx/mcp-server`,网络差了 npx 拉不到包。手动 `npm install -g @xxx/mcp-server` 一次。
- **stdio 路径不对**:本地写的 MCP server 路径写错了。用绝对路径或确认 cwd。

### c) ⚠ Node 版本过低

不致命,但有些 MCP server 需要 v20+ 的 fetch / streams API。

```bash
# 用 nvm 升级
nvm install 20
nvm use 20
```

### d) ✗ settings.json 解析失败

JSON 写错了(尾随逗号、引号转义)。

```bash
# 验证
cat ~/.claude/settings.json | jq .
```

报错的话拿到 jq 输出去对照修。

## 3. /doctor 的隐藏价值:升级前先体检

升级 Claude Code 后**立刻跑 /doctor**:

- 看新版有没有引入新检查项(经常会加,比如新版加了「TLS 1.3 support」)
- 看你的 settings.json 跟新版兼容不(偶尔字段会重命名)
- 看 MCP server 跟新版协议握手 OK 不

**比直接干活然后撞坑要快**——doctor 跑 5 秒,撞坑找原因可能 30 分钟。

## 4. 自定义 doctor 检查项?

目前(2026 年初)还**不能**——`/doctor` 是内置的,检查项是固定列表。社区在讨论开放 hook 让你加自定义检查,但还没合并。

如果你公司里有特殊环境检查需求(VPN、内部 CA、私有 npm registry),写一个 wrapper 脚本在启动 Claude Code 前跑——**不要等 doctor 出红叉再排**。

## 5. 跑通后的「干净启动」清单

`/doctor` 全绿后,新机器还可以多做几件事:

- `/permissions list` —— 看你的白名单,确认没有被同步过来不该信任的命令
- `/cost` —— 0(还没花钱),确认计费正常
- 在项目目录跑一次 `/init` —— 让它写一份 CLAUDE.md 草稿
- 跑一次「看一下 README」类小任务 —— 确认工具循环正常

**这套做完,你这台机器的 Claude Code 就稳了**。

## 6. 一句话总结

> /doctor = 「我的环境到底哪里没配好」一键回答。

写 issue 之前先 /doctor,**80% 的「跑不起来」问题不用提 issue**——红叉就告诉你了。

---

想看 /doctor 输出长什么样?去 [Claude 课](/cc) 试 `/doctor` 场景。
