import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c6-4",
  chapterId: "c6",
  title: "Vibe Coding：一句话起 Web App",
  emoji: "🎢",
  difficulty: 3,
  xpReward: 70,
  estimatedMin: 13,
  steps: [
    {
      kind: "text",
      markdown: `2024 年开始流行一个词：**Vibe Coding**（直觉编程）。

意思是：你不写代码、不看代码——**就是描述你想要什么**，AI 直接给你**一个能跑的 Web App**。

代表工具：**v0.dev**（Vercel 出品）、**Bolt.new**、**Lovable**、**Replit Agent**。这一关咱们看清它的能力边界。`,
    },
    {
      kind: "text",
      markdown: `**它是怎么做到的？**

背后其实是 **AI Agent + 现成框架**——

- 接到你的描述 → 自动选个模板（一般是 **Next.js + React + Tailwind** 这套）
- Agent 在云端开一台机器，**自动写代码、装依赖、跑构建**
- 几分钟后给你一个**可访问的网址 + 可下载的代码**`,
    },
    {
      kind: "image-gen",
      intro: "试试用一句话生成一个 todo 应用。打字给 v0.dev——",
      promptPlaceholder: "做一个简洁好看的 todo 应用，支持...",
      sampleInputs: [
        "做一个简洁好看的 todo 应用，浅色风格，能添加任务、勾选完成、按完成状态过滤。",
        "给我一个个人简历单页站，深色科技感，左边头像右边简介，下面项目卡片。",
      ],
      durationMs: 3500,
      resultSrc: "/placeholders/cover-2.svg",
      resultAlt: "v0.dev 一句话生成的 todo 应用界面截图",
      resultCaption: "30 秒后：一个能用的 todo 应用 + 完整 Next.js 代码。可以直接部署、也可以下载继续改。",
    },
    {
      kind: "text",
      markdown: `**三句话原理总结**——

1. 你给的是**自然语言**，它生成的是**完整代码 + 已部署的预览页**。
2. 它**不是从零写**，是基于自己内置的几十个模板再改。
3. 想要它出活快，**描述里多带视觉关键词**：浅色 / 卡片 / 网格 / 暗黑科技感。`,
    },
    {
      kind: "prompt-input",
      intro: "你来写一个 vibe coding 的提示词——做一个'每日喝水提醒'小应用。要求：包含界面风格 + 核心功能 + 技术取向（如手机优先）。",
      placeholder: "做一个每日喝水提醒小应用，要求...",
      sampleInputs: [
        `做一个每日喝水提醒小应用。

风格：清爽蓝白、手机优先（mobile-first）、大圆角卡片。

功能：
1. 顶部显示今日已喝水 X / 8 杯，配一个进度环
2. 中间有 "+ 1 杯" 大按钮，点击加一
3. 下方按小时列出今天的喝水记录
4. 数据存在浏览器 localStorage 里，刷新不丢

技术：Next.js 15 + Tailwind。不需要后端、不需要登录。`,
      ],
      minChars: 80,
      expectKeywords: ["风格", "功能", "颜色", "按钮", "存", "界面", "手机", "卡片", "记录"],
      miss: "提醒：vibe coding 的提示词最好包含**界面风格 + 核心功能 + 数据存哪里**这三件事。光说功能它会画得很丑。",
      aiReply: [
        "✓ 这个提示词很到位——**视觉、功能、数据**都说清楚了。",
        "我会生成：一个 Next.js 项目，手机优先布局，主色调蓝白，进度环用 SVG 画。",
        "30 秒后给你**预览链接**——你可以直接用，也可以点「下载代码」继续在 Cursor 里改。",
        "**注意**：localStorage 只存在你这台设备上，换设备数据不通用。如果要跨设备，得告诉我「数据存在云端」，我会接 Supabase。",
      ],
    },
    {
      kind: "quiz",
      question: "下面哪些场景，**适合**用 Vibe Coding 工具一键生成？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "做一个产品落地页（Landing Page），下周要发推广",
          correct: true,
          feedback: "✓ **完美场景**。落地页是它最擅长的——风格化强、逻辑简单。",
        },
        {
          id: "b",
          label: "做一个内部 demo 给老板看，验证产品想法",
          correct: true,
          feedback: "✓ 原型快是它的核心价值。30 分钟从想法到可点击。",
        },
        {
          id: "c",
          label: "做一个证券交易系统，要接十几家券商的 API、有真实资金流",
          correct: false,
          feedback: "千万别。复杂业务逻辑 + 钱 + 安全 = vibe coding 的禁区。这种要传统编程 + 严格 review。",
        },
        {
          id: "d",
          label: "做一个个人作品集网站",
          correct: true,
          feedback: "✓ 视觉为主、内容你自己填，非常合适。",
        },
        {
          id: "e",
          label: "做一个公司核心 ERP（企业资源计划）系统，几十个模块、多人协作",
          correct: false,
          feedback: "不行。规模和复杂度超出 vibe coding 的舒适区——会越改越乱。",
        },
      ],
      explanation: `**Vibe Coding 的三个适合**：

- **原型 / Demo** —— 验证想法
- **落地页 / 个人站** —— 视觉强、逻辑简单
- **小工具** —— 单页应用、TODO、计算器、记账本

**三个不适合**：复杂业务逻辑、涉及钱和安全、多人协作的大项目。

> **判断公式**：能不能在一张白纸上**讲清楚**这个 App 在干啥？讲得清就适合，讲不清就别用。`,
    },
    {
      kind: "reveal",
      prompt: "Vibe Coding 工具有几个真实的**坑**，想看吗？",
      buttonLabel: "揭晓 4 个常见坑",
      hidden: `**4 个真实的坑**：

1. **改第二版往往比从头写还难**——AI 第一版生成得很美，但你想加复杂功能时，它经常把第一版搞乱。**对策**：定下来需求再生成，避免反复改。

2. **代码质量参差不齐**——有时候它会用过时的 API、写一堆没必要的依赖。**对策**：生成完丢进 Cursor / Claude Code 让它「review 这份代码并清理冗余」。

3. **数据库 / 认证容易翻车**——一句话让它接 Supabase / Auth，常常配错。**对策**：自己手动接，或让 Claude Code 仔细做。

4. **价格陷阱**——免费档很快用完，重度用户每月 $20–50。**对策**：原型阶段够用就好，量产开发还是回 Cursor。

> **核心心法**：把 vibe coding 工具当**草图工具**，不是**终稿工具**。`,
    },
    {
      kind: "celebration",
      title: "直觉编程解锁！🎢",
      subtitle: "下一关 BOSS——把这一章学的全部串起来，上线一个真正属于你的小工具。",
      xp: 70,
      badge: { emoji: "🎢", label: "Vibe Coding" },
      nextLevelId: "c6-5",
    },
  ],
};

export default level;
