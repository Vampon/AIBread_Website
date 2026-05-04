import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c7-3",
  chapterId: "c7",
  title: "知识库 + 检索：把私料挂上去",
  emoji: "📦",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `回顾 c5-1：**RAG**（检索增强生成）= AI 回答前先去查资料。

在 Dify / Coze 里，这件事被简化成"挂知识库"——你把 PDF、Word、网页拖进去，平台自动切片、向量化、入库。

**但**——拖完不等于好用。挂完一堆文档发现 Bot 答得乱七八糟？**这一关讲清楚知识库的 3 个生死参数**。`,
    },
    {
      kind: "text",
      markdown: `**生死三参数**：

1. **切片大小**（Chunk Size）—— 一段切多长。太小丢上下文，太大检索糊
2. **embedding 模型**（嵌入模型，把文字变向量的工具）—— 中文用中文模型，英文用英文模型
3. **召回阈值**（相似度阈值）—— 只取相似度高于多少的段落。太松抓垃圾，太严啥都召不回

下面咱们模拟一遍真实的"挂载 → 切片 → embedding → 调试"全流程。`,
    },
    {
      kind: "terminal",
      intro: "在 Dify 后台点「知识库」→「新建」→ 拖入一份《公司报销制度.pdf》后，后台开始干活——",
      cwd: "dify-knowledge",
      command: "ingest 报销制度.pdf",
      output: [
        { line: "→ Step 1: 解析 PDF...", delay: 500, tone: "dim" },
        { line: "  └ 共 24 页, 提取文本 18,432 字", delay: 500, tone: "dim" },
        { line: "✓ 解析完成 (耗时 1.4s)", delay: 400, tone: "ok" },
        { line: "→ Step 2: 切片 (chunk_size=500, overlap=50)", delay: 600, tone: "dim" },
        { line: "  └ 切出 41 段", delay: 400, tone: "dim" },
        { line: "  └ 平均长度 449 字, 最长 512, 最短 234", delay: 400, tone: "dim" },
        { line: "✓ 切片完成", delay: 400, tone: "ok" },
        { line: "→ Step 3: embedding (model=bge-m3, 中文优化)", delay: 600, tone: "dim" },
        { line: "  └ 41 段 × 1024 维向量", delay: 500, tone: "dim" },
        { line: "  └ 写入向量库 (Qdrant)", delay: 500, tone: "dim" },
        { line: "✓ 入库完成 (耗时 6.2s)", delay: 600, tone: "ok" },
        { line: "", delay: 200 },
        { line: "→ 调试问答：「打车票最多能报多少？」", delay: 500, tone: "dim" },
        { line: "  └ 检索 top 3, 阈值 0.6:", delay: 400, tone: "dim" },
        { line: "  └ #1 第 7 节《差旅交通费》   相似度 0.87 ✓", delay: 400, tone: "normal" },
        { line: "  └ #2 第 3 节《报销总则》     相似度 0.71 ✓", delay: 400, tone: "normal" },
        { line: "  └ #3 第 9 节《报销限额表》   相似度 0.68 ✓", delay: 400, tone: "normal" },
        { line: "✓ 命中 3 段, 拼入 prompt → LLM 生成回答", delay: 600, tone: "ok" },
      ],
    },
    {
      kind: "quiz",
      question: "切片大小（chunk_size）应该设多少？",
      options: [
        {
          id: "a",
          label: "越小越好——颗粒度细，检索更准",
          correct: false,
          feedback: "切太小会丢上下文。比如把「满 200 元 / 报销时需附发票」切成两段，检索「报销条件」可能只命中前半段。",
        },
        {
          id: "b",
          label: "越大越好——一段塞越多内容越保险",
          correct: false,
          feedback: "切太大让 embedding 整段「语义糊」——一段里塞了 5 个话题，向量代表谁？也容易超模型 context。",
        },
        {
          id: "c",
          label: "中文一般 300~600 字，英文 200~400 token，按文档结构切（章节、段落）最理想",
          correct: true,
          feedback: "✓ 这是 2025 年业界经验值。**关键不是绝对长度，而是「一段表达一个完整意思」**。",
        },
        {
          id: "d",
          label: "切片大小不重要，模型够强就行",
          correct: false,
          feedback: "切片是 RAG 准确率的最大调节器，比换模型还重要。",
        },
      ],
      explanation: `**经验法则**：
- 制度类、FAQ 类（短小独立）→ 300~500 字
- 长文章、论文、合同 → 500~800 字
- 代码 / 表格 → 按函数 / 按行

**进阶**：很多平台支持"父子切片"——子段用来检索（短而精），父段用来给上下文（长而全）。Dify、LangChain 都支持。`,
    },
    {
      kind: "fill-blank",
      prompt: "中文知识库做 embedding，业界 2025 年用得最多的开源模型系列叫 ___（提示：北京智源研究院出的）。",
      placeholder: "BGE / M3E / ...",
      accept: ["bge", "BGE", "bge-m3", "BGE-M3"],
      hint: "终端日志里 model=___ 看到那个名字了吗？",
      reveal: `**BGE**（BAAI General Embedding，北京智源研究院出品）。

中文场景下，**BGE / BGE-M3 是 2025 年事实标准**——免费、开源、效果优于多数闭源方案。

其他常见选择：
- **国际**：OpenAI \`text-embedding-3\`（贵但稳）、Cohere、Google Gemini Embedding
- **国内**：BGE 系列（最常用）、M3E、Jina-zh
- **多语言**：BGE-M3 同时支持中英 100+ 语言`,
    },
    {
      kind: "reveal",
      prompt: "实战调优 3 招——挂完知识库发现 Bot 答不准，先调啥？",
      buttonLabel: "揭晓切片调优 3 招",
      hidden: `**第一招：检查切片**
进 Dify/Coze 知识库后台，**打开切片预览**——逐段看。常见错误：
- 表格被切碎（行和表头分开了）
- 列表被切碎（"1.…2.…3.…"中间断开）
- 长合同的"定义条款"被切到中间

→ 解决：调切片大小，或用"按段落切"代替"按字数切"。

**第二招：加重排（Rerank）**
向量检索召回 top 10，再用一个**重排模型**（如 BGE-Reranker）打分留 top 3。
→ Dify 知识库设置里直接开关。**亲测能让命中率提升 20%**。

**第三招：混合检索（Hybrid Search）**
向量检索 + 关键词检索同时跑，结果合并。
→ 解决"专有名词检索不到"的痛点（比如"K3 流程"这种代号，向量化容易丢失）。

> **诊断口诀**：答不准先看召回，召回不对先看切片。模型反而是最后再换的。`,
    },
    {
      kind: "celebration",
      title: "知识库挂载完毕！📦",
      subtitle: "Bot 现在有「私货」可查了。下一关：怎么把它接到微信、飞书让人真正用上。",
      xp: 60,
      badge: { emoji: "📦", label: "知识库调优师" },
      nextLevelId: "c7-4",
    },
  ],
};

export default level;
