import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c3-3",
  chapterId: "c3",
  title: "Few-shot：用例子教 AI",
  emoji: "🪄",
  difficulty: 2,
  xpReward: 55,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `有些事用语言说不清楚——"我想要这种风格"、"按这种格式来"、"像这样分类"。

最快的解决办法不是写更长的描述，而是**直接给 AI 看几个例子**。这就是今天的主题：**Few-shot (少样本提示)**。`,
    },
    {
      kind: "text",
      markdown: `**三种姿势，难度递增。**

- **Zero-shot (零样本)**：直接下命令，不给例子
- **One-shot (一样本)**：给 1 个例子让 AI 模仿
- **Few-shot (少样本)**：给 2~5 个例子让 AI 找规律

例子越多，AI 越懂你，但 token (输入字数) 也越贵。`,
    },
    {
      kind: "text",
      markdown: `**举个真实场景：给用户评论打标签。**

Zero-shot：
> "请给下面评论分成正面/中性/负面"

Few-shot：
> "请按下面例子的格式分类——
> 评论：'物流好快' → 正面
> 评论：'味道一般' → 中性
> 评论：'吃了拉肚子' → 负面
> 现在请处理：'包装不错但口感差强人意'"

后者准确率高很多，因为 AI 看到了你眼里的"中性"具体长啥样。`,
    },
    {
      kind: "quiz",
      question: "下面哪些场景**特别适合**用 Few-shot？（多选）",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "把一堆短句按你心目中的标签体系分类",
          correct: true,
          feedback: "对！标签的定义在你脑子里，例子是最直接的教学方式。",
        },
        {
          id: "b",
          label: "让 AI 模仿某个作者的写作风格",
          correct: true,
          feedback: "对！风格是说不清的东西，给 2~3 段原文最有效。",
        },
        {
          id: "c",
          label: "问「今天天气怎么样」",
          correct: false,
          feedback: "这种事实查询用 Zero-shot 就够了，加例子反而画蛇添足。",
        },
        {
          id: "d",
          label: "把零散信息整理成你想要的固定 JSON / 表格格式",
          correct: true,
          feedback: "对！格式类任务给 1~2 个例子立刻搞定。",
        },
      ],
      explanation:
        "记住：**Few-shot 适合「难以用语言描述、但你一眼就能识别」的任务**——分类、风格、格式。",
    },
    {
      kind: "prompt-input",
      intro:
        "你来试：让 AI 把客户邮件分成「**投诉/咨询/感谢**」三类。请用 Few-shot 写——给 3 个示例，每类一个。",
      placeholder: "请按以下格式分类：\n邮件：…… → ……\n邮件：…… → ……",
      sampleInputs: [
        "请把客户邮件按下面例子的格式分类成「投诉/咨询/感谢」：\n邮件：你们物流太慢了，发了一周还没到。 → 投诉\n邮件：请问这款产品有 XL 码吗？ → 咨询\n邮件：客服小妹很耐心，帮我解决了大问题，谢谢！ → 感谢\n现在请处理：发来的杯子有划痕，能换吗？",
      ],
      minChars: 50,
      expectKeywords: ["→", "->", "投诉", "咨询", "感谢", "邮件"],
      miss: "提示：每个例子要有「输入 → 标签」的成对结构，给到 3 个例子，每类一个。",
      aiReply: [
        "**很标准的 Few-shot**——3 个例子覆盖 3 类，结构整齐。",
        "AI 看到这种 prompt 会立刻进入「模式匹配」状态：先在脑子里建 3 个标签的样本库，再用样本库去判断新邮件。",
        "*进阶提示*：如果某一类容易判错，多给那一类 1~2 个例子，准确率立刻上去。这叫做**例子加权**。",
      ],
    },
    {
      kind: "text",
      markdown: `**Few-shot 的小坑。**

- 例子顺序会影响判断（最后一个例子的影响最大）
- 例子如果都偏向某一类，AI 会跟着偏
- 给坏例子比不给例子还糟——AI 会忠实地学坏习惯

所以挑例子要**像考公务员出题一样**：覆盖典型情况、互不重复、答案明确。`,
    },
    {
      kind: "fill-blank",
      prompt: "给 AI 看 1 个例子叫 ___ ，给 2~5 个例子叫 Few-shot。",
      placeholder: "英文术语，连字符那种",
      accept: ["one-shot", "oneshot", "one shot", "1-shot"],
      hint: "和 Few-shot 长得很像，只是数量不同……",
      reveal:
        "**One-shot**。规律是 *Zero → One → Few*。例子从 0 个加到 5 个，AI 越来越懂你。",
    },
    {
      kind: "reveal",
      prompt: "想想看：既然例子越多越准，为什么不直接给 100 个例子？",
      buttonLabel: "我猜有代价，看答案",
      hidden: `**两个真实代价：**

1. **贵**：每多一个例子，输入的 token (字数) 就多一份，调 API 是要按字数收费的
2. **慢**：模型有"上下文窗口"上限（普通模型大概能塞几千到几万字），塞太满后面真正的问题反而被挤掉

经验值：**3~5 个高质量例子覆盖典型情况，性价比最高**。如果还是不准，先想想是不是例子选得不够典型，而不是无脑加更多。`,
    },
    {
      kind: "celebration",
      title: "Few-shot 解锁！🪄",
      subtitle: "下次遇到「说不清要啥」的任务，别再写长描述——直接给 AI 看 3 个例子。",
      xp: 55,
      badge: { emoji: "🪄", label: "举一反三" },
      nextLevelId: "c3-4",
    },
  ],
};

export default level;
