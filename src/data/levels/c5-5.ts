import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-5",
  chapterId: "c5",
  title: "工作流编排：把 AI 串起来",
  emoji: "🪢",
  difficulty: 3,
  xpReward: 70,
  estimatedMin: 12,
  steps: [
    {
      kind: "text",
      markdown: `**问题来了**：你想让 AI 帮你做一档自媒体——

每天**自动**：搜热点 → 选题 → 写稿 → 配图 → 排版 → 发布。

一个 prompt 能搞定吗？**几乎不可能**。每一步要的能力、模型、提示词都不一样。

这种"多步骤、每步分工"的任务，靠的是 **工作流编排（Workflow）**。`,
    },
    {
      kind: "text",
      markdown: `**工作流是啥**：

> 把一个复杂任务**拆成多步**，每一步用**最合适的模型 / 提示词 / 工具**，串成一条**固定流程图**。

类比一下**面包工厂的装配线**：
- 揉面（一台和面机） → 发酵（一个发酵箱） → 整形（人工） → 烘烤（烤箱） → 包装（机器）

**每一道工序专人专机**，按图执行。AI 工作流也是这样：每个节点干一件最擅长的小事，串起来才能干复杂活。`,
    },
    {
      kind: "image-gen",
      intro: "下面咱们模拟一下：用低代码工具搭一个「每日资讯简报」工作流。你来描述一下流程图——",
      promptPlaceholder: "例：搜索今日 AI 新闻 → 让 GPT-4o 摘要 → ……",
      sampleInputs: [
        "1.网页搜索AI热点 2.GPT-4o筛选3条 3.Claude写成300字摘要 4.飞书发送",
        "1.读取RSS 2.大模型分类打标签 3.推到Notion数据库 4.生成日报海报",
        "1.收到用户邮件 2.AI判断意图 3.工单系统创建 4.自动回复客户",
      ],
      durationMs: 2400,
      resultSrc: "/placeholders/cover-4.svg",
      resultAlt: "工作流编排示意图",
      resultCaption: "你刚才描述的就是一个典型的 AI Workflow——多个节点、按图固定执行。",
    },
    {
      kind: "text",
      markdown: `**几款主流工作流工具**——都是**拖拽就能搭**，不用写代码：

| 工具 | 特点 | 适合谁 |
|------|------|--------|
| **Dify** | 中文友好，AI 节点丰富 | 国内团队首选 |
| **Coze**（字节） | 一键发布到飞书/微信 | 想做小机器人 |
| **n8n** | 600+ 工具集成（连各种 SaaS） | 把 AI 接进现有系统 |
| **LangFlow / Flowise** | 开发者向，能导出代码 | 程序员原型 |

它们都长得像"乐高积木"——把"读邮件"、"调 GPT"、"存 Notion"这些块拖出来连起来就行。`,
    },
    {
      kind: "quiz",
      question: "**Agent vs Workflow**，下面哪个说法对？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "Workflow 流程**固定**，每一步都按你画的图走；Agent **自主探索**，下一步看情况",
          correct: true,
          feedback: "对。这就是两者最本质的差异：固定 vs 自主。",
        },
        {
          id: "b",
          label: "Workflow 更**可控、可预测**，企业线上业务首选",
          correct: true,
          feedback: "对。流程固定 → 容易测试、容易兜底、出错好排查。",
        },
        {
          id: "c",
          label: "Agent 更灵活，能处理**没预设过的边角情况**",
          correct: true,
        },
        {
          id: "d",
          label: "Workflow 比 Agent 高级，是 Agent 的下一代",
          correct: false,
          feedback: "误区。它们是**两种范式**，不是新旧关系。一般产品里**两者混用**：主流程 Workflow，复杂节点内嵌 Agent。",
        },
      ],
      explanation: `**口诀**：
- **流程清楚、要跑得稳** → Workflow（按图走）
- **任务开放、要灵活探索** → Agent（自己想）
- **大型产品** → 通常 Workflow 当骨架，Agent 当某个节点的"大脑"`,
    },
    {
      kind: "quiz",
      question: "下面这些任务，**Workflow** 还是 **Agent** 更合适？",
      options: [
        {
          id: "a",
          label: "客服系统：每天 1 万条工单，按规则分类、回复、分流",
          correct: false,
          feedback: "这种**高频、稳定、流程清晰** → Workflow 更合适（稳定、便宜、可控）。",
        },
        {
          id: "b",
          label: "「帮我研究一下：上海哪个区适合养老」",
          correct: true,
          feedback: "✓ 开放式探索任务、要查多个信源、要权衡 → Agent 更合适。",
        },
      ],
      explanation: `**实际工程里两者经常混用**：

> 主流程 = Workflow（写邮件 → 翻译 → 发送），但其中"翻译"这一步内嵌一个**翻译 Agent**——它会反思译文质量、不行就重译。

骨架稳定 + 局部灵活 = 鱼和熊掌兼得。`,
    },
    {
      kind: "fill-blank",
      prompt: "用拖拽方式（不写代码）就能搭 AI 工作流的国内最火工具，叫 ___ 。",
      placeholder: "三个字母的开源工具名",
      accept: ["dify", "Dify", "DIFY"],
      hint: "国内 AI 圈大家都在用、开源、对中文友好……",
      reveal: `**Dify**（也念"地飞")。

它是 2023 年中国开源的 LLM 应用编排平台，2025 年已经是国内事实标准。

**为什么火**：
- 拖拽就能搭，对小白友好
- 自带 RAG 知识库节点 + 工作流节点 + Agent 节点——三件套齐全
- 开源免费，能私有部署（公司内网都能跑）

**类似工具**：Coze（字节）更适合小白做"对话机器人"；n8n 更适合接集成。`,
    },
    {
      kind: "reveal",
      prompt: "**真实场景**里 Workflow 都用来干啥？想看几个例子？",
      buttonLabel: "揭晓 4 个企业里在跑的工作流",
      hidden: `这些场景**几乎全是 Workflow** 在背后跑：

1. **AI 客服**：用户问→意图分类（小模型）→去知识库检索 RAG（大模型）→生成回复→打分→发送
2. **简历筛选**：HR 收到简历→AI 解析关键字段→对照岗位 JD 打分→Top 30% 进面试库
3. **批量内容生产**：选题表 100 个→并行用 Claude 写稿→GPT-4o 改标题→DALL·E 配图→存 Notion
4. **日报机器人**：每天 9 点定时→拉昨天 Slack/邮件/会议记录→AI 摘要→发到飞书

> **关键认知**：你公司里那些"AI 自动化省人力"的项目，**底层多半是 Workflow**——不是单个聊天 AI 在硬扛。下一关综合 BOSS：你来设计一个完整的企业 AI 系统。`,
    },
    {
      kind: "celebration",
      title: "工作流串起！🪢",
      subtitle: "Workflow（按图走）+ Agent（自己想）+ RAG（查资料）+ MCP（插工具）+ Function Calling（动手）——五件套齐了，下一关综合考你。",
      xp: 70,
      badge: { emoji: "🪢", label: "流程编排师" },
      nextLevelId: "c5-6",
    },
  ],
};

export default level;
