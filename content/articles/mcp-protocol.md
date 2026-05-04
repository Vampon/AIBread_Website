---
title: "MCP 协议入门：AI 的 USB 接口"
slug: mcp-protocol
excerpt: "之前每个 AI 接每个工具都要单独写代码。MCP 把它统一成标准——你装一个 MCP server，所有支持 MCP 的 AI 都能用。"
tag: "AI 概念"
date: "2026-04-29"
cover: "/placeholders/cover-1.svg"
readMin: 9
---

2024 年底 Anthropic 推出 **MCP (Model Context Protocol)**。一年多过去，OpenAI、Google、所有主流 AI 公司全都跟进了。

如果说 [Function Calling](/blog/function-calling) 是给 AI 装"按钮"，那 **MCP 就是按钮的统一标准**。装一次，所有 AI 都能用。

读完这篇你会理解：MCP 在解决什么问题、它怎么工作、普通人现在能用 MCP 干什么。

## 1. 没有 MCP 之前，世界长这样

回到 2024 年初。你是个产品经理，想让 ChatGPT 能查公司的 Jira 工单。

你雇了个程序员写了套代码：

```
ChatGPT ←(自定义代码)→ Jira API
```

跑了一个月，挺好用。然后老板说：**那 Claude 也接一下？**

程序员叹气：好，再写一套（Claude 的 SDK 跟 OpenAI 不一样）。

```
Claude ←(自定义代码)→ Jira API
```

又跑了一个月，老板说：**Gemini 也接一下？通义千问也接一下？**

每接一个 AI 都要重写一遍。每加一个工具（GitHub、Slack、Notion……）都要 × N 个 AI 重新写一遍。

**这就是 MCP 出现之前的混乱**：

```
M 个 AI × N 个工具 = M × N 套代码
```

## 2. MCP 把它变成 M + N

**MCP 的核心想法**：在 AI 和工具之间，定一个**标准协议**。

工具方按这个协议实现一个 **MCP Server**，AI 方按这个协议实现一个 **MCP Client**。然后大家就能互相通信了——工具不用关心面对的是哪个 AI，AI 不用关心面对的是哪个工具。

```
所有支持 MCP 的 AI ←(MCP 协议)→ 所有 MCP Server
```

写一次 Jira MCP Server，**所有支持 MCP 的 AI（ChatGPT / Claude / Cursor / Windsurf...）都能直接用**。

> **就是 USB 啊**。USB 没出现之前，每个外设要单独配一根线（鼠标线、键盘线、打印机线、扫描仪线……）。USB 之后，**一个口通用**。
>
> MCP 之于 AI 工具生态，就是 USB 之于硬件外设。

## 3. MCP 一共有三件事

MCP Server 能向 AI 提供三种能力：

| 能力 | 解释 | 例子 |
|------|------|------|
| **Tools（工具）** | 让 AI 能调用的函数 | "查 Jira 工单"、"发 Slack 消息" |
| **Resources（资源）** | 让 AI 能读取的数据 | "公司 Wiki 的某一页"、"数据库某张表" |
| **Prompts（提示词模板）** | 预设的对话模板 | "代码 review 模板"、"会议纪要模板" |

最常用的是 Tools。99% 的 MCP Server 主要在提供工具能力。

## 4. 一个 MCP Server 长啥样

举个最简单的例子：你想让 AI 能读你电脑上某个文件夹的文件。

**没有 MCP**：自己写代码集成进 OpenAI SDK，再单独写一套集成进 Claude SDK……

**有 MCP**：你（或别人）写一个 `filesystem-mcp` 的 Server。它声明自己提供两个工具：

```
- read_file(path)        让 AI 读文件
- list_dir(path)         让 AI 列目录
```

然后你在 Claude Desktop 的配置里加一行 "我装了 filesystem-mcp"。**Claude 就自动获得了这两个能力**。

第二天 Cursor 也支持 MCP，你又把同一个 Server 加到 Cursor 配置里——**Cursor 也获得了这两个能力**。

> 想象一下硬件：你新买的 U 盘，插 Mac 上能用、插 Windows 上能用、插车载播放器上也能用。**没人为你单独写过驱动**——它遵循 USB 标准就行。

## 5. 现在已经有哪些 MCP Server 可用

社区生态已经爆炸式增长。挑几个常用的：

| MCP Server | 给 AI 装上后能干啥 |
|------------|-------------------|
| **filesystem** | 读写本地文件 |
| **github** | 操作 GitHub（查 issue、提 PR、看代码）|
| **slack** | 发 Slack 消息、查频道历史 |
| **postgres / sqlite** | 直接查数据库 |
| **puppeteer / playwright** | 控制浏览器，模拟操作 |
| **notion** | 读写 Notion 页面 |
| **figma** | 读 Figma 设计稿 |
| **brave-search / google-drive** | 搜索 + 网盘 |
| **memory** | 给 AI 装一个跨会话的记忆 |

[modelcontextprotocol.io](https://modelcontextprotocol.io) 上能搜到几百个。**自己写一个 MCP Server 也很简单**——就几十行代码。

## 6. 普通人怎么用上 MCP

**最快**：用 **Claude Desktop** 或 **Cursor**。它们都内置了 MCP 支持。

**配置流程**（以 Claude Desktop 为例）：

1. 打开 Claude Desktop 设置
2. 找到 MCP Servers 配置文件（一个 JSON）
3. 加一行：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/你/Documents"]
    }
  }
}
```

4. 重启 Claude Desktop

**做完之后**，你就可以对 Claude 说：

> "看一下我 Documents 文件夹里有啥，把 PDF 都列出来。"

它真的会去读你的文件夹（之前它只能空想）。

类似的：装 `github-mcp`，它就能直接帮你看 GitHub issue；装 `slack-mcp`，它就能帮你查 Slack 历史。**每装一个 MCP Server，你的 AI 助手就多一项实际能力**。

## 7. MCP 的"政治意义"

为啥这事重要：

**对开发者**：以前做一个 AI 集成是 N×M，现在是 N+M。**生态会爆炸式增长**。

**对用户**：以前换 AI 工具就要重新搞集成，现在 **MCP Server 一次配置、所有 AI 通用**。AI 厂商之间的"工具壁垒"被打破。

**对 AI 公司**：从"封闭花园"变成"开放生态"。Anthropic 主动公开 MCP 是个聪明的战略——它让所有 AI 工具都倾向于围绕 MCP 标准来做，而 Anthropic 是这个标准的"原作者"。

> **类比**：USB 是 Intel 主导的开放标准；MCP 是 Anthropic 主导的开放标准。
> 主导一个全行业都跟进的标准，是隐形的护城河。

## 8. 三句话复盘

- **MCP = AI 调工具的统一接口标准（不是某家公司的私有 API）**
- **写一次 MCP Server，所有支持 MCP 的 AI 都能用**
- **现在 Claude Desktop / Cursor / Windsurf 等都支持，普通人配几行 JSON 就能给 AI 装上文件、GitHub、数据库等能力**

> **2025 年的 AI 关键词**：Agent、MCP、长上下文。三件事环环相扣——MCP 让 Agent 有了**通用工具能力**，长上下文让 Agent 有了**长记忆**，Agent 让 AI 真的能干活。

延伸阅读：[Function Calling 一文看懂](/blog/function-calling) · [Agent 是什么](/blog/agent-explained) · [Claude Code 上手](/blog/claude-code-guide)
