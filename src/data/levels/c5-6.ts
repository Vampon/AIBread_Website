import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-6",
  chapterId: "c5",
  title: "BOSS · 搭一个会查资料的 Agent",
  emoji: "👑",
  difficulty: 3,
  xpReward: 180,
  estimatedMin: 18,
  steps: [
    {
      kind: "text",
      markdown: `**第五章 BOSS 战来了**——不再讲新概念，咱们综合 RAG + Function Calling + MCP + Agent + Workflow，**亲手设计一个真实系统**。

**任务背景**：你刚入职一家 500 人公司，老板说：

> "做一个 AI 助手，新员工能问业务问题（合同条款、报销流程、谁负责啥），老问题能答、急问题能查、有些事还能直接帮忙办。"

这一关你将做 **6 个关键决策**——每个都对应前面学过的一个概念。准备好了？开始。`,
    },
    {
      kind: "text",
      markdown: `**先把任务拆开看**——这个 AI 助手要干 4 类事：

1. 答**通识题**（"年假怎么算？"——有标准答案）
2. 答**实时题**（"我这单报销审到哪了？"——要查系统）
3. 答**人事题**（"这个客户对接谁？"——要查通讯录）
4. 帮**办事**（"帮我提一个 IT 工单"——要操作系统）

每一类用**不同武器**搞定。下面挨个决策。`,
    },
    {
      kind: "quiz",
      question: "**决策 1**：第一类「答通识题」（合同条款、报销流程、年假规则）——最该用什么技术？",
      options: [
        {
          id: "a",
          label: "把所有公司文档**微调**进 GPT-4，让它「学会」",
          correct: false,
          feedback: "贵、慢、文档一改就要重训、还有合规风险。第五章第 1 关讲过。",
        },
        {
          id: "b",
          label: "用 **RAG**——文档切片入库，每次回答前先检索",
          correct: true,
          feedback: "✓ 文档天天改、要溯源、要省钱——RAG 三个优势全踩中。",
        },
        {
          id: "c",
          label: "让员工自己看文档",
          correct: false,
          feedback: "那就不需要 AI 助手了。",
        },
      ],
      explanation: `**通识题 = RAG 的主战场**。
公司 Wiki / 制度 / 产品手册 → 切片 → embedding → 入向量库 → 每次问答前检索 top-k → 拼进 prompt。`,
    },
    {
      kind: "quiz",
      question: "**决策 2**：第二类「实时题」（「我这单报销审到哪了？」）——要让 AI 接通真实业务系统。底层最该用什么？",
      options: [
        {
          id: "a",
          label: "**Function Calling**——给 AI 定义 `get_expense_status(user_id)` 这种函数",
          correct: true,
          feedback: "✓ 实时数据 → 必须 Function Calling 调真实系统。",
        },
        {
          id: "b",
          label: "RAG——把所有报销单都灌进向量库",
          correct: false,
          feedback: "RAG 只能存「已写好的文档」。实时变动的状态数据不适合用 RAG。",
        },
        {
          id: "c",
          label: "让 AI 自己猜",
          correct: false,
          feedback: "幻觉一万分。",
        },
      ],
      explanation: `**实时数据题 = Function Calling 主场**。
RAG 管"已经写下来的知识"，Function Calling 管"实时去查/去办的动作"——两者**不是替代，是搭档**。`,
    },
    {
      kind: "quiz",
      question: "**决策 3**：你想把上面这些工具（报销系统、通讯录、IT 工单系统）做成**通用接口**，让公司其他 AI 工具（Cursor、Claude Desktop）也能复用——选啥？",
      options: [
        {
          id: "a",
          label: "每个 AI 都单独写一套集成代码",
          correct: false,
          feedback: "M×N 的集成噩梦，第五章第 3 关讲过的反例。",
        },
        {
          id: "b",
          label: "把每个内部系统包装成 **MCP Server**——所有支持 MCP 的 AI 都能用",
          correct: true,
          feedback: "✓ 一次封装、处处可用。USB 思维。",
        },
      ],
      explanation: `**MCP 把"工具"标准化**。
你公司只要做一次 \`expense-mcp-server\`、\`contact-mcp-server\`，未来每出一个新 AI 工具，**插上就能用**。这是 2025 年企业 AI 中台的标准建法。`,
    },
    {
      kind: "quiz",
      question: "**决策 4**：第四类「帮办事」（「帮我提一个 IT 工单：办公室空调坏了」）——这种**多步骤、要决策**的任务，用什么？",
      options: [
        {
          id: "a",
          label: "**Agent**——给目标自主拆解：先问清问题→选分类→填表→提交→反馈工单号",
          correct: true,
          feedback: "✓ 多步、要决策、要追踪状态——经典 Agent 任务。",
        },
        {
          id: "b",
          label: "RAG 检索一下「如何报修空调」返回给用户",
          correct: false,
          feedback: "那就只是个查文档的，没真办事。",
        },
        {
          id: "c",
          label: "把这部分做成 Workflow（固定流程）",
          correct: false,
          feedback: "其实也行——但用户问题千奇百怪（「空调」、「投影仪」、「网络」），固定 Workflow 难覆盖。Agent 灵活性更适合。",
        },
      ],
      explanation: `**办事 = Agent 主场**。
不过实际工程上，常见做法是：**Agent 做主控，调用一个个 Workflow / Function 节点**——骨架稳定 + 局部灵活。`,
    },
    {
      kind: "text",
      markdown: `**决策做完了**，全公司 AI 助手的架构画出来了：

\`\`\`
用户提问
   ↓
 路由 Agent ──→ 是查文档？  → RAG (向量库)
            ──→ 是查实时？  → MCP/Function (业务系统)
            ──→ 是要办事？  → Agent 子流程 (多步执行)
            ──→ 是聊天？    → 直接大模型答
   ↓
   汇总 → 回复用户
\`\`\`

下面两步是关键的**人工活儿**——你来给这个系统**写两段提示词**。`,
    },
    {
      kind: "prompt-input",
      intro: "**任务 A：给路由 Agent 写「系统提示词」**——告诉它角色、能力边界、什么情况调什么。",
      placeholder: "你是公司 AI 助手……当用户问 X 时你要 Y……不允许 Z……",
      sampleInputs: [
        "你是XX公司内部AI助手，用中文回答员工问题。能查制度文档、报销状态、通讯录、提IT工单。回答前先判断问题类型，调对应工具。涉及薪资/隐私的不答，引导员工联系HR。",
        "角色：500人公司新员工小助理。原则：（1）能查文档就先查（2）查不到再调实时系统（3）涉及法务/财务/HR隐私事项必须人工兜底。语气：简洁，关键步骤分点。",
      ],
      minChars: 30,
      expectKeywords: ["你是", "助手", "角色", "公司", "员工", "回答", "工具", "文档"],
      miss: "提示词通常包含：**角色定位** + **能力范围** + **回答风格** + **不能做什么**——再补充一下？",
      aiReply: [
        "好提示词！我会重点关注两件事：",
        "**1. 边界**：你写的「涉及隐私不答」很关键——AI 助手最怕越界（比如随便答薪资），上线前必须明确禁区。",
        "**2. 回答前判断问题类型**：这个分流逻辑就是「路由 Agent」的灵魂——它决定走 RAG 还是走 MCP 还是走子 Agent。",
        "工业上还会加：兜底（「答不上来时引导联系真人」）+ 引用要求（「必须附文档来源」）+ 长度上限。",
      ],
    },
    {
      kind: "prompt-input",
      intro: "**任务 B：给 IT 工单 MCP 工具写「工具描述」**——这是 AI 看的「说明书」，要写得清楚 AI 才知道何时调、传啥参数。",
      placeholder: "工具名：create_it_ticket\n用途：……\n参数：……\n返回：……",
      sampleInputs: [
        "create_it_ticket: 创建一个IT工单。参数：category(分类: 网络/硬件/软件/账号)、title(简短标题)、description(详细描述)、urgency(紧急程度: 低/中/高)。返回工单号。仅在用户明确要求「提工单/报修」时调用。",
        "工具：submit_ticket。何时用：用户的问题是设备坏了、账号登不上、网络/打印机故障等需IT介入的具体故障。参数：category、title、description、urgency。不要用：用户只是咨询用法、抱怨情绪。",
      ],
      minChars: 30,
      expectKeywords: ["参数", "工单", "ticket", "category", "用途", "调用", "返回", "create"],
      miss: "工具描述至少要有：**何时调用** + **参数列表（每个参数啥意思）** + **返回啥**——再补充一下？",
      aiReply: [
        "这个描述就是 Function Calling / MCP 协议里 AI 看到的「说明书」。",
        "**关键技巧**：「**何时不要调用**」往往比「何时调」还重要——能避免大量误触发。",
        "例如你写的「用户只是咨询时不要调」——这一句能省下 50% 的乌龙工单。",
        "实际工程里，还会给每个参数加 enum 限制（例如 \`urgency: '低' | '中' | '高'\`）——这样 AI 不会乱传值。",
      ],
    },
    {
      kind: "text",
      markdown: `**最后一步**：来看一次完整跑通的样子。

模拟场景：新员工小李问 AI 助手——

> "我上周三提的差旅报销审到哪了？金额超 5000 要谁批？"

这个问题**同时考了 RAG + Function Calling**——咱们看后台一次完整 log。`,
    },
    {
      kind: "terminal",
      intro: "Agent 启动，混合调度 RAG + 工具——",
      cwd: "company-ai",
      command: "agent answer '上周三提的差旅报销审到哪了？金额超5000要谁批？'",
      output: [
        { line: "[路由] 检测到两个子问题：", delay: 600, tone: "dim" },
        { line: "  └ Q1: 报销审到哪了？(实时数据 → 调工具)", delay: 400, tone: "dim" },
        { line: "  └ Q2: 5000+ 要谁批？(制度规则 → 走 RAG)", delay: 400, tone: "dim" },
        { line: "[并发] 同时启动两条线", delay: 500, tone: "ok" },
        { line: "  ┌ Q1 → MCP: expense-server.get_status(user='李XX', date='上周三')", delay: 600, tone: "normal" },
        { line: "  │   返回: { id: 'EXP-2841', status: '部门经理已批，待财务审核', amount: 6280 }", delay: 700, tone: "ok" },
        { line: "  └ Q2 → RAG: 检索「差旅报销 审批权限」", delay: 600, tone: "normal" },
        { line: "      命中: 《差旅管理办法 v3》第 7 条 (相似度 0.91)", delay: 500, tone: "ok" },
        { line: "      内容: 「5000 元以上需财务总监审批，10000 元以上 CFO 审批」", delay: 500, tone: "ok" },
        { line: "[反思] 注意到金额 6280 > 5000 → 应提示用户「已进入财务总监审批流」", delay: 700, tone: "dim" },
        { line: "[生成回复]", delay: 500, tone: "dim" },
        { line: "✓ 「李工，您 5/27 提的差旅单 EXP-2841（6280 元）", delay: 700, tone: "ok" },
        { line: "  当前在【财务审核】节点。按制度，金额>5000 由**财务总监审批**，", delay: 400, tone: "ok" },
        { line: "  目前刘总监还有 3 单待批，预计 1-2 个工作日。", delay: 400, tone: "ok" },
        { line: "  📎 引用：《差旅管理办法 v3》第 7 条」", delay: 400, tone: "ok" },
      ],
    },
    {
      kind: "reveal",
      prompt: "想看一份**完整的企业 AI 助手技术清单**，照着可以直接立项？",
      buttonLabel: "揭晓 2025 年标准选型",
      hidden: `**前端**：飞书机器人 / 企业微信机器人 / 钉钉机器人（用户在哪用就接哪）

**编排层**：Dify（开源、能私有部署）或 n8n（更轻量）

**大模型**：
- 通用问答 → DeepSeek-V3 / Claude / GPT-4o
- 内网敏感 → 本地部署 Qwen 或 DeepSeek（私有化）
- 路由判断（小问题选哪条线）→ 用便宜小模型省钱

**RAG**：
- 向量库：Milvus / PGVector / Qdrant
- Embedding：BGE / OpenAI text-embedding-3
- 进阶：混合检索 + Rerank 模型

**工具层**：把内部系统包装成 **MCP Server**（HR、ERP、Jira、报销、邮件）

**监控**：Langfuse / Phoenix（看每次请求的成本、延迟、用户满意度）

> **干货**：把上面这些拼起来，**一个 3 人小团队 6 周可以上线公司级 AI 助手**。这就是 2025 年的标准建法。`,
    },
    {
      kind: "celebration",
      title: "BOSS 击杀！第五章通关 🧠",
      subtitle: "RAG + Function Calling + MCP + Agent + Workflow——你已经能从架构图层面看懂任何一个 AI 应用。接下来从概念走向真编程：第六章咱们玩 Claude Code / Cursor，亲手让 AI 帮你写代码。",
      xp: 180,
      badge: { emoji: "🧠", label: "AI 架构师" },
      nextLevelId: "c6-1",
    },
  ],
};

export default level;
