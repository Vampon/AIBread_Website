import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c5-1",
  chapterId: "c5",
  title: "RAG：让 AI 用上你的私人资料",
  emoji: "📚",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `**问题来了**：你公司的所有合同、流程文档、产品手册加起来几千份。能不能让 AI 当个全知客服，新员工随便问？

直觉答案是 *"让 AI 学一遍这些文档"*。**这个想法 90% 是错的**——这一关咱们看看正确做法。

正确做法叫 **RAG**（Retrieval Augmented Generation，检索增强生成）。它是 2025 年企业 AI 应用最常用的架构。`,
    },
    {
      kind: "quiz",
      question: "为什么「让 AI 学一遍公司文档」（即微调）通常是个坏主意？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "文档每周都在改，每次都要重新训练，太贵",
          correct: true,
          feedback: "对！这是最致命的——成本和时效都顶不住。",
        },
        {
          id: "b",
          label: "微调让模型「风格变了」，但事实还是会幻觉",
          correct: true,
          feedback: "对。微调适合教 AI 风格，不适合塞事实。",
        },
        {
          id: "c",
          label: "微调过的模型把私料「记」进了参数，难以删除（合规风险）",
          correct: true,
          feedback: "对。GDPR / 数据下架请求都会让你哭。",
        },
        {
          id: "d",
          label: "微调的模型回答得更慢",
          correct: false,
          feedback: "微调不影响推理速度。这不是它的痛点。",
        },
      ],
      explanation: `**一句话**：微调适合教 AI **风格**（让它说话像鲁迅），不适合教 AI **事实**（让它知道公司退货流程）。`,
    },
    {
      kind: "text",
      markdown: `**RAG 的换思路**：既然不能让 AI "学会"，那就让它**每次回答前，先去查相关资料**。

下面咱们看一下 RAG 的真实运行流程——一次完整的"用户提问→检索→回答"长啥样。`,
    },
    {
      kind: "terminal",
      intro: "假设你做了一个公司客服 Bot。新员工问：「报销流程是什么？」后台 RAG 流程开始——",
      cwd: "rag-pipeline",
      command: "answer '报销流程是什么？'",
      output: [
        { line: "→ Step 1: 把问题向量化", delay: 500, tone: "dim" },
        { line: "  └ embedding model: text-embedding-3-small", delay: 400, tone: "dim" },
        { line: "  └ 输出: [0.034, -0.512, 0.881, ...] (1536 维)", delay: 400, tone: "dim" },
        { line: "✓ 向量化完成 (耗时 38ms)", delay: 500, tone: "ok" },
        { line: "→ Step 2: 在向量库里找最相似的段落", delay: 600, tone: "dim" },
        { line: "  └ 在 8421 段切片中检索 top 5...", delay: 500, tone: "dim" },
        { line: "  └ #1 《财务制度 v3》第 4 节        相似度 0.89", delay: 400, tone: "normal" },
        { line: "  └ #2 《报销操作手册》第 1 章       相似度 0.86", delay: 400, tone: "normal" },
        { line: "  └ #3 《差旅费报销标准》开头        相似度 0.82", delay: 400, tone: "normal" },
        { line: "  └ #4 《新员工入职 FAQ》Q12         相似度 0.78", delay: 400, tone: "normal" },
        { line: "  └ #5 《财务部内部流程》图 3        相似度 0.71", delay: 400, tone: "normal" },
        { line: "✓ 检索完成 (耗时 124ms)", delay: 500, tone: "ok" },
        { line: "→ Step 3: 把 top 3 拼成 prompt 喂给大模型", delay: 600, tone: "dim" },
        { line: "  └ system: 「下面是公司文档，请基于此回答…」", delay: 400, tone: "dim" },
        { line: "  └ user: 「报销流程是什么？」", delay: 400, tone: "dim" },
        { line: "→ Step 4: 大模型生成回答", delay: 500, tone: "dim" },
        { line: "  └ 流式输出中…", delay: 600, tone: "dim" },
        { line: "✓ 回答生成完毕 (耗时 1.8s)，附 3 条文档引用", delay: 600, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**关键变化**：AI **不需要"记住"** 公司文档。它每次都**临时查**，查完就忘。

类比一下：
- **微调** = 把整本《辞海》背下来
- **RAG** = 答题时手边放着《辞海》，需要时翻

显然后者更聪明、也更现实。`,
    },
    {
      kind: "fill-blank",
      prompt: "RAG 流程里，把文字变成「语义坐标」的那个模型，行业里叫 ___ 模型。",
      placeholder: "embedding / 嵌入 / ...",
      accept: ["embedding", "嵌入", "向量化", "embed"],
      hint: "想想刚才终端里看到的「向量化」那一步用了什么模型……",
      reveal: `**embedding 模型**（中文也叫"嵌入模型"）。

它把一段文字"压缩"成一组数字（典型 768~3072 维），让"意思相近的两段话"在数学上**距离也近**。
这样"退货流程"才能匹配到"售后办法"，即使字面完全不同。

常见 embedding 模型：OpenAI 的 \`text-embedding-3\`、Google 的 \`gemini-embedding\`、国内 BGE 系列、M3E。`,
    },
    {
      kind: "quiz",
      question: "下面哪些是 RAG 相比「微调」的优势？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "文档更新快——重新切片入库，几分钟搞定",
          correct: true,
        },
        {
          id: "b",
          label: "能溯源——每次回答都能附「我引用了哪份文档」",
          correct: true,
        },
        {
          id: "c",
          label: "省钱——比专门微调便宜 10 倍以上",
          correct: true,
        },
        {
          id: "d",
          label: "RAG 永远不会幻觉",
          correct: false,
          feedback: "这是误区。如果检索没召回正确文档，AI 还是会瞎答。RAG 只是降低了幻觉概率。",
        },
      ],
      explanation: `RAG 不是银弹。它的**最大坑**是检索召回不全：

- 用户问"售后规则"，但向量库里只匹配到"退货流程"——可能就漏检
- 跨多份文档的对比题（"产品 A 比 B 强在哪"）——RAG 容易跑偏

**解决方向**（业界 2025 年热点）：混合检索（向量+关键词+重排）、GraphRAG、Agentic RAG。`,
    },
    {
      kind: "reveal",
      prompt: "想知道你**不写代码**也能玩 RAG 的几种方法吗？",
      buttonLabel: "揭晓 4 个无代码 RAG 工具",
      hidden: `4 个一键就能玩 RAG 的工具，照难度排：

1. **NotebookLM**（Google 出，免费）—— 把 PDF / 网页 / 视频字幕拖进去就能"对话学"。**最推荐**入门用。
2. **GPTs / Claude Project** —— 上传你的资料，AI 就基于它们回答。
3. **Coze / Dify 知识库节点** —— 拖拽搭一个带 RAG 的 Bot，能上线。
4. **LlamaIndex / LangChain**（程序员）—— 完全自己写 RAG，灵活度最高。

> **最值得试**：NotebookLM 完全免费，把你想"对话"的所有资料拖进去——论文、笔记、会议纪要、合同——然后随便问。它甚至能基于这些资料生成一段双人播客。`,
    },
    {
      kind: "celebration",
      title: "RAG 解锁！📚",
      subtitle: "下次再听到「企业 AI」「AI 知识库」「智能客服」——99% 都是 RAG 在工作。",
      xp: 60,
      badge: { emoji: "📚", label: "RAG 启蒙" },
      nextLevelId: "c5-2",
    },
  ],
};

export default level;
