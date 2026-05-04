import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c3-4",
  chapterId: "c3",
  title: "思维链 CoT：让 AI 慢慢想",
  emoji: "🪜",
  difficulty: 3,
  xpReward: 60,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `有些题 AI 一上来就回答会出错——尤其是数学题、逻辑题。但如果你让它**先把推理过程写出来再下结论**，准确率立刻拉高一截。

这一招有个名字，叫 **思维链 (Chain-of-Thought, 简称 CoT)**。`,
    },
    {
      kind: "text",
      markdown: `**为什么有效？**

回想第一章——AI 的本质是"文字接龙"，每次只想一个字。

如果你逼它直接吐答案，它没空"思考"；但如果你让它先写"第一步……第二步……"，它每接一个字就在为下一个字铺垫，相当于把脑力分摊到一长串文字里。`,
    },
    {
      kind: "text",
      markdown: `**激活 CoT 的魔法句子。**

最简单的版本只有一句：
> **Let's think step by step.**（让我们一步一步思考）

加在 prompt 末尾，普通模型在数学题上的准确率能从 30% 跳到 70% 以上。这是 2022 年一篇论文实测的数字。`,
    },
    {
      kind: "terminal",
      intro: "看个例子。下面这道小学应用题，开启 CoT 之后 AI 会怎么作答——",
      cwd: "~/cot-demo",
      command: "ai-ask --cot 'A 比 B 大 3 岁，5 年后两人年龄之和是 27，问 A 现在几岁？'",
      output: [
        { line: "[CoT 模式启动]", delay: 200, tone: "dim" },
        { line: "好的，让我一步一步思考：", delay: 600 },
        { line: "", delay: 100 },
        { line: "第 1 步：设 B 现在 x 岁，那 A 现在 x+3 岁。", delay: 700 },
        { line: "第 2 步：5 年后 B 是 x+5 岁，A 是 x+3+5 = x+8 岁。", delay: 800 },
        { line: "第 3 步：两人之和 = (x+5) + (x+8) = 2x+13", delay: 800 },
        { line: "第 4 步：题目说这个和等于 27，所以 2x+13 = 27", delay: 800 },
        { line: "第 5 步：解方程，x = 7，所以 B 现在 7 岁。", delay: 800 },
        { line: "第 6 步：A 比 B 大 3 岁，所以 A 现在 10 岁。", delay: 800 },
        { line: "", delay: 200 },
        { line: "答案：A 现在 10 岁。", delay: 400, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**注意到没？** AI 不是直接吐"10 岁"，而是把每一步推理写出来。

这有两个好处：
- **正确率高**——每一步只解决一小块，不容易翻车
- **可检查**——你能看出它哪一步算错了，及时纠正

代价是回答更长、更慢。但对需要"想"的任务，这绝对划算。`,
    },
    {
      kind: "quiz",
      question: "下面哪类任务**最适合**用 CoT？",
      options: [
        {
          id: "a",
          label: "翻译一句话",
          correct: false,
          feedback: "翻译是直觉性任务，不需要推理链。CoT 反而拖慢。",
        },
        {
          id: "b",
          label: "逻辑推理题、数学应用题、复杂条件判断",
          correct: true,
          feedback: "对。这类任务需要「分步推导」，CoT 几乎是免费提分。",
        },
        {
          id: "c",
          label: "查「珠穆朗玛峰多高」",
          correct: false,
          feedback: "事实查询不需要推理，加 CoT 只会让答案变啰嗦。",
        },
        {
          id: "d",
          label: "写一首押韵的诗",
          correct: false,
          feedback: "创作任务靠的是直觉和语感，写出「思考过程」反而破坏氛围。",
        },
      ],
      explanation:
        "判断方法：**如果一个真人需要在草稿纸上演算才能答对，那这道题就值得 CoT**。",
    },
    {
      kind: "prompt-input",
      intro:
        "你来试。下面这道题用普通 prompt 容易答错：「**一件衣服打 8 折后又减 20，最后 100 块。原价多少？**」请改写一个**带 CoT 激活语**的 prompt。",
      placeholder: "请一步一步思考：…",
      sampleInputs: [
        "一件衣服打 8 折后又减 20 元，最后是 100 元。请一步一步思考，列出推理过程，最后给出原价。",
        "请逐步推导：某衣服先打 8 折，再减 20 元，最终售价 100 元，原价是多少？请先写思路再给答案。",
      ],
      minChars: 25,
      expectKeywords: ["一步一步", "step", "逐步", "思考", "推理", "推导", "先", "过程"],
      miss: "提示：要触发 CoT，关键是加上「一步一步思考 / 逐步推导 / 先写思路再给答案」之类的句子。",
      aiReply: [
        "**到位**——你给 AI 留了「想」的空间。",
        "用这个 prompt，AI 通常会这样答：「设原价 x → 8 折后是 0.8x → 再减 20 变成 0.8x-20 → 等于 100 → 解出 x=150」。一步一步走下来，几乎不会算错。",
        "*关键点*：CoT 不是让 AI 装样子，是真的把「思考过程」当成 token 接龙的一部分，每步都在为下一步铺垫——所以才有效。",
      ],
    },
    {
      kind: "text",
      markdown: `**最后一个重要区分：推理模型 vs 普通模型。**

- **普通模型**（GPT-4o、Claude Sonnet、通义千问普通版）——需要你手动加"一步一步思考"才会触发 CoT
- **推理模型**（OpenAI o1/o3、DeepSeek-R1、Claude Opus 思考模式）——天生会自己 CoT，回答前先在内部"想"很久

后者你不用管 CoT，但更贵、更慢。**适合复杂题；简单题用普通模型够了。**`,
    },
    {
      kind: "fill-blank",
      prompt: "Chain-of-Thought 简称 CoT，激活它的经典英文句是 Let's think ___ 。",
      placeholder: "三个英文单词",
      accept: ["step by step", "step-by-step", "stepbystep"],
      hint: "中文意思是「一步一步」……",
      reveal:
        "**step by step**。完整版：Let's think step by step。这一句话被称作「prompt 工程史上最有影响力的 7 个单词」。",
    },
    {
      kind: "reveal",
      prompt: "想想看：CoT 这么神，为啥不所有 prompt 都加上？",
      buttonLabel: "我猜有副作用，看答案",
      hidden: `**三个真实副作用：**

1. **贵和慢**——回答变长好几倍，token 费用也跟着翻倍
2. **画蛇添足**——简单事实题加了 CoT，AI 会"假装思考"出一堆废话，反而像在凑字数
3. **过度自信**——CoT 让回答"看起来"很有逻辑，但前提错了照样会一本正经走完整个推理。**链子写得再长，起点错了终点也错。**

经验值：**遇到需要演算/推理的题再开 CoT；其他时候普通问就行。**`,
    },
    {
      kind: "celebration",
      title: "登上思维链！🪜",
      subtitle: "下次遇到难题，先让 AI「一步一步思考」。简单一句话，效果显著。",
      xp: 60,
      badge: { emoji: "🪜", label: "推理学徒" },
      nextLevelId: "c3-5",
    },
  ],
};

export default level;
