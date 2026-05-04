import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c4-1",
  chapterId: "c4",
  title: "AI 写作三件套：从空白到成稿",
  emoji: "✍️",
  difficulty: 2,
  xpReward: 50,
  estimatedMin: 12,
  steps: [
    {
      kind: "text",
      markdown: `多数人用 AI 写作是这样的：**让 AI 写完，自己改**。这是最低效的用法。

正确姿势是把它当流水线：**AI 出大纲 → AI 出初稿 → AI 配图**。每一步你只做关键决策，最后总耗时不到自己写的三分之一。

这一关咱们走完一遍真实的"AI 写作流水线"，目标是产出一篇**朋友圈推广文案**。`,
    },
    {
      kind: "text",
      markdown: `**第一步：让 AI 出大纲。**

写之前先想清楚结构，AI 比你想得更清楚。给它一句话主题，让它返回 3 个不同方向的大纲，你选一个最有感觉的。`,
    },
    {
      kind: "prompt-input",
      intro:
        "试着写一个让 AI 出大纲的 prompt。主题是：**周末新开的烘焙店，主打无添加**。要求它给 3 个不同风格的大纲（比如温情、专业、悬念）。",
      placeholder: "你是…，帮我用…的形式给…的大纲…",
      sampleInputs: [
        "你是朋友圈文案高手，帮我给一家周末新开的无添加烘焙店写朋友圈推广，给 3 个不同风格的大纲：温情风、专业风、悬念风。每个大纲 3 段。",
      ],
      minChars: 25,
      expectKeywords: ["大纲", "3", "三", "风格", "形式"],
      miss: "提醒：要让它给「3 个不同风格 / 不同方向」的大纲，这一步是为了让你做选择。",
      aiReply: [
        "好嘞，给你 3 个方向：",
        "**温情风**：从'凌晨 4 点的烤炉'切入 → 讲老板的执念 → 邀请读者来尝。",
        "**专业风**：摆数据（无添加意味着什么）→ 列原料溯源 → 给出试吃名单。",
        "**悬念风**：从'你吃过会哭的面包吗'开头 → 留 2 个钩子 → 文末才揭晓地点。",
        "选一个，咱们进入下一步。",
      ],
    },
    {
      kind: "text",
      markdown: `选定大纲后，**第二步：让 AI 出初稿。**

这一步只要把刚才选定的大纲发给 AI，加一句"按这个大纲写出 200 字朋友圈"就行。

AI 写出来通常 70 分。这时候不要纠结措辞，直接进第三步。`,
    },
    {
      kind: "text",
      markdown: `**第三步：让 AI 配图。**

文字有了，缺一张吸睛图。文生图 AI 现在已经能用大白话出图。

下面这个就是真·画图工具。你写句话，它给你出图。`,
    },
    {
      kind: "image-gen",
      intro: "试一下：描述一张你想要的烘焙店朋友圈配图。简单点说就行，画风、主体、氛围三件事。",
      promptPlaceholder: "比如：晨光下的木质面包架，刚出炉的法棍冒着热气，暖色调…",
      sampleInputs: [
        "晨光下的木质面包架，刚出炉的法棍冒着热气，暖色调",
        "复古油画风的可颂特写，撒满糖霜，背景虚化",
        "极简白底，一颗发酵中的酸面团特写，像艺术品",
      ],
      durationMs: 2200,
      resultSrc: "/placeholders/cover-6.svg",
      resultAlt: "AI 生成的烘焙店配图",
      resultCaption:
        "（演示用占位图——真实场景里这里会是 Midjourney/即梦/Stable Diffusion 出的图）",
    },
    {
      kind: "quiz",
      question: "AI 写作流水线的关键是？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "让 AI 一口气把成品写出来",
          correct: false,
          feedback: "恰恰相反。一口气写出来的成品质量最差。",
        },
        {
          id: "b",
          label: "拆成大纲 → 初稿 → 配图，一步一步来",
          correct: true,
          feedback: "对！每步只解决一个小问题，AI 才能给出高质量答案。",
        },
        {
          id: "c",
          label: "在每一步都做关键决策（选大纲、改初稿、定图）",
          correct: true,
          feedback: "对！你是流水线的总监，AI 是车间。",
        },
        {
          id: "d",
          label: "全程不参与，让 AI 决定一切",
          correct: false,
          feedback: "那你就只是个搬运工。质量取决于你做了多少关键判断。",
        },
      ],
      explanation:
        "记住：**AI 是流水线的工人，你是工厂的厂长**。厂长不动手做产品，但每个环节都要拍板。",
    },
    {
      kind: "celebration",
      title: "流水线打通！🥐",
      subtitle: "你已经会用 AI 走完文字→图片的完整链路。下一次写朋友圈/小红书/邮件，试试这套流水线。",
      xp: 50,
      badge: { emoji: "🥐", label: "AI 写作流水线" },
      nextLevelId: "c4-2",
    },
  ],
};

export default level;
