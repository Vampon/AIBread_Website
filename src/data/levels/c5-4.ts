import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-4",
  chapterId: "c5",
  title: "Agent：会自己干活的 AI",
  emoji: "🤖",
  difficulty: 3,
  xpReward: 70,
  estimatedMin: 12,
  steps: [
    {
      kind: "text",
      markdown: `2025 年最火的词是 **Agent（智能体）**。Manus、Devin、ChatGPT Agent、Claude Code——一夜之间全冒出来。

**一句话**：普通 AI 是「问一句答一句」。Agent 是「**给它一个目标，它自己拆解、自己干活、自己反思、自己交付**」。

这一关咱们看清楚 Agent 比普通 AI 多了什么。`,
    },
    {
      kind: "text",
      markdown: `**Agent 的公式**：

> Agent = 大模型（脑子）+ 工具（手脚）+ 自主循环（决策权）

类比一下做饭：
- **普通 AI** = 顾客嘴巴，只会念菜单
- **Function Calling** = 顾客手里多了一根筷子（能动一下）
- **Agent** = 直接派一个**厨师助理**进厨房：你说"做个番茄炒蛋"，他自己开冰箱、找锅、打蛋、调火、装盘、端上桌`,
    },
    {
      kind: "quiz",
      question: "下面哪一段任务描述，最适合用 Agent 而不是普通对话？",
      options: [
        {
          id: "a",
          label: "「把这段中文翻译成英文」",
          correct: false,
          feedback: "一步搞定，普通 AI 就行。",
        },
        {
          id: "b",
          label: "「帮我订一张周五去杭州的机票，最便宜的那种」",
          correct: true,
          feedback: "对！需要查日期、查机票网站、对比价格、下单——多步骤、要决策、要调多个工具，典型 Agent 任务。",
        },
        {
          id: "c",
          label: "「光合作用是什么？」",
          correct: false,
          feedback: "通识题，普通 AI 就行。",
        },
        {
          id: "d",
          label: "「给我推荐 3 本科幻小说」",
          correct: false,
          feedback: "AI 内置知识就能答，无需外部工具。",
        },
      ],
      explanation: `**Agent 任务的特征**：
- **多步骤**（不是一问一答）
- **要决策**（先做啥、后做啥、要不要重试）
- **要调多个工具**（日历、搜索、订单系统）
- **结果不确定**（中途可能要根据反馈调整路线）`,
    },
    {
      kind: "text",
      markdown: `**Agent 的灵魂叫 ReAct 模式**（Reason + Act，思考-行动循环）：

\`\`\`
观察 → 思考 → 行动 → 看结果 → 再思考 → 再行动 → ……直到完成
\`\`\`

普通对话是**一来一回**，Agent 是**循环往复**。每一步它都在问自己：
- 我离目标还有多远？
- 下一步该用哪个工具？
- 上一步的结果是不是出问题了，要不要换个思路？

下面咱们看一个 Agent 完成"帮老板预订一个会议室"的真实推理日志。`,
    },
    {
      kind: "terminal",
      intro: "老板说：「明天下午跟客户开会，找个能坐 8 人的会议室。」Agent 启动——",
      cwd: "agent-runtime",
      command: "agent run '明天下午跟客户开会，找个能坐 8 人的会议室'",
      output: [
        { line: "[Thought] 我需要：1) 确定明天的具体日期 2) 查老板下午时段 3) 找会议室", delay: 700, tone: "dim" },
        { line: "[Action] 调用 calendar.get_today()", delay: 500, tone: "normal" },
        { line: "  └ 返回: 2026-05-01 周五", delay: 400, tone: "ok" },
        { line: "[Thought] 「明天」= 2026-05-02 周六。先看看老板下午有没有空。", delay: 700, tone: "dim" },
        { line: "[Action] 调用 calendar.list_events('2026-05-02', boss=true)", delay: 500, tone: "normal" },
        { line: "  └ 返回: [{14:00-15:00 项目周会}]", delay: 400, tone: "ok" },
        { line: "[Thought] 14-15 点被占。建议 15:30 之后开会，开 1 小时。", delay: 700, tone: "dim" },
        { line: "[Action] 调用 booking.search_room(date=05-02, time=15:30-16:30, capacity=8)", delay: 500, tone: "normal" },
        { line: "  └ 返回: [紫罗兰厅(10人, 空), 听涛厅(12人, 空), 知春厅(8人, 已订)]", delay: 500, tone: "ok" },
        { line: "[Thought] 紫罗兰厅刚好——10 人位、不浪费、时间也合适。", delay: 700, tone: "dim" },
        { line: "[Action] 调用 booking.reserve(room='紫罗兰厅', time='05-02 15:30-16:30')", delay: 500, tone: "normal" },
        { line: "  └ 返回: { success: true, booking_id: 'BK-7821' }", delay: 500, tone: "ok" },
        { line: "[Reflect] 任务完成。生成给老板的汇报。", delay: 600, tone: "dim" },
        { line: "✓ 「已订紫罗兰厅，5/2 周六 15:30-16:30，可坐 10 人。订单号 BK-7821。」", delay: 800, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**注意刚才那段日志里，Agent 没有人催它**——

它自己拆解任务、自己一步一步推进、中间还会**反思**（"14-15 点被占，那就改 15:30"）。

这就是 Agent 和"Function Calling 一锤子调用"的本质区别：**Agent 有循环、有自主决策权**。`,
    },
    {
      kind: "fill-blank",
      prompt: "Agent 的核心循环模式（思考-行动反复迭代），行业里给它取了个名字叫 ___ 。",
      placeholder: "英文缩写",
      accept: ["react", "ReAct", "Reason-Act"],
      hint: "Reasoning（思考）+ Acting（行动）……",
      reveal: `**ReAct**（Reason + Act）。

这是 2022 年 Google 的论文提出来的范式，现在几乎所有 Agent 框架都在用。

**思考（Thought）→ 行动（Action）→ 观察（Observation）**——三步一循环，直到目标完成。
LangChain、AutoGPT、Manus、Cursor Agent 模式——内核都是 ReAct。`,
    },
    {
      kind: "prompt-input",
      intro: "现在轮到你**给 Agent 派个任务**。试着写一个**适合 Agent**（多步骤、要工具、要决策）的任务描述。",
      placeholder: "例：帮我研究一下深圳哪家咖啡馆最适合远程办公……",
      sampleInputs: [
        "帮我对比一下小米 SU7 和特斯拉 Model 3，写一份 500 字的购车建议",
        "下周我要去东京 5 天，帮我做一份每日行程，包含交通和必去景点",
        "帮我把 Notion 里所有标了「待跟进」的客户列出来，给每个发一封问候邮件草稿",
      ],
      minChars: 12,
      expectKeywords: ["帮", "查", "订", "对比", "写", "做", "研究", "整理", "找", "规划"],
      miss: "试着写一个**真要用工具**的任务（查、订、对比、整理、发邮件这种），而不是「光合作用是什么」这种纯问答。",
      aiReply: [
        "好任务！我会这样拆解——",
        "**第一轮**：理解你的目标 → 列出我可能要用的工具（搜索 / 日历 / 邮件 / 文档）",
        "**第二轮起**：每一步都「思考-行动-观察」循环，遇到障碍就重新规划",
        "**最后**：把所有结果汇总成一份你能直接用的交付物",
        "现在的 **Manus、Devin、ChatGPT Agent** 干的就是这个事——只是它们的循环跑得比你想象的更深、工具更多。",
      ],
    },
    {
      kind: "reveal",
      prompt: "现在主流的 Agent 产品都有哪些？分别擅长啥？",
      buttonLabel: "揭晓 2025 年 5 个明星 Agent",
      hidden: `**通用 Agent（什么都能干一点）**：

1. **Manus**（中国 Monica.ai 出）—— 网页版通用 Agent，能查能写能画，2025 年初一夜爆红
2. **ChatGPT Agent**（OpenAI 内置）—— 浏览网页、操作电脑，写邮件、订餐、买东西
3. **Claude Computer Use** —— Anthropic 出，让 Claude **看屏幕、点鼠标、敲键盘**

**垂直 Agent（专攻一件事）**：

4. **Devin**（Cognition 出）—— 全自动写代码工程师，能从需求到上线
5. **Cursor / Claude Code Agent 模式** —— 给个目标自己改代码、跑测试、提 PR

> **关键认知**：Agent 不是新模型——**用的还是 Claude / GPT 那批模型**。差别在外面那层"循环 + 工具 + 记忆"的工程封装。下一关你会看到这套封装最常见的另一种形态：**工作流编排**。`,
    },
    {
      kind: "celebration",
      title: "Agent 解锁！🤖",
      subtitle: "你已经懂 2025 年最重要的 AI 范式之一。下次看到「自主智能体」「Manus 替你打工」，能秒懂背后的 ReAct 循环。",
      xp: 70,
      badge: { emoji: "🤖", label: "Agent 训练师" },
      nextLevelId: "c5-5",
    },
  ],
};

export default level;
