import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c4-4",
  chapterId: "c4",
  title: "AI 做表格 / PPT",
  emoji: "📊",
  difficulty: 2,
  xpReward: 55,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `两件最磨人的办公事——**整理表格 + 做 PPT**——AI 都能省你一大半时间。

这一关分两块：先讲表格（怎么把 Excel 丢给 AI 做汇总），再讲 PPT（怎么一句话生成一份能用的初稿）。`,
    },
    {
      kind: "text",
      markdown: `**表格部分：上传 + 代码解释器**

ChatGPT / 通义千问 / Claude 现在都能直接接收 Excel / CSV 文件。
背后有个工具叫 **Code Interpreter（代码解释器）**——AI 会在沙盒里跑 Python 帮你算。

你不用懂 Python，只管说"汇总一下每个月销售额"，它写代码、跑、给结果。`,
    },
    {
      kind: "terminal",
      intro: "假设你把一份「2026Q1 烘焙店销售.xlsx」丢给 ChatGPT，让它「按品类汇总销售额并找出 Top 3」——",
      cwd: "code-interpreter",
      command: "analyze 2026Q1_bakery_sales.xlsx",
      output: [
        { line: "→ 读取文件…", delay: 500, tone: "dim" },
        { line: "✓ 解析成功，共 1,284 行 × 6 列", delay: 600, tone: "ok" },
        { line: "→ 字段识别：日期 / 品类 / SKU / 数量 / 单价 / 金额", delay: 700, tone: "dim" },
        { line: "→ 按「品类」分组求和…", delay: 600, tone: "dim" },
        { line: "✓ 完成", delay: 400, tone: "ok" },
        { line: "", delay: 200, tone: "normal" },
        { line: "Top 3 品类（按销售额）：", delay: 400, tone: "normal" },
        { line: "  1. 可颂类      ¥ 184,520", delay: 300, tone: "normal" },
        { line: "  2. 酸面包类    ¥ 122,830", delay: 300, tone: "normal" },
        { line: "  3. 蛋糕类      ¥  98,460", delay: 300, tone: "normal" },
        { line: "", delay: 200, tone: "normal" },
        { line: "→ 已生成柱状图（chart.png）+ markdown 表格", delay: 700, tone: "ok" },
        { line: "  你可以直接复制粘贴到飞书 / Notion / 公众号", delay: 500, tone: "dim" },
      ],
    },
    {
      kind: "text",
      markdown: `**关键技巧：让它输出 markdown 表格**

AI 默认给你的可能是文字描述。多加一句 *"用 markdown 表格输出，便于我粘贴到飞书"*，结果就能直接复制。

飞书 / Notion / 语雀 / 公众号编辑器都支持 markdown 表格识别——粘进去自动变正经表格。`,
    },
    {
      kind: "prompt-input",
      intro:
        "练一下：你刚把销售数据给了 AI，怎么让它返回一份能直接粘到飞书的汇总？写一个 prompt（要求 markdown 表格 + 至少含两个统计维度）。",
      placeholder: "请用 markdown 表格汇总…，列出…",
      sampleInputs: [
        "请基于刚才的销售数据，用 markdown 表格汇总：每个品类的销售额、占总额百分比、环比上月增长率。表格按销售额从高到低排序，最后一行加合计。我要直接粘到飞书。",
      ],
      minChars: 30,
      expectKeywords: ["markdown", "表格", "粘", "飞书", "notion", "排序", "合计"],
      miss: "记得明确要 markdown 表格，并且说清楚要哪些列、怎么排序。",
      aiReply: [
        "好，给你做一份能直接粘的：",
        "| 品类 | 销售额 | 占比 | 环比 |",
        "| --- | ---: | ---: | ---: |",
        "| 可颂类 | ¥184,520 | 38% | +12% |",
        "| 酸面包类 | ¥122,830 | 25% | +5% |",
        "| 蛋糕类 | ¥98,460 | 20% | -3% |",
        "| **合计** | **¥485,810** | **100%** | **+6%** |",
        "复制粘贴到飞书文档，自动识别成表格。",
      ],
    },
    {
      kind: "text",
      markdown: `**PPT 部分：从大纲到成品**

这两年冒出一类工具：**Gamma / 通义千问 PPT / Beautiful.ai / 美图 AI PPT**——一句话生成 PPT。

原理一点都不神秘：AI 先写一份大纲，再把每页文字塞进预设模板，套配色和图标。`,
    },
    {
      kind: "text",
      markdown: `**适合 AI 做的 PPT**：内部分享、知识科普、读书会、产品介绍——以**文字结构**为主的。

**不适合的**：复杂数据图表、品牌视觉强相关的发布会、需要精确版式的提案。这些 AI 还不能稳定还原，最后还是要 PPT 老手收尾。`,
    },
    {
      kind: "quiz",
      question: "下面哪些场景适合直接用 AI PPT 工具一句话生成？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "周五下午 5 点要的「部门月度复盘」",
          correct: true,
          feedback: "对，文字结构为主的内部 PPT 是 AI 的甜区。",
        },
        {
          id: "b",
          label: "苹果发布会级别的产品 keynote",
          correct: false,
          feedback: "视觉精度极高的发布会，AI 还做不来。",
        },
        {
          id: "c",
          label: "给社团做一份「AI 入门科普」分享",
          correct: true,
          feedback: "对，知识科普类 PPT 是 AI 工具最擅长的。",
        },
        {
          id: "d",
          label: "包含 30 个动态图表的财务路演",
          correct: false,
          feedback: "复杂数据图表 AI 不能稳定还原，建议人工做。",
        },
      ],
      explanation:
        "判断标准：**这份 PPT 主要靠文字结构还是靠视觉精度？** 文字为主→交给 AI；视觉为主→老老实实自己做。",
    },
    {
      kind: "reveal",
      prompt: "想看一份「AI PPT 三句起手式」吗？",
      buttonLabel: "揭晓",
      hidden: `**三句起手式**：

> 1. 我要做一份给\\[谁\\]看的关于\\[什么\\]的 PPT，目的是\\[让对方做什么\\]。
> 2. 大约\\[N\\]页，重点放在\\[哪 2-3 个部分\\]。
> 3. 风格：\\[简洁商务 / 温暖科普 / 极客深色\\]。

把这三句填好丢给 Gamma 或通义千问 PPT，10 秒出初稿，剩下的就是改改文字。`,
    },
    {
      kind: "celebration",
      title: "办公提速！📊",
      subtitle: "表格交给代码解释器，PPT 交给 Gamma 这类工具。把省下的时间用来做真正费脑的部分。",
      xp: 55,
      badge: { emoji: "📊", label: "AI 办公小能手" },
      nextLevelId: "c4-5",
    },
  ],
};

export default level;
