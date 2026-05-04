import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c1-5",
  chapterId: "c1",
  title: "BOSS · 新手村结业测",
  emoji: "👑",
  difficulty: 2,
  xpReward: 80,
  estimatedMin: 12,
  steps: [
    {
      kind: "text",
      markdown: `欢迎来到 **新手村 BOSS 关**。

前四关你学了：*AI 是文字接龙* → *神经网络是一坨可调的数字* → *训练 vs 推理* → *能力边界*。

这一关不教新东西，就一件事——**把前面学的混着考一遍**。能扛过去，你就出师了，咱们就能进第二章去学怎么和 AI 真正对话。

题目从易到难，答错都给解释，别紧张。`,
    },
    {
      kind: "quiz",
      question: "**第 1 题（送分）**：AI 给你的回答看起来很有想法，本质上它在做的事是？",
      options: [
        { id: "a", label: "在脑子里推理思考", correct: false, feedback: "它没有'脑子'，也不思考。" },
        {
          id: "b",
          label: "根据训练数据，预测下一个最合理的字（文字接龙）",
          correct: true,
          feedback: "对！这是第一关的核心——再复杂的输出，本质都是一个字一个字猜出来的。",
        },
        { id: "c", label: "在它的数据库里搜索匹配的答案", correct: false, feedback: "它不存答案，存的是怎么算。" },
        { id: "d", label: "调用它的常识去回答", correct: false, feedback: "它没有'常识'，只有训练时见过的语言模式。" },
      ],
      explanation: `回顾：AI 是个 **超级文字接龙大师**。理解了这点，你就不会被它"很懂"的语气唬住。`,
    },
    {
      kind: "quiz",
      question: "**第 2 题**：所谓「模型大」，大的是什么？",
      options: [
        { id: "a", label: "硬盘大，存了更多文章", correct: false, feedback: "它存的不是文章原文。" },
        { id: "b", label: "屏幕大，显示得更多", correct: false, feedback: "和屏幕没关系 :)" },
        {
          id: "c",
          label: "权重数字多——也就是模型里那几亿/几千亿个参数",
          correct: true,
          feedback: "对！模型大小 ≈ 权重数量。GPT-4 大概几千亿个数。",
        },
        { id: "d", label: "训练时间长", correct: false, feedback: "训练时间是结果，不是模型本身的大小。" },
      ],
      explanation: `回顾：神经网络说白了是 **一坨可调的数字**。这堆数字越多，能记住的语言模式就越丰富——但代价是更慢、更贵、更耗电。`,
    },
    {
      kind: "quiz",
      question: "**第 3 题**：你和某个 AI 聊了一周，每天聊几小时，会不会让它变得更懂你这个人？",
      options: [
        {
          id: "a",
          label: "会，对话越多，它的权重就越贴合你",
          correct: false,
          feedback: "陷阱题。消费级 AI 推理时不会改权重。",
        },
        {
          id: "b",
          label: "不会，它的权重训练完就冻住了，每次对话只是临时把上下文喂给它",
          correct: true,
          feedback: "对！它显得懂你，是因为这次对话里读到了你之前说的话，不是模型本身变了。",
        },
        { id: "c", label: "看心情", correct: false, feedback: "AI 没有心情。" },
      ],
      explanation: `回顾：**训练 = 一次性塑造模型；推理 = 每次对话独立发生**。换个对话窗口，它就把你忘干净了——除非产品专门做了"记忆"功能。`,
    },
    {
      kind: "quiz",
      question: "**第 4 题（最难）**：下面哪些做法是 *把 AI 用在它的强项上* ？（多选）",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "让 AI 把英文论文翻译成中文，再自己核一遍专业术语",
          correct: true,
          feedback: "对。翻译是强项，自己核术语是负责任的姿势。",
        },
        {
          id: "b",
          label: "让 AI 直接告诉你今天 A 股某只股票的实时价格",
          correct: false,
          feedback: "实时数据是它的盲区——除非它有联网功能且你确认了来源。",
        },
        {
          id: "c",
          label: "让 AI 起草一份会议纪要，自己再修改定稿",
          correct: true,
          feedback: "对。起草是强项，定稿留给人类。",
        },
        {
          id: "d",
          label: "让 AI 替你决定要不要接受某份工作 offer",
          correct: false,
          feedback: "重大决定不该交给 AI——它没有你的全部背景，也不承担后果。",
        },
        {
          id: "e",
          label: "让 AI 帮你把一篇 30 页 PDF 总结成 5 条要点",
          correct: true,
          feedback: "对。长文总结是它的强项。",
        },
      ],
      explanation: `用 AI 的姿势可以浓缩成两句：**让它干起草、翻译、总结、改写——这些它强；自己负责事实核验、关键决策、最终拍板——这些不能交出去**。`,
    },
    {
      kind: "prompt-input",
      intro:
        "最后一道大题：用 *一句话* 把「AI 到底是什么」讲给一个完全没接触过的人。糅合你这一章学到的所有东西——文字接龙、神经网络、训练推理、能力边界都行。",
      placeholder: "比如：AI 是一个读了几乎全网内容的实习生，会接龙猜词，但不会真的思考…",
      sampleInputs: [
        "AI 是一个用海量文字训练出来的超大文字接龙机器，能起草不能拍板",
        "它就是一坨被调好的数字，每次给你算出最合理的下一个字",
        "AI 是个能干的实习生：起草翻译总结都行，但事实和决定别全交给它",
      ],
      minChars: 15,
      aiReply: [
        "厉害——你这一句话，已经把前四关的精华都串起来了。能用大白话讲明白，才是真懂。",
        "我帮你再凝练一版备用：**AI 是用海量文字训出的超大接龙机，能干起草、翻译、总结，但不知道实时信息、也不能替你拍板。**",
        "记住这一句，下次再有人问你 AI 是啥，三十秒就能讲清楚。",
      ],
    },
    {
      kind: "reveal",
      prompt: "想看看你这一章到底装了多少东西？点开有惊喜——",
      buttonLabel: "盘点一下我学了啥",
      hidden: `**新手村结业知识清单：**

- ✅ AI 不是科幻里的智能体，是 *文字接龙大师*
- ✅ 它会有 *幻觉*，关键信息必须自己核
- ✅ 神经网络 = *一坨可调的数字（权重）*
- ✅ 模型大 = *数字多*，不是硬盘大
- ✅ 训练 = *一次性烧钱塑造模型*
- ✅ 推理 = *每次对话单独发生，模型不会改*
- ✅ AI 强项：*起草 / 翻译 / 总结 / 改写*
- ✅ AI 弱项：*实时数据 / 严格事实 / 重大决定 / 物理动作*

这八条你都懂了，已经超过 90% 普通用户。下一章咱们正式学 *怎么和 AI 高效对话*——也就是江湖上吹的"提示词工程"，其实没那么玄。`,
    },
    {
      kind: "celebration",
      title: "出师啦！恭喜走出新手村 👑",
      subtitle: "新手村四关全过，你已经知道 AI 是什么、不是什么了。下一章咱们学怎么和 AI 真正对话——让它干活更利索。",
      xp: 80,
      badge: { emoji: "🏅", label: "新手村结业" },
      nextLevelId: "c2-1",
    },
  ],
};

export default level;
