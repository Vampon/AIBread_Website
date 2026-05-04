import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-3",
  chapterId: "c5",
  title: "MCP：AI 的 USB 接口",
  emoji: "🔌",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `2024 年底 Anthropic 推出 **MCP (Model Context Protocol)**。一年多过去，OpenAI、Google、所有主流 AI 公司全跟进了。

**一句话**：如果说 [Function Calling](/blog/function-calling) 是给 AI 装"按钮"，那 MCP 就是按钮的**统一标准**。装一次，所有 AI 都能用。

这一关咱们体验一下 MCP 怎么工作。`,
    },
    {
      kind: "text",
      markdown: `**先看一下没有 MCP 之前的世界**——

你想让 ChatGPT 能查公司 Jira 工单。雇人写了一套代码：

\`\`\`
ChatGPT ←(自定义代码)→ Jira API
\`\`\`

老板：那 Claude 也接一下？再写一套。Gemini 也接？再写。每个 AI 都要重写。

**M 个 AI × N 个工具 = M × N 套代码** —— 这就是混乱。`,
    },
    {
      kind: "quiz",
      question: "MCP 的核心思想是？",
      options: [
        {
          id: "a",
          label: "训练一个比 GPT-4 还强的大模型",
          correct: false,
          feedback: "MCP 跟模型没关系，是协议层的事。",
        },
        {
          id: "b",
          label: "在 AI 和工具之间，定一个标准协议——双方按协议实现就能互通",
          correct: true,
          feedback: "✓ 这就像 USB 把「鼠标-电脑」的连接方式标准化了——之后所有鼠标、所有电脑都能互通。",
        },
        {
          id: "c",
          label: "把所有公司的工具都挪到 Anthropic 的服务器上",
          correct: false,
          feedback: "MCP 不是中心化方案，每个工具方自己跑自己的 server。",
        },
      ],
      explanation: `**MCP = USB 之于硬件**。

- USB 之前：每个外设要单独配一根线（鼠标线、键盘线、打印机线……）
- USB 之后：**一个口通用**

MCP 之前：每个 AI 调每个工具都要写专门集成
MCP 之后：写一次 MCP Server，**所有支持 MCP 的 AI 都能用**`,
    },
    {
      kind: "text",
      markdown: `**MCP Server 能向 AI 提供三种能力**：

| 能力 | 解释 | 例子 |
|------|------|------|
| **Tools（工具）** | 让 AI 能调用的函数 | 查 Jira、发 Slack 消息 |
| **Resources（资源）** | 让 AI 能读取的数据 | 公司 Wiki 某一页、数据库某张表 |
| **Prompts（模板）** | 预设的对话模板 | 代码 review 模板、会议纪要模板 |

最常用的是 **Tools**，99% 的 MCP Server 主要在提供工具能力。

下面咱们看一下，给 Claude Desktop **装一个文件系统 MCP Server** 长啥样。`,
    },
    {
      kind: "terminal",
      intro: "假设你想让 Claude 能读你电脑里 ~/Documents 的文件。第一步：装这个 Server。",
      cwd: "~",
      command: "npm install -g @modelcontextprotocol/server-filesystem",
      output: [
        { line: "fetching @modelcontextprotocol/server-filesystem...", delay: 500, tone: "dim" },
        { line: "added 24 packages in 3.2s", delay: 1100, tone: "ok" },
        { line: "", delay: 200 },
        { line: "下一步：编辑 Claude Desktop 配置文件", delay: 400, tone: "dim" },
        { line: "  ~/Library/Application Support/Claude/claude_desktop_config.json", delay: 400, tone: "dim" },
        { line: "  在 mcpServers 字段里加一段：", delay: 400, tone: "dim" },
        { line: '  "filesystem": {', delay: 300, tone: "normal" },
        { line: '    "command": "npx",', delay: 300, tone: "normal" },
        { line: '    "args": ["@modelcontextprotocol/server-filesystem",', delay: 300, tone: "normal" },
        { line: '            "/Users/你的用户名/Documents"]', delay: 300, tone: "normal" },
        { line: "  }", delay: 300, tone: "normal" },
        { line: "", delay: 200 },
        { line: "→ 重启 Claude Desktop", delay: 500, tone: "dim" },
        { line: "✓ MCP Server 已加载，Claude 现在能访问 ~/Documents", delay: 700, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**装完之后**，你就可以对 Claude 说：

> 「看一下我 Documents 文件夹里有啥，把 PDF 都列出来。」

它真的会去读你的文件夹（之前它只能空想）。

**关键的 \"通用\" 性来了**——

🔌 同一个 \`filesystem\` MCP Server，**第二天插到 Cursor 上也能用**、第三天插到 Windsurf 上也能用、第四天插到任何新的 AI 工具上**只要它支持 MCP** 都能用。

> 这就是 USB 思维：你的 U 盘插 Mac 能用、插 Windows 能用、插车载播放器能用——没人为你单独写过驱动。`,
    },
    {
      kind: "quiz",
      question: "下面哪些 MCP Server 现在已经能用？（社区生态已经爆炸式增长）",
      allowMulti: true,
      options: [
        { id: "a", label: "filesystem（读写本地文件）", correct: true },
        { id: "b", label: "github（操作 GitHub issue/PR/代码）", correct: true },
        { id: "c", label: "postgres / sqlite（直接查数据库）", correct: true },
        { id: "d", label: "puppeteer（控制浏览器）", correct: true },
        { id: "e", label: "slack / notion / figma 等", correct: true },
      ],
      explanation: `**modelcontextprotocol.io** 上已经有几百个公开的 MCP Server。
**自己写一个 MCP Server 也很简单**——就几十行代码。

**为啥这事重要**：
- 对开发者：N×M 变成 N+M，生态爆炸式增长
- 对用户：换 AI 工具不用重新搞集成
- 对 AI 公司：从"封闭花园"变成"开放生态"`,
    },
    {
      kind: "fill-blank",
      prompt: "Anthropic 主导 MCP 标准，类似当年 ___ 主导了 USB 标准。",
      placeholder: "一家硬件巨头",
      accept: ["intel", "因特尔", "英特尔"],
      hint: "USB 标准是哪家公司在 1990 年代主导推出的？……",
      reveal: `**Intel**。

主导一个全行业都跟进的开放标准，是隐形的护城河——
- USB（Intel 主导）→ Intel 在 PC 时代有了"接口话语权"
- MCP（Anthropic 主导）→ Anthropic 在 AI 时代有了"工具话语权"

**主动公开 MCP 是 Anthropic 一个聪明的战略**：让所有 AI 工具都倾向于围绕 MCP 做，而 Anthropic 是这个标准的"原作者"。`,
    },
    {
      kind: "celebration",
      title: "USB 接口接通！🔌",
      subtitle: "你已经懂了 2025 年最重要的 AI 基础设施之一。下次配 Claude Desktop / Cursor 时，记得给它装几个 MCP Server。",
      xp: 60,
      badge: { emoji: "🔌", label: "MCP 启蒙" },
      nextLevelId: "c5-4",
    },
  ],
};

export default level;
