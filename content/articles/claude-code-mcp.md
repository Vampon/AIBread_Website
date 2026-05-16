---
title: "Claude Code 接 MCP：把 Notion、GitHub 变成 AI 的工具"
slug: claude-code-mcp
excerpt: "MCP 是协议，Claude Code 是它的最大用户之一。一篇讲清 Claude Code 里怎么装 MCP server、它跟内置工具的区别、以及为什么「装上 MCP 你的 Claude 突然变成全才」。"
tag: "Claude Code"
date: "2026-04-21"
cover: "/placeholders/cover-3.svg"
readMin: 6
---

[MCP（Model Context Protocol）](/blog/mcp-protocol)是 Anthropic 牵头搞的一个开放协议——讲完原理你可能觉得抽象。

那放进 Claude Code 里就具体了：**MCP 是把外面的服务"接到"Claude 工具列表里的协议**。装上 Notion MCP，Claude 就有了 Notion 工具；装上 GitHub MCP，Claude 就能用 PR 工具。

## 1. 内置工具 vs MCP 工具

回顾[工具循环](/blog/how-claude-uses-tools)：Claude 启动时有一份**工具菜单**（Read / Bash / Edit / Glob / Grep / Write……）。

MCP 干的事很简单：**把额外的工具加进这份菜单**。

| 来源 | 例子 | 谁实现的 |
|------|------|---------|
| 内置 | Read / Bash / Edit | Claude Code 本身 |
| MCP | NotionSearch / GithubCreatePR | 第三方写的 MCP server |

对模型来说**没差别**——它看到的就是一个工具列表，决定调谁、传什么参数。

## 2. 装一个 MCP server 长什么样

Claude Code 的 settings.json：

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/mcp-server"],
      "env": { "NOTION_TOKEN": "secret_xxx" }
    }
  }
}
```

启动 Claude Code 时它做的事：

1. 启动 `npx @notionhq/mcp-server` 这个进程
2. 通过 stdio 跟它握手（"你都有什么工具？"）
3. server 回："我有 search、createPage、updateBlock 三个工具，参数分别是……"
4. Claude Code 把这些工具**加进**给模型的菜单
5. 之后模型可以直接调用 `notion.search(query="周报")`，Claude Code 通过 MCP 协议**转发**给 server

## 3. 你能接什么

社区已经有的 MCP server（不完全列表）：

- **数据库**：postgres / mysql / sqlite / mongodb
- **办公**：Notion / Google Drive / Slack / Linear / Jira
- **代码**：GitHub / GitLab / Sentry
- **文件**：S3 / Cloudflare R2
- **检索**：Brave Search / Perplexity / Wikipedia
- **专门**：Figma（读设计稿）/ Postman（跑 API 测试）

一个简单粗暴的总结：**任何有 API 的服务，都有人在写它的 MCP server，没有的话你也能自己写**。

## 4. MCP server 自己写难吗

不难。Anthropic 提供 SDK（TypeScript / Python）：

```typescript
import { Server } from "@modelcontextprotocol/sdk";

const server = new Server({ name: "my-tool", version: "0.1.0" });

server.tool(
  "weather",
  "获取一个城市的天气",
  { city: z.string() },
  async ({ city }) => {
    const data = await fetch(`https://api.weather.com/${city}`);
    return data.json();
  }
);

server.run();
```

写完装到 Claude Code 的 settings.json 里就能用。**让 Claude 帮你写，10 分钟就有一个**。

## 5. 实战：用 MCP 让 Claude 接管 Notion

假设你日常在 Notion 里管周报。装上 Notion MCP 后，你可以：

```
> 我这周做了什么？看 Notion 里的"周报"页
[Claude 调用 notion.search("周报")]
[找到周报页，调用 notion.getPageContent]
[读完]
看到了。这周你完成了 3 个任务，1 个在做……
```

```
> 帮我把今天的会议记录追加到周报
[读今天日期]
[notion.appendBlock(pageId, content)]
已加上。
```

整个过程**你不用打开 Notion**。Claude Code 在终端里替你操作。

## 6. 风险与边界

**a) 凭证管理**。MCP server 经常要 API token——这些写在 settings.json 里，**不要 commit**。

**b) 权限粒度**。MCP 工具一样走 [权限系统](/blog/claude-code-permissions)。装 GitHub MCP 时，建议**先只给只读权限的 token**，等你信任了再升级到能创建 PR 的。

**c) 服务可用性**。MCP server 是独立进程，崩了 / 网炸了 → 工具不可用。Claude 看到工具失败会重试，重试都失败会告诉你。

**d) 别装太多**。每个 MCP server 都给模型加了一份"我有这些工具"的菜单——菜单太长会**稀释模型的注意力**，反而选不准。**只装你真用的**。

## 7. 一句话总结

> MCP 让 Claude Code 从"读写本地文件 + 跑命令"扩展到"操作所有外部服务"。

理解这点，你就理解了为什么 Anthropic 把它定为**主推的协议**——它解决的不是 Claude Code 一家的问题，是**所有 AI Agent 共同的问题**。

---

想直观看 MCP 工具被装载和调用的过程？去 [Claude 课](/cc) 试 MCP 场景。
