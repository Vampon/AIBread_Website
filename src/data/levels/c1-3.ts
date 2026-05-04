import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c1-3",
  chapterId: "c1",
  title: "训练 vs 推理：AI 怎么学会的",
  emoji: "🎓",
  difficulty: 2,
  xpReward: 50,
  estimatedMin: 9,
  steps: [
    {
      kind: "text",
      markdown: `这一关要把两个老被人搞混的词分清楚：**训练** *(training)* 和 **推理** *(inference)*。

只用一个比喻就能讲透——

- **训练** = 厨师 *上学学手艺*。一次性的事，几个月几年，烧钱烧到肉疼。
- **推理** = 厨师 *给你做一盘菜*。每次你点单都做一次，又快又便宜。

你每天用的 ChatGPT、文心一言，本质都是在用一个 *早就训练好的厨师*，每次给你做菜（推理）。`,
    },
    {
      kind: "text",
      markdown: `**训练这件事多贵？给你点真实数字感受一下：**

- GPT-4 据传训练成本超过 *1 亿美元*
- 用了几万张英伟达显卡，跑了好几个月
- 训练数据是 *几万亿个字* 的文本

**推理这件事多便宜？**

- 你问 ChatGPT 一个问题，OpenAI 在他们服务器上算几秒钟
- 成本大概几分钱到几毛钱人民币
- 你这边按一下回车就出来了

**所以记住：训练是 AI 公司操心的事，推理是你日常用的事。**`,
    },
    {
      kind: "quiz",
      question: "下面哪件事属于 **推理** （而不是训练）？",
      options: [
        {
          id: "a",
          label: "OpenAI 用几万张显卡跑了 3 个月，做出 GPT-4",
          correct: false,
          feedback: "这是典型的训练——一次性大投入。",
        },
        {
          id: "b",
          label: "你打开 ChatGPT 问'帮我写一封请假邮件'，它 5 秒后给你写好了",
          correct: true,
          feedback: "对！每一次对话都是一次推理。模型已经训练完了，现在只是在'用'它。",
        },
        {
          id: "c",
          label: "工程师把几万亿字的文本喂给模型，让它学习语言规律",
          correct: false,
          feedback: "这是训练，是厨师上学。",
        },
        {
          id: "d",
          label: "调整模型的几千亿个权重，让损失函数下降",
          correct: false,
          feedback: "这是训练里的核心动作。",
        },
      ],
      explanation: `**简单分辨法：**

- 在改模型本身（调权重） = 训练
- 模型不变，只是给你出一个回答 = 推理

你日常接触到的 99% 都是推理。`,
    },
    {
      kind: "text",
      markdown: `咱们看一眼真实的训练 log 是啥样。下面是一段简化版的训练输出，你看看就行——重点看 *loss*（损失值）这一列。

**Loss 越低，说明模型猜得越准**。训练就是想办法让这个数字一直往下掉。`,
    },
    {
      kind: "terminal",
      intro: "在你电脑上模拟一段训练 log（真实的会复杂得多，这里只展示核心信息）。点 ▶ 跑起来——",
      cwd: "~/ai-training",
      command: "python train.py --epochs 5 --batch-size 64",
      output: [
        { line: "Loading dataset... 1.2M samples", delay: 300, tone: "dim" },
        { line: "Initializing model with 124M parameters", delay: 400, tone: "dim" },
        { line: "", delay: 100 },
        { line: "Epoch 1/5  |  loss: 0.8521  |  acc: 31.2%", delay: 500, tone: "normal" },
        { line: "Epoch 2/5  |  loss: 0.6234  |  acc: 48.7%", delay: 500, tone: "normal" },
        { line: "Epoch 3/5  |  loss: 0.4218  |  acc: 64.3%", delay: 500, tone: "normal" },
        { line: "Epoch 4/5  |  loss: 0.2851  |  acc: 78.9%", delay: 500, tone: "normal" },
        { line: "Epoch 5/5  |  loss: 0.2104  |  acc: 85.6%", delay: 500, tone: "ok" },
        { line: "", delay: 100 },
        { line: "Training complete. Saving checkpoint to ./model.pt", delay: 400, tone: "ok" },
        { line: "Total time: 4h 23m  |  GPU hours: 8.7", delay: 300, tone: "dim" },
      ],
    },
    {
      kind: "text",
      markdown: `看到没？**loss 从 0.85 一路掉到 0.21**，准确率从 31% 涨到 85%。

这就是训练的全部故事——*让模型一遍遍看数据，每次错一点就调一点，直到它猜得越来越准*。

真实的大模型训练比这个夸张几个数量级：**几千亿参数、几万亿 token、几个月时间、几亿美金电费**。但本质就是这张表，重复亿万次。`,
    },
    {
      kind: "fill-blank",
      prompt: "训练完成后，模型的权重就被 *冻* 起来了。之后你每次用它（推理），它的权重 ___ 改变。",
      placeholder: "会还是不会？",
      accept: ["不会", "不", "不能", "不变", "不再"],
      hint: "你和 ChatGPT 聊天，它会因为你这次说了啥而变聪明吗？",
      reveal: `**不会改变**。

这是个反直觉的事：你和 ChatGPT 聊一万句，它都不会因此变得更懂你——它的权重早被冻住了。

它能在 *当前对话里* 记住上下文，是因为系统每次都把前面的对话原文一起喂给它。退出对话，下次重开，它就忘光了。`,
    },
    {
      kind: "quiz",
      question: "你和 AI 聊了三天，发现它越聊越懂你。这是因为？",
      options: [
        {
          id: "a",
          label: "你的对话在偷偷训练它，让它的权重越来越贴合你",
          correct: false,
          feedback: "误解！消费级 AI 几乎不会用你单次对话去实时训练。",
        },
        {
          id: "b",
          label: "它在这次对话里读到了你之前说过的内容（上下文），所以显得懂你",
          correct: true,
          feedback: "对！是上下文记忆，不是模型变了。换个对话就忘了。",
        },
        { id: "c", label: "AI 真的有了感情", correct: false, feedback: "没有。它只是接龙得很流畅。" },
      ],
      explanation: `**所以**：训练 = 一次性塑造模型本身；推理 = 每次对话单独发生，结束就忘。

明白这个，你就不会再有"AI 在偷偷学习我"这种焦虑了（除非那家产品明确说了会用你的对话数据训练，要看隐私政策）。`,
    },
    {
      kind: "celebration",
      title: "训练推理两清 🎓",
      subtitle: "你已经分得清谁烧钱、谁出活了。下一关咱们盘一盘：AI 到底能干啥、不能干啥。",
      xp: 50,
      badge: { emoji: "📚", label: "训练毕业" },
      nextLevelId: "c1-4",
    },
  ],
};

export default level;
