import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-2",
  chapterId: "c5",
  title: "Function Calling 一文看懂",
  emoji: "🔧",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `**问题来了**：你问 ChatGPT「北京今天多少度？」——它不知道。它训练数据停在去年，它**不能上网、不能查天气、不能订机票**。

那为什么现在的 ChatGPT、Claude 真的能查天气、能发邮件、能订日程？

答案是 **Function Calling（函数调用）**。这一关咱们看清楚它怎么干活。`,
    },
    {
      kind: "text",
      markdown: `**先打个比方**：大模型像个**只会动嘴的高级顾问**——脑子聪明、嘴巴利索，但**手脚都没有**。

Function Calling 就是给它配了一群**实习生**：
- 顾问（AI）说："去查一下北京今天的温度"
- 实习生（你的程序）跑去真的查
- 实习生把结果递回顾问
- 顾问综合结果，组织成人话回答你

AI 自己**从不真的执行函数**——它只是**说"该调哪个函数、传啥参数"**。`,
    },
    {
      kind: "quiz",
      question: "下面哪些任务，**必须**用 Function Calling 才能搞定？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "查询「北京此刻天气」",
          correct: true,
          feedback: "对。这是实时数据，模型训练时不可能有。",
        },
        {
          id: "b",
          label: "把一段中文翻译成英文",
          correct: false,
          feedback: "这个 AI 自己就能干，不需要外部工具。",
        },
        {
          id: "c",
          label: "在你的日历里新建一个会议",
          correct: true,
          feedback: "对。AI 没法直接操作你的日历，必须通过函数。",
        },
        {
          id: "d",
          label: "解释「光合作用」是什么",
          correct: false,
          feedback: "通识题，AI 内置知识就够了。",
        },
        {
          id: "e",
          label: "下单一杯瑞幸",
          correct: true,
          feedback: "对。「下单」是和外部系统交互的动作。",
        },
      ],
      explanation: `**判断标准**：要不要**接触外部世界**（实时数据、真实系统、用户私人数据）？要 → Function Calling；不要 → AI 自己就够。`,
    },
    {
      kind: "text",
      markdown: `**下面来看一次完整的 Function Calling 流程**——

假设你给 AI 配了一个 \`get_weather\` 函数。用户问「上海今天多少度？」后台到底发生了什么？`,
    },
    {
      kind: "terminal",
      intro: "全过程一共 4 步——AI 决策、程序执行、结果回灌、AI 综合回答。",
      cwd: "function-calling-demo",
      command: "ask '上海今天多少度？'",
      output: [
        { line: "→ Step 1: 把「问题 + 工具说明书」一起喂给 AI", delay: 500, tone: "dim" },
        { line: "  └ 用户问题: 「上海今天多少度？」", delay: 400, tone: "dim" },
        { line: "  └ 工具列表: [get_weather(city), send_email(to,body)]", delay: 400, tone: "dim" },
        { line: "→ Step 2: AI 没直接答，而是返回一段 JSON", delay: 600, tone: "dim" },
        { line: '  {', delay: 300, tone: "normal" },
        { line: '    "tool": "get_weather",', delay: 300, tone: "normal" },
        { line: '    "args": { "city": "上海" }', delay: 300, tone: "normal" },
        { line: '  }', delay: 300, tone: "normal" },
        { line: "✓ AI 选定工具 (耗时 0.6s)", delay: 500, tone: "ok" },
        { line: "→ Step 3: 程序按 JSON 真实调用 get_weather('上海')", delay: 600, tone: "dim" },
        { line: "  └ HTTP GET https://api.weather.../shanghai", delay: 400, tone: "dim" },
        { line: "  └ 返回: { temp: 22, condition: '多云', humidity: 68 }", delay: 500, tone: "ok" },
        { line: "→ Step 4: 把函数结果回灌给 AI，让它组织人话", delay: 600, tone: "dim" },
        { line: "  └ AI 看到结果，生成回复…", delay: 500, tone: "dim" },
        { line: "✓ 「上海今天 22 度，多云，湿度 68%，适合穿薄外套。」", delay: 700, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**记住这两个关键点**：

1. **AI 不执行函数，只决定调哪个、传啥参数**——执行是你的程序干的
2. **AI 必须返回结构化的 JSON**，而不是大段的人话——这样程序才能机器读

所以 Function Calling 的本质是：让 AI 这个"嘴"和真实世界之间，多了一个**说明书 + JSON** 的标准接口。`,
    },
    {
      kind: "fill-blank",
      prompt: "Function Calling 流程里，AI 决定调用工具时，返回的格式必须是结构化的 ___，方便程序解析。",
      placeholder: "JSON / 字典 / ...",
      accept: ["json", "JSON"],
      hint: "想想刚才终端里 Step 2 输出的那一段……",
      reveal: `**JSON**（JavaScript Object Notation，一种通用的数据格式）。

为什么必须是 JSON？因为程序要"机器可读地"知道：
- 要调哪个函数（\`tool\` 字段）
- 传什么参数（\`args\` 字段）

如果 AI 返回大白话「请帮我查一下上海天气」——程序还得再做一次自然语言解析，**又慢又容易错**。JSON 是双方都能精确理解的"协议"。`,
    },
    {
      kind: "quiz",
      question: "下面对 Function Calling 的描述，**正确**的是？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "开发者要先写好「函数描述」（说明书），告诉 AI 有哪些工具、怎么用",
          correct: true,
        },
        {
          id: "b",
          label: "AI 可能在一次回答里**连续调多个**函数",
          correct: true,
          feedback: "对。比如「订机票 + 加日历」就要先后调两个工具。",
        },
        {
          id: "c",
          label: "AI 自己会执行 Python 代码、HTTP 请求",
          correct: false,
          feedback: "误区。执行的永远是你的程序，AI 只是「说」该调啥。",
        },
        {
          id: "d",
          label: "Function Calling 是 MCP 协议的前身——MCP 把这件事**标准化**了",
          correct: true,
        },
      ],
      explanation: `**Function Calling**（每家 AI 自己定义格式） → **MCP**（统一了协议，跨厂商通用）。
下一关你会看到 MCP 是怎么把这件事标准化、变成"USB 接口"的。`,
    },
    {
      kind: "reveal",
      prompt: "想看几个**真实生活里**已经在用 Function Calling 的 AI 产品吗？",
      buttonLabel: "揭晓 4 个例子",
      hidden: `你天天用的这些功能背后都是 Function Calling：

1. **ChatGPT 联网搜索** —— AI 调 \`web_search(query)\`，把结果回灌后再答你
2. **ChatGPT 画图** —— AI 调 \`generate_image(prompt)\`，DALL·E 真正出图
3. **Claude 计算器** —— 复杂数学题，AI 调 \`python_repl(code)\` 算完再答
4. **微信「腾讯元宝」订机票** —— AI 调内部 \`book_flight\` 工具下单

> **关键认知**：所有"AI 能干超出嘴皮子的事"——背后**几乎一定是** Function Calling 在工作。它是 Agent 的基础。下一关咱们看 MCP 把它怎么"统一插口"。`,
    },
    {
      kind: "celebration",
      title: "Function Calling 通关！🔧",
      subtitle: "下次看 AI 帮你查、查、订、发——你已经知道幕后是什么在跑了。",
      xp: 60,
      badge: { emoji: "🔧", label: "工具召唤师" },
      nextLevelId: "c5-3",
    },
  ],
};

export default level;
