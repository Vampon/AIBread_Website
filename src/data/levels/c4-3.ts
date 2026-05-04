import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c4-3",
  chapterId: "c4",
  title: "翻译与润色",
  emoji: "🌐",
  difficulty: 1,
  xpReward: 40,
  estimatedMin: 8,
  steps: [
    {
      kind: "text",
      markdown: `老一辈的翻译软件（Google Translate、有道）是"逐字查表"——句子拆开找对应词再拼起来。

新一代 AI 翻译（ChatGPT、DeepL、Claude）是"理解再表达"——它先读懂整段在说什么，再用目标语言重写。

差距最大的是**有歧义、有梗、有专业语境**的文字。`,
    },
    {
      kind: "text",
      markdown: `想用好 AI 翻译，记住三招：

1. **先告诉它文本类型**——学术、营销、口语、合同，每种基调差很多
2. **给一段你想要的风格示范**——AI 会照着对齐
3. **翻完让它自己审一遍**——找漏译、找别扭的地方`,
    },
    {
      kind: "text",
      markdown: `**第一招最关键**。同一句"我们这款产品很有诚意"，如果你不告诉 AI 这是一份给海外客户的产品介绍，它可能直译成 *"Our product is very sincere"*——歪果仁看了会愣住。

但你说"这是 B2B 产品 landing page 文案"，它就会写成 *"Built with care, priced fair"*——立刻是营销腔。`,
    },
    {
      kind: "prompt-input",
      intro:
        "练一下：把这句中文翻成英文——「凌晨 4 点的烤炉，是这家店 12 年没变过的执念」。**要在提示词里加上语境（小红书图文 / 朋友圈推文）和风格（温情 / 文艺）**。",
      placeholder: "请翻译…，这是一段…的文字，希望译文风格…",
      sampleInputs: [
        "请把下面这句话翻成英文，这是一段中文小红书烘焙店推文里的金句，目标读者是英文社交媒体用户，希望译文有温情感、像店主自白，避免广告腔。原文：凌晨 4 点的烤炉，是这家店 12 年没变过的执念。",
      ],
      minChars: 30,
      expectKeywords: ["小红书", "推文", "营销", "广告", "温情", "文艺", "风格", "语境", "店主", "社交"],
      miss: "再加点料：告诉 AI 这是哪种文本（小红书 / 朋友圈 / 公众号）、要什么风格（温情 / 文艺 / 口语）。",
      aiReply: [
        "好，定位是「温情店主自白风」，给你两版：",
        "**A 版（更近口语）**：*The oven fires up at 4 a.m. — that's been this shop's quiet promise for twelve years.*",
        "**B 版（更书面）**：*For twelve years, the oven has never missed its 4 a.m. start. Some things, this shop simply doesn't change.*",
        "选 A 版的话 social media 传播更顺。",
      ],
    },
    {
      kind: "quiz",
      question: "下面哪种做法能让 AI 翻译质量明显变好？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "在原文前加一句「这是给海外投资人的 pitch deck」",
          correct: true,
          feedback: "对，文本类型是定基调的关键。",
        },
        {
          id: "b",
          label: "粘贴一段你过去满意的英文做「风格样本」，让它对齐",
          correct: true,
          feedback: "对，给样本是让 AI 模仿风格最直接的办法。",
        },
        {
          id: "c",
          label: "翻完直接复制就用，不用再让 AI 审一遍",
          correct: false,
          feedback: "AI 翻译也会有漏译和别扭表达，让它自查一遍是免费的保险。",
        },
        {
          id: "d",
          label: "让 AI 把每个名词都按字典直译",
          correct: false,
          feedback: "那就回到老式翻译软件了，AI 的优势恰恰在意译。",
        },
      ],
      explanation:
        "**语境 + 风格样本 + 自我审查**——三件齐了，AI 翻译能稳定输出「母语者读着不别扭」的水平。",
    },
    {
      kind: "fill-blank",
      prompt: "让 AI 翻完之后再来一句：「请你检查这版译文，找出 ___ 的地方」。",
      placeholder: "让 AI 自己挑毛病",
      accept: ["漏译", "不通", "别扭", "歧义", "错误", "不准", "可改进", "可优化"],
      hint: "请它当自己的审稿人，找问题…",
      reveal: `常用模板：

> 「请检查这版译文，找出**漏译、歧义、不自然、过度直译**的地方，并给出修改建议」。

AI 自审一轮，能挑出 80% 的小问题——免费的二次校对。`,
    },
    {
      kind: "reveal",
      prompt: "想看一份「翻译万能开头」吗？",
      buttonLabel: "揭晓",
      hidden: `**开头模板**：

> 「请把下面的中文翻成英文。
> · 文本类型：\\[小红书图文 / 学术摘要 / 商业邮件 / 合同条款\\]
> · 目标读者：\\[谁\\]
> · 风格要求：\\[温情 / 简洁专业 / 法律严谨 / 营销有力\\]
> · 不要直译，重在传神。
> 翻完后请自查一次，标出可改进的地方。」

复制这一段当起手式，下次翻译省 10 分钟纠结。`,
    },
    {
      kind: "celebration",
      title: "翻译升级！🌐",
      subtitle: "AI 翻译不是「取代旧翻译软件」，而是把翻译这件事提到了一个完全不同的层级。",
      xp: 40,
      badge: { emoji: "🌐", label: "AI 翻译手" },
      nextLevelId: "c4-4",
    },
  ],
};

export default level;
