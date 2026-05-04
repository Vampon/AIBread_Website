import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c1-4",
  chapterId: "c1",
  title: "AI 能做什么、不能做什么",
  emoji: "✅",
  difficulty: 1,
  xpReward: 30,
  estimatedMin: 8,
  steps: [
    {
      kind: "text",
      markdown: `这一关咱们换种玩法——**没什么大道理，就练判断力**。

一堆场景摆在你面前，你来判断："这事 AI 能干吗？" 答错也没关系，每题都有解释。

练完这一关，下次有人问你"AI 能不能 XXX"，你心里就有数了。`,
    },
    {
      kind: "quiz",
      question: "下面哪些事，**当前的 AI 干得不错**？（多选）",
      allowMulti: true,
      options: [
        { id: "a", label: "把一段中文翻译成日文", correct: true, feedback: "翻译是 AI 的强项，准确度往往超过普通人。" },
        { id: "b", label: "帮你写一封商务邮件初稿", correct: true, feedback: "文案类任务 AI 极强，一稿出来稍改就能用。" },
        { id: "c", label: "把一篇 50 页的报告总结成 5 条要点", correct: true, feedback: "长文总结是 AI 的甜点。" },
        { id: "d", label: "帮你把英文文章里的语法错误挑出来", correct: true, feedback: "语法检查、风格润色都很在行。" },
        {
          id: "e",
          label: "告诉你今天上海的实时天气",
          correct: false,
          feedback: "实时数据 AI 自己不知道——除非它有联网搜索功能。",
        },
      ],
      explanation: `这四件事的共同点：**输入和输出都是文字、且不依赖最新数据**。

凡是这种"读一段、写一段"的任务，AI 现在的水平已经够你日常用了。`,
    },
    {
      kind: "text",
      markdown: `下一组咱们看看 **AI 干得不太好** 的事。

不是干不了——而是 *准确率不够高、容易翻车*。这种事你可以让 AI 帮忙，但**必须自己复核**。`,
    },
    {
      kind: "quiz",
      question: "下面哪件事，让 AI 直接给答案 **风险最高**？",
      options: [
        {
          id: "a",
          label: "让 AI 算 38 × 47 等于多少",
          correct: false,
          feedback: "简单乘法现在的 AI 基本能算对，但复杂数学还是要警惕。",
        },
        {
          id: "b",
          label: "问 AI '某某历史人物的生卒年是哪一年'",
          correct: true,
          feedback: "对！具体的事实数据是 AI 幻觉的重灾区，看着有理有据，其实可能编的。",
        },
        { id: "c", label: "让 AI 帮你写个故事开头", correct: false, feedback: "创作类没有'对错'，AI 的弱点暴露不出来。" },
        {
          id: "d",
          label: "让 AI 把英文邮件翻译成中文",
          correct: false,
          feedback: "翻译它很在行，除非里面有专业术语需要确认。",
        },
      ],
      explanation: `**记住一条铁律：AI 越是给你具体的数字、名字、年份、引文，你越要验证**。

它说话的口气不会因为没把握就变弱——错的也说得斩钉截铁，这就是 *幻觉* 最坑的地方。`,
    },
    {
      kind: "quiz",
      question: "下面哪些事，**AI 现在根本做不了**？（多选）",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "替你拍板做一个重要决定（比如要不要离职）",
          correct: true,
          feedback: "对。它没有你的全部背景，也不该替你承担后果。",
        },
        {
          id: "b",
          label: "保证它说的每句话 100% 真",
          correct: true,
          feedback: "对。幻觉是 AI 的根本性局限，目前没有彻底解决方案。",
        },
        { id: "c", label: "帮你列个旅行打包清单", correct: false, feedback: "这是它能干的——属于一般性建议类任务。" },
        {
          id: "d",
          label: "去你家厨房真的烤一炉面包",
          correct: true,
          feedback: "对。它没有身体，做不了任何物理动作。",
        },
        { id: "e", label: "写一首押韵的打油诗", correct: false, feedback: "这它能干，且干得不错。" },
      ],
      explanation: `**AI 的三个硬边界：**

1. *做不了物理动作*——它没手没脚（机器人是另一回事）
2. *给不了你 100% 真的事实*——它本质是猜词
3. *不该替你做重大决定*——后果是你扛，不是它

剩下绝大多数文字工作，它都能搭把手。`,
    },
    {
      kind: "text",
      markdown: `还有一类事 *看起来 AI 应该能干、其实它干不好*——**访问你本地的私人文件**。

ChatGPT 看不到你电脑里的合同、看不到你公司内网的资料、看不到你昨晚发的微信。

除非你 *主动把内容粘给它*，或者用上一种叫 **RAG** *(检索增强生成)* 的技术——后面章节会讲。在那之前，记住一点：**AI 不是天眼，它只看你给它看的东西**。`,
    },
    {
      kind: "reveal",
      prompt: "最后想送你一个金句记一辈子——AI 是个 X 不是 Y。猜猜看？",
      buttonLabel: "我猜不出来，给我看",
      hidden: `**AI 是个能干的助手，不是判官；是个高效的工具，不是大师。**

具体说就是这几句话——

- 它能 *起草*，但定稿是你的活
- 它能 *给点子*，但拍板还得你
- 它说得 *斩钉截铁*，你也得自己核

把它当成一个 *24 小时在线、热情过头、偶尔会瞎说* 的实习生用，你的姿势就对了。`,
    },
    {
      kind: "celebration",
      title: "判断力上线 ✅",
      subtitle: "你已经能快速分辨 AI 能干啥、不能干啥了。下一关是新手村结业测——把前四关的内容混着考一遍。",
      xp: 30,
      badge: { emoji: "🎯", label: "边界识别" },
      nextLevelId: "c1-5",
    },
  ],
};

export default level;
