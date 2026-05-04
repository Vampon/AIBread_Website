import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c7-1",
  chapterId: "c7",
  title: "Dify：拖拽式 AI 应用",
  emoji: "🧱",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `想做一个能用的 AI 应用——能问能答、能查资料、能发到微信——你以为得写一堆代码？

**Dify**（一款国产开源的 AI 应用低代码平台）让你**拖拽**就能搭。每个功能都是一块"乐高"，连起来就是一个完整应用。

这一关咱们看看 Dify 怎么把"AI 应用"从代码工程，变成搭乐高。`,
    },
    {
      kind: "text",
      markdown: `**Dify 把 AI 应用拆成 4 种"乐高块"**——也就是节点（Node，工作流里的一步操作）：

- **LLM 节点**：调用大模型（GPT、Claude、文心一言等）回答
- **知识库节点**：从你挂上去的私料里找答案（就是 c5-1 讲的 RAG）
- **条件节点**：根据用户问题分流（"问退货走 A，问产品走 B"）
- **HTTP 请求节点**：调外部接口（查天气、查物流、发邮件）

把这几块拖到画布上，用线连起来，一个 AI 应用就成了。`,
    },
    {
      kind: "image-gen",
      intro: "想象一下 Dify 工作流画布的样子——左边是节点列表，中间是你拖拽出来的流程图。试着描述一个你想搭的小应用，看看出来啥。",
      promptPlaceholder: "比如：一个客户咨询机器人，先判断问题类型，再去知识库找答案……",
      sampleInputs: [
        "一个客户咨询机器人：先判断问题类型 → 走对应知识库 → LLM 总结回答",
        "一个周报生成器：拉取本周 Jira 工单 → LLM 整理成段落 → 输出 markdown",
        "一个翻译质检流水线：先翻译 → 再让另一个模型打分 → 低分自动重译",
      ],
      durationMs: 2000,
      resultSrc: "/placeholders/cover-3.svg",
      resultAlt: "Dify 工作流画布示意图",
      resultCaption: "（演示用占位图——真实场景里这里会是 Dify 后台的工作流画布截图）",
    },
    {
      kind: "quiz",
      question: "下面对 Dify 节点的描述，哪个是错的？",
      options: [
        {
          id: "a",
          label: "LLM 节点 = 调用大模型生成回答",
          correct: false,
          feedback: "这是对的描述。",
        },
        {
          id: "b",
          label: "知识库节点 = 从你挂上去的私料里检索（本质是 RAG）",
          correct: false,
          feedback: "这是对的描述。",
        },
        {
          id: "c",
          label: "条件节点 = 自动训练一个新的大模型",
          correct: true,
          feedback: "✓ 答对了。条件节点只是 if/else 分流，跟训练模型完全无关。Dify 工作流不训练模型，只编排调用。",
        },
        {
          id: "d",
          label: "HTTP 请求节点 = 调用任意外部接口（查天气、发邮件等）",
          correct: false,
          feedback: "这是对的描述。",
        },
      ],
      explanation: `**关键认知**：Dify 是**编排平台**，不是训练平台。它把现成的大模型、现成的工具、你自己的资料**拼装**起来——不生产新模型。

类比：Dify 是"乐高底板 + 说明书"，乐高块（模型、工具）是别人造的，你的工作是搭。`,
    },
    {
      kind: "text",
      markdown: `**变量（Variable）和调试**——两个新手必踩的坑：

- **变量**：节点之间传数据靠变量。上一步 LLM 输出的内容，存成 \`{{ai_answer}}\`，下一步 HTTP 节点就能拿来用。**忘记设变量 = 节点断链 = 整条流水线挂掉**。
- **调试（Debug）**：Dify 提供"试运行"按钮，每个节点的输入输出都能看到。**别一上来连 10 个节点再测**——每加 1 个就跑一次，错了立刻知道在哪。`,
    },
    {
      kind: "prompt-input",
      intro:
        "假设你要给一家网店搭一个「客户咨询机器人」。试着用大白话写出这个 Bot 的需求——它要做什么、不做什么、对哪些问题走知识库、哪些直接回答。这段需求就是你之后在 Dify 里搭工作流的「图纸」。",
      placeholder: "我要做一个… 它能… 遇到… 就走知识库… 遇到… 就直接答…",
      sampleInputs: [
        "做一个网店客服 Bot：用户问「订单/物流/退货」走客服知识库；问「产品参数/搭配建议」走产品手册知识库；问「闲聊/夸店」直接 LLM 回答；遇到「投诉/差评」转人工。",
      ],
      minChars: 30,
      expectKeywords: ["知识库", "客服", "Bot", "机器人", "回答", "用户"],
      miss: "提醒：至少把「这个 Bot 服务什么人 + 哪类问题走知识库 + 哪类直接 LLM 答」三件事写清楚。",
      aiReply: [
        "需求图纸有了，咱们看一下在 Dify 里怎么落：",
        "**入口**：用户提问 → **条件节点** 判断问题类型（关键词或让 LLM 先分类）。",
        "**分流**：客服类问题 → **知识库节点**（挂客服 FAQ）→ **LLM 节点** 整理回答。",
        "**兜底**：识别不出类型的 → 直接 **LLM 节点** 闲聊，并输出「如需更专业请转人工」。",
        "把这条流水线在 Dify 画布上连出来，就是一个能上线的 Bot 了。",
      ],
    },
    {
      kind: "reveal",
      prompt: "Dify 适合什么人？什么人**不要**用？",
      buttonLabel: "揭晓 Dify 的适用场景",
      hidden: `**适合**：
- **想做能上线的 AI 应用**（不是玩玩 demo）——Dify 自带 API、Web 嵌入、多模型切换
- **不想写一堆胶水代码**——LLM/RAG/工具调用全是拖拽
- **要给团队/小公司用**——开源可自部署，数据不出公司

**不适合**：
- 只想随便聊几句的个人玩家——直接用 ChatGPT / Claude / 豆包就行
- 需要极度定制化算法逻辑的——还是得写代码
- 完全零基础又没耐心看文档的——Dify 概念不少，门槛比 Coze 高一点

> **一句话**：Dify ≈ 给"想上线 AI 应用、但不想写后端"的小团队用的瑞士军刀。`,
    },
    {
      kind: "celebration",
      title: "Dify 入门！🧱",
      subtitle: "你已经懂了拖拽搭 AI 应用的基本玩法。下一关咱们看看更适合个人玩家的 Coze。",
      xp: 60,
      badge: { emoji: "🧱", label: "Dify 启蒙" },
      nextLevelId: "c7-2",
    },
  ],
};

export default level;
