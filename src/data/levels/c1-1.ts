import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c1-1",
  chapterId: "c1",
  title: "AI 到底是什么？",
  emoji: "🤖",
  difficulty: 1,
  xpReward: 30,
  estimatedMin: 7,
  steps: [
    {
      kind: "text",
      markdown: `先别慌。**AI 不是科幻片里那种自我意识的机器人**，至少现在还不是。

我们日常说的 AI，主要指 *用大量数据训练出来的、能理解和生成内容的程序*。给它一段文字，它能续写；给它一张图，它能描述；给它一个问题，它能回答。

仅此而已。但仅此一项，已经够它颠覆一大堆事了。`,
    },
    {
      kind: "quiz",
      question: "下面哪一项 **不属于** 当前 AI 的能力？",
      options: [
        { id: "a", label: "把一段中文翻译成英文", correct: false, feedback: "翻译是 AI 最擅长的事之一。" },
        { id: "b", label: "根据描述画一张图", correct: false, feedback: "图像生成 AI 已经很成熟了。" },
        {
          id: "c",
          label: "拥有真正的情感和自我意识",
          correct: true,
          feedback: "对！现在的 AI 没有意识，它只是在做超大规模的'文字接龙'。",
        },
        { id: "d", label: "总结一份 50 页的 PDF", correct: false, feedback: "长文档总结也是常用场景。" },
      ],
      explanation: `这是最大的误区。AI 给你的回答看起来像有想法，其实它在做的是：**根据训练学过的海量文字，预测下一个最合理的字**。

像不像猜谜？它确实就是个超级猜谜大师。`,
    },
    {
      kind: "text",
      markdown: `换个比喻你就懂了：**AI 就像一个读了几乎全网内容的图书管理员**。

- 你问它"明朝末年发生了什么"，它能回忆起读过的史书
- 你问它"帮我写封请假邮件"，它能模仿读过的几百万封邮件的写法
- 你问它"今天天气怎么样"，它就抓瞎了——这事它*没读过*

记住这一点：**AI 不知道当下在发生什么**，除非你告诉它，或者它有联网功能。`,
    },
    {
      kind: "prompt-input",
      intro: "理论说够了，咱们试一下。下面是个真·AI 对话框，写点东西问问看。比如让 AI 用一句话解释什么是大模型——",
      placeholder: "比如：用一句大白话解释什么是大模型…",
      sampleInputs: [
        "用一句大白话解释什么是大模型",
        "请用面包做比喻解释什么是 AI",
        "给一个零基础的人讲讲什么是 ChatGPT",
      ],
      minChars: 6,
      aiReply: [
        "好问题！我用一个比喻：**大模型就像一个读完了全网内容的实习生**。",
        "你给它一个开头，它就能根据读过的东西猜出后面应该写什么。读得越多，猜得越准。",
        "ChatGPT、Claude、文心一言，本质都是这种'超大规模实习生'，只是各自的训练数据和性格不太一样。",
      ],
    },
    {
      kind: "fill-blank",
      prompt: "AI 给你的回答看起来很聪明，本质上是在做 ___ ？",
      placeholder: "两个字就能概括",
      accept: ["接龙", "文字接龙", "猜词", "预测", "续写"],
      hint: "上面我用了一个游戏术语来形容它的工作方式…",
      reveal: "对啦——**文字接龙**。它根据你给的开头，预测下一个最合理的字，一个接一个吐出来。",
    },
    {
      kind: "reveal",
      prompt: "想想看：既然 AI 是猜词游戏，它会不会有'瞎说'的时候？",
      buttonLabel: "我猜会，给我看答案",
      hidden: `**会，而且经常会。**

这种现象有个专门的名字叫 *幻觉 (hallucination)*。

举个真实例子：你问 AI "鲁迅打周树人是怎么回事"，有些 AI 会煞有介事编出一个故事——其实鲁迅就是周树人，是同一个人。

这就是为什么后面我们会反复强调：**AI 是助手不是判官**，关键信息一定要交叉验证。`,
    },
    {
      kind: "celebration",
      title: "出炉了！🎉",
      subtitle: "你已经知道 AI 不是天网，是个超级文字接龙大师。这是认识 AI 的第一块面包。",
      xp: 30,
      badge: { emoji: "🥖", label: "新手出炉" },
      nextLevelId: "c1-2",
    },
  ],
};

export default level;
