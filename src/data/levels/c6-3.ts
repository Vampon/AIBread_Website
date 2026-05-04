import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c6-3",
  chapterId: "c6",
  title: "让 AI 帮你写完整项目",
  emoji: "🏗️",
  difficulty: 3,
  xpReward: 70,
  estimatedMin: 13,
  steps: [
    {
      kind: "text",
      markdown: `新手最常踩的坑：**打开 AI 编程工具 → 一句话「帮我做一个 XX 网站」 → 等 5 分钟 → 拿到一坨跑不起来的代码**。

问题不在 AI——**是你给的任务太大**。

这一关学**分阶段**让 AI 写项目：从需求 → 骨架 → 模块 → 测试 → 部署。每一步都是小步快跑、可 review、可回退。`,
    },
    {
      kind: "text",
      markdown: `**核心心法三条**——

1. **先让 AI 写 README 和目录结构**（不写代码）。把规划做对，再开工。
2. **一个模块一个 commit**（提交）。AI 干完一段就 \`git commit\`，方便回退。
3. **review 时看 git diff（代码变更对比），不要只看 AI 的总结**。AI 的总结往往报喜不报忧。`,
    },
    {
      kind: "text",
      markdown: `**第一步：先有 PRD（产品需求文档），再开工**。

PRD 不一定要长——五句话就够。但必须包含：**做什么、给谁用、最小功能集、用什么技术栈、不做什么**。

下面咱们假设要做一个"个人英语单词卡"。先来给项目搭骨架——`,
    },
    {
      kind: "terminal",
      intro: "实操：先建空目录 → 启动 Claude Code → 让它先生成 README 和目录结构（先不写代码）：",
      cwd: "~",
      command: "mkdir wordcard && cd wordcard && claude",
      output: [
        { line: "Welcome to Claude Code · v0.x", delay: 500, tone: "dim" },
        { line: "📂 cwd: /Users/you/wordcard (empty)", delay: 400, tone: "dim" },
        { line: "", delay: 200 },
        { line: "> 给我搭一个英语单词卡项目的骨架。先别写代码，", delay: 600, tone: "normal" },
        { line: "  只生成 README.md 和目录结构。技术栈用 Next.js + TS。", delay: 600, tone: "normal" },
        { line: "", delay: 300 },
        { line: "✎ creating README.md", delay: 700, tone: "ok" },
        { line: "✎ creating package.json (skeleton)", delay: 600, tone: "ok" },
        { line: "✎ creating src/app/, src/components/, src/lib/", delay: 700, tone: "ok" },
        { line: "✎ creating .gitignore", delay: 400, tone: "ok" },
        { line: "", delay: 300 },
        { line: "Done. 5 files created, 0 lines of business code yet.", delay: 600, tone: "ok" },
        { line: "✓ 建议下一步：git init && git add . && git commit -m 'init: skeleton'", delay: 700, tone: "dim" },
      ],
    },
    {
      kind: "text",
      markdown: `看到了吗——**第一次 commit 是项目骨架，0 行业务代码**。

为什么这么干？

- 骨架阶段如果方向错了，**改 README 比改代码便宜 100 倍**。
- 后续每加一个功能都是**一个独立 commit**，出错只回退这一个，前面的不受影响。`,
    },
    {
      kind: "prompt-input",
      intro: "现在你来写。假设你要做一个'家庭菜谱本'网站，给 Claude Code 写一段提示词——让它**先搭骨架（不写业务代码）**。要求：说清楚做什么、技术栈、目录结构、最后让它别写业务逻辑。",
      placeholder: "给我搭一个...的项目骨架。先不写业务代码，只生成...",
      sampleInputs: [
        `给我搭一个"家庭菜谱本"网站的项目骨架。

需求：能添加菜谱（标题、食材、做法）、能浏览列表、能搜索。

技术栈：Next.js 15 (App Router) + TypeScript + Tailwind CSS。
本地存储用浏览器的 localStorage（暂时不接数据库）。

请先只生成：
1. README.md（写清需求、技术栈、目录、跑命令的方式）
2. 目录结构 + 空文件占位（src/app, src/components, src/lib）
3. package.json + .gitignore

**先不要写任何业务代码**。我要先 review 骨架，没问题再让你写功能。`,
      ],
      minChars: 80,
      expectKeywords: ["骨架", "目录", "README", "readme", "技术栈", "不写", "先不", "只生成"],
      miss: "提醒：要明确说「先不写业务代码」「只生成骨架/README/目录」——否则它会一口气写到底。",
      aiReply: [
        "✓ 好的提示词。我抓到了三件关键事：",
        "1. **目标明确**——家庭菜谱本，三个核心功能（增、列、搜）",
        "2. **技术栈钉死**——Next.js + TS + Tailwind + localStorage，不用我猜",
        "3. **范围限制**——只搭骨架，不写业务",
        "现在我会创建 6 个文件：README.md、package.json、tailwind.config.ts、tsconfig.json、目录占位、.gitignore。**0 行业务代码，方便你 review 完再开工**。",
      ],
    },
    {
      kind: "quiz",
      question: "AI 帮你写完一个功能后，你的 review 流程哪个**最靠谱**？",
      options: [
        {
          id: "a",
          label: "看 AI 自己写的总结：「✓ 已添加搜索功能并测试通过」——OK 提交",
          correct: false,
          feedback: "AI 的总结经常报喜不报忧。它说「测试通过」可能是它**没跑测试**，也可能是它**改了测试让它通过**。",
        },
        {
          id: "b",
          label: "跑一遍 `git diff`，看具体改了哪些行；再跑 `npm test` 自己看结果",
          correct: true,
          feedback: "✓ **眼见为实**。代码 diff 不会撒谎，自己跑的测试也不会撒谎。",
        },
        {
          id: "c",
          label: "在浏览器里点一下功能，能用就提交",
          correct: false,
          feedback: "比纯看总结好，但还不够。它可能改坏了别的地方——必须看 diff。",
        },
      ],
      explanation: `**review 三件套**：

1. \`git diff\` 看改了什么（**最重要**——AI 经常顺手改了你没要求的东西）
2. \`npm test\` / \`npm run build\` 自己跑一遍
3. 浏览器/终端里实际用一下

**永远不要只看 AI 的总结就 commit**。`,
    },
    {
      kind: "reveal",
      prompt: "想看一个完整项目的**分阶段拆法**？",
      buttonLabel: "揭晓 5 个阶段",
      hidden: `**面包君做"单词卡"的真实分阶段**（每阶段一个 commit）：

1. **骨架** —— README + 目录 + package.json，0 行业务（10 分钟）
2. **数据层** —— 定义 Word 类型 + localStorage 读写函数（15 分钟）
3. **UI 列表页** —— 显示所有单词卡的网格（20 分钟）
4. **添加 / 编辑** —— 表单 + 校验（25 分钟）
5. **复习模式** —— 抽卡、隔天复习算法（30 分钟）
6. **部署** —— Vercel 一键上线（5 分钟）

**每个阶段结束**：git commit + 浏览器走一遍 + 没问题才进下一阶段。

> 总耗时大约 2 小时。**这种节奏比一口气让 AI 写完，最后调试 5 小时要快得多。**`,
    },
    {
      kind: "celebration",
      title: "项目工程师上线！🏗️",
      subtitle: "下一关换个画风——一句话直接生成完整 Web App，体验「直觉编程」。",
      xp: 70,
      badge: { emoji: "🏗️", label: "分阶段开发" },
      nextLevelId: "c6-4",
    },
  ],
};

export default level;
