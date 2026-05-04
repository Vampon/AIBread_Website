import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c6-1",
  chapterId: "c6",
  title: "Claude Code 入门：终端里的 AI 同事",
  emoji: "💻",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 12,
  steps: [
    {
      kind: "text",
      markdown: `**Claude Code 不是 IDE，是一个 CLI**——跑在你命令行里的 AI 编程 Agent。

打开它你看到的不是花哨窗口，就是一个命令行：

\`\`\`
$ claude
> _
\`\`\`

你跟它对话，它能：
- **读你的项目代码**（不用复制粘贴）
- **改文件**（自己定位、自己改）
- **跑命令**（\`npm install\`、\`pytest\`、\`git diff\`）
- **看到结果再决定下一步**

这一关咱们走一遍真实使用流程。`,
    },
    {
      kind: "quiz",
      question: "Claude Code 和 Cursor 最核心的差别是？",
      options: [
        {
          id: "a",
          label: "Claude Code 用 Claude，Cursor 用 GPT",
          correct: false,
          feedback: "都能用任意模型。这不是核心区别。",
        },
        {
          id: "b",
          label: "Cursor 是辅助你写代码，Claude Code 是让它自己干一段",
          correct: true,
          feedback: "✓ 一个是'你主导，AI 辅助'，一个是'AI 主导，你 review'。形态完全不同。",
        },
        {
          id: "c",
          label: "Cursor 收费，Claude Code 免费",
          correct: false,
          feedback: "都收费。不是定价上的差异。",
        },
      ],
      explanation: `画风对比：

- **Cursor**：你在打字写函数，它弹出建议帮你补完。你在主导，它在辅助。
- **Claude Code**：你说"加一个用户登录功能"，它自己找文件、改代码、跑测试、报告结果。**它在主导，你在 review**。

不是替代关系。**很多人 Cursor 写日常代码，Claude Code 跑较大任务**。两个都用。`,
    },
    {
      kind: "text",
      markdown: `**装机流程**——环境要求：装了 Node.js (>= 18)。

下面是真实的装机命令，跟敲一遍：`,
    },
    {
      kind: "terminal",
      intro: "全局安装 Claude Code 这个 npm 包：",
      cwd: "~",
      command: "npm install -g @anthropic-ai/claude-code",
      requireType: true,
      output: [
        { line: "fetching @anthropic-ai/claude-code...", delay: 600, tone: "dim" },
        { line: "  └ resolved 1 package in 1.2s", delay: 400, tone: "dim" },
        { line: "  └ adding dependencies (47 packages)...", delay: 700, tone: "dim" },
        { line: "  └ building native bindings...", delay: 600, tone: "dim" },
        { line: "added 47 packages in 5.8s", delay: 800, tone: "ok" },
        { line: "", delay: 200 },
        { line: "Now run `claude` in any project to get started.", delay: 500, tone: "dim" },
      ],
    },
    {
      kind: "text",
      markdown: `装完后，进入任意项目目录，跑 \`claude\`，浏览器登录 Anthropic 账号——就开干了。

**第一次用最值得试的 3 个任务**：

1. *让它解释代码*：「解释一下 src/utils/auth.ts 里的逻辑」
2. *让它改代码*：「把 src/components/Button.tsx 默认颜色从蓝改成绿」
3. *让它写一个完整功能*：「加一个 dark mode 切换」

它会自己读项目、改文件、跑构建、报告。

**第一次见到一个 AI 在自己项目里干活的感觉很奇妙。**`,
    },
    {
      kind: "text",
      markdown: `下面这一步重要——**\`CLAUDE.md\` 项目说明书**。

在项目根目录放一个 \`CLAUDE.md\`，写清楚：项目干啥的、用了什么技术栈、有哪些约定、跑命令的方式。**每次启动 Claude Code 时，它都会自动读这个文件作为长期记忆。**

这个习惯能让它效率提升一倍以上。试着写一份：`,
    },
    {
      kind: "prompt-input",
      intro: "假设你的项目是一个 Next.js + Tailwind 的个人博客站。给它写一份 CLAUDE.md（开头几条说明就行）——告诉 Claude Code：项目类型、技术栈、跑命令的方式、目录结构。",
      placeholder: "# 项目说明\n\n这是一个...",
      sampleInputs: [
        `# 我的个人博客

## 技术栈
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3
- 文章用 markdown 格式放在 content/articles/

## 常用命令
- npm run dev    本地开发
- npm run build  生产构建

## 目录结构
- src/app/        Next.js 页面
- src/components/ React 组件
- content/        markdown 内容

## 约定
- 颜色不要写裸 hex，用 Tailwind 的 token
- 写组件优先用 Server Component`,
      ],
      minChars: 60,
      expectKeywords: ["技术栈", "命令", "目录", "next", "tailwind", "react", "栈"],
      miss: "提醒：CLAUDE.md 要包含技术栈说明、运行命令、目录结构这几项最有用。",
      aiReply: [
        "✓ 收到了，已写入 CLAUDE.md",
        "我已经记下：项目用 Next.js + Tailwind，跑命令用 npm，文章是 markdown。",
        "现在我知道如何安全地修改这个项目了——**不会瞎用 pnpm、不会随手改 markdown 文件以外的内容**。",
        "下次你可以直接说「加一篇关于 X 的文章」，我会去 content/articles/ 建文件、套上正确的 frontmatter。",
      ],
    },
    {
      kind: "quiz",
      question: "Claude Code 实战中，哪些是真实存在的坑？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "它会改错文件、删错代码——所以每次让它干活前最好 git commit 一下",
          correct: true,
          feedback: "✓ 这是基本安全网。",
        },
        {
          id: "b",
          label: "大改动容易跑飞——任务太大它会改一堆无关文件",
          correct: true,
          feedback: "✓ 对策：**任务拆小**，让它一次只干一个功能。",
        },
        {
          id: "c",
          label: "它可能瞎装包——觉得需要某个库就 npm install 上了",
          correct: true,
          feedback: "✓ 留意 package.json 的变动。",
        },
        {
          id: "d",
          label: "它绝对不会出错，可以让它无监督跑一晚上",
          correct: false,
          feedback: "千万别。它会出错，需要你 review。",
        },
      ],
      explanation: `**安全使用 Claude Code 的三件套**：

1. **干活前 git commit** —— 出问题能回退
2. **任务拆小** —— 一次一个功能，避免它跑飞
3. **review git diff** —— 干完看 diff 再决定提不提交

记住：它是个**强大但会犯错的同事**，不是无人驾驶。`,
    },
    {
      kind: "reveal",
      prompt: "想看几个**真实场景**——大家用 Claude Code 都在干啥？",
      buttonLabel: "揭晓 5 个高价值用法",
      hidden: `5 个真实使用场景（社区里高频）：

1. **重构现有代码** ——「把 src/ 下所有的 var 都改成 const，并跑一遍 ESLint」
2. **写测试** ——「给 src/utils/date.ts 写一份完整的单元测试」
3. **看陌生代码库** ——「这是我刚 clone 的项目，帮我画一下整体架构图」
4. **批量小改** ——「给所有 React 组件加上中文 JSDoc 注释」
5. **从需求文档到 PR** ——写 markdown 描述功能 → 它实现 → 看 git diff → 提交

> **它最强的能力**：半自主跑长任务。你说一个目标，它干 5–20 分钟，期间自己写代码、跑测试、报错时自己排查、需要你拍板时停下来问你。`,
    },
    {
      kind: "celebration",
      title: "AI 同事入职！💻",
      subtitle: "下一次写代码不用再「写代码」——只需要「review 代码」。这就是 AI 编程时代。",
      xp: 60,
      badge: { emoji: "💻", label: "Claude Code 上手" },
      nextLevelId: "c6-2",
    },
  ],
};

export default level;
