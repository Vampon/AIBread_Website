import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c8-4",
  chapterId: "c8",
  title: "数据汇报",
  emoji: "📈",
  difficulty: 2,
  xpReward: 50,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `每周/每月汇报数据是销售、运营、产品的标配。以前流程是：**导 Excel → 写公式 → 画图 → 总结洞察**——一下午没了。

现在你只要把 CSV 丢给 AI，它能**算指标 + 画图 + 写洞察**一条龙。这一关教你怎么用得稳、用得安全。`,
    },
    {
      kind: "text",
      markdown: `**用什么工具？**

- **ChatGPT 的 Code Interpreter**（数据分析模式）——目前最强，会跑 Python
- **通义千问的数据分析**——国内首选，免费，跑 pandas
- **Kimi / 豆包** 也都支持上传 Excel 直接分析

它们底层都是 AI 写 Python 代码（pandas 是 Python 做数据处理的标准库）→ 自动执行 → 把结果告诉你。你不用懂代码，看结果就行。`,
    },
    {
      kind: "text",
      markdown: `**第一件大事：数据要先脱敏。**

公司数据扔给云端 AI，相当于发给一个外部供应商。**这些字段必须去掉**：

- 真实客户姓名 / 手机号 / 身份证 / 邮箱
- 内部员工的薪资、绩效细节
- 涉及合同金额的具体客户名

最简单的做法：用 Excel 的"查找替换"批量改成 *客户 A / 客户 B*。**3 分钟脱敏，能保你一年平安。**`,
    },
    {
      kind: "terminal",
      intro: "下面这是 AI 数据分析模式背后真实在跑的事。你看一眼就行，不用懂语法。",
      cwd: "~/sandbox",
      command: "python analyze.py sales_2026Q1.csv",
      output: [
        { line: "import pandas as pd", delay: 200, tone: "dim" },
        { line: "df = pd.read_csv('sales_2026Q1.csv')", delay: 200, tone: "dim" },
        { line: "✓ 加载完成：1842 行 × 7 列", delay: 400, tone: "ok" },
        { line: "", delay: 100 },
        { line: "[ 步骤 1 ] 计算周环比", delay: 400, tone: "dim" },
        { line: "  本周销售额：¥ 1,284,520", delay: 300 },
        { line: "  上周销售额：¥ 1,109,200", delay: 300 },
        { line: "  周环比：+15.8%  ↑", delay: 300, tone: "ok" },
        { line: "", delay: 100 },
        { line: "[ 步骤 2 ] Top 3 增长品类", delay: 400, tone: "dim" },
        { line: "  1. 烘焙原料  +32%", delay: 250 },
        { line: "  2. 烘焙工具  +18%", delay: 250 },
        { line: "  3. 包装材料  +12%", delay: 250 },
        { line: "", delay: 100 },
        { line: "[ 步骤 3 ] 生成图表 → chart.png", delay: 500, tone: "dim" },
        { line: "✓ 图表已保存", delay: 400, tone: "ok" },
        { line: "", delay: 100 },
        { line: "[ 步骤 4 ] AI 洞察", delay: 400, tone: "dim" },
        { line: "  · 烘焙原料增长贡献了本周 60% 的增量", delay: 350, tone: "warn" },
        { line: "  · 建议核查：是否有大客户集中下单？", delay: 350, tone: "warn" },
      ],
    },
    {
      kind: "text",
      markdown: `**第二件大事：让 AI 输出"四件套"。**

不要只问"帮我看看这数据怎么样"——这种问法 AI 只会糊弄。让它**结构化输出**：

1. **分析步骤**：它先讲清楚要怎么分析（让你能验证逻辑）
2. **代码**：贴出实际跑的 pandas 代码（让你能复现）
3. **结果**：表格 / 图
4. **洞察**：这数据说明了什么、值得警惕什么

四件齐了，你才有底拿这份分析去汇报。`,
    },
    {
      kind: "quiz",
      question: "下面这些字段，**上传给云端 AI 前必须脱敏**的有哪些？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "客户的真实姓名和手机号",
          correct: true,
          feedback: "对——个人信息绝对不能直接传，违反个保法。",
        },
        {
          id: "b",
          label: "员工的具体薪资和绩效",
          correct: true,
          feedback: "对——内部敏感数据，传出去就是事故。",
        },
        {
          id: "c",
          label: "脱敏后的「客户 A、客户 B」",
          correct: false,
          feedback: "已经脱敏的代号可以传——这正是脱敏的目的。",
        },
        {
          id: "d",
          label: "不涉及主体的纯数字（销售额、订单量）",
          correct: false,
          feedback: "纯数字本身没敏感性，可以传。",
        },
        {
          id: "e",
          label: "签了大单的具体客户名 + 金额",
          correct: true,
          feedback: "对——这是商业机密的典型组合，必须脱敏。",
        },
      ],
      explanation:
        "**判断标准**：能不能定位到具体的人或公司？只要能，就脱敏。**不确定就脱敏**——这是最安全的默认选项。",
    },
    {
      kind: "prompt-input",
      intro:
        "情境：你刚把脱敏后的「销售流水.csv」上传到 AI。请写一个「周环比分析」的 prompt，要求 AI 输出「分析步骤+代码+结果+洞察」四件套。",
      placeholder: "你是数据分析师，请基于上传的 csv，做…分析，输出…",
      sampleInputs: [
        "你是一位资深销售数据分析师。基于我刚上传的销售流水 csv（已脱敏，客户字段是客户 A/B/C），请帮我做「本周 vs 上周」的环比分析。请按四段输出：1) 分析步骤（说清楚你要怎么算）2) 代码（贴出你跑的 pandas 代码）3) 结果（用 markdown 表格 + 图表）4) 洞察（3 条以内，标出值得警惕或追问的地方）。最后所有关键数字请明确标出来源行号，方便我交叉核对。",
      ],
      minChars: 40,
      expectKeywords: ["四", "步骤", "代码", "结果", "洞察", "环比", "脱敏", "核对"],
      miss: "关键四件套没说全。再检查：分析步骤、代码、结果、洞察四块都让 AI 输出了吗？",
      aiReply: [
        "**专业级 prompt**——四件套齐了，还多带了「标出来源行号」这一招，方便你做交叉核对。",
        "你这种写法的好处是：哪怕 AI 算错了一个数，你顺着它给的代码和行号一查，5 分钟就能定位问题。完全不像别人盲信 AI 的结果。",
        "*最后一道关*：拿到结果后，**关键数字一定要在原表里抽查 2~3 个**。AI 偶尔会因为列名理解错算错聚合——你抽查就是兜底。",
      ],
    },
    {
      kind: "reveal",
      prompt: "AI 算出来的数字，要不要全信？",
      buttonLabel: "看答案",
      hidden: `**关键数字一定要交叉核对**。

AI 跑数据出错的常见姿势有三种：

1. **列名理解错**——把"金额"理解成了"数量"，整个分析全废
2. **聚合方式错**——你想要"平均值"它给了"求和"
3. **时间区间错**——"本周"边界算错一天

防御办法很简单：**自己在原表里手算 2~3 个关键数字**做对比。如果对得上，整份报告就可信；如果对不上，让 AI 解释代码，逐步排查。

**AI 是高效的助手，不是甩手掌柜**。汇报出去的数字，名字写在你头上，不是 AI 的。`,
    },
    {
      kind: "celebration",
      title: "数据分析下班了！📊",
      subtitle: "脱敏 → 四件套 → 交叉核对——下周汇报试试这套，节省 80% 的体力活。",
      xp: 50,
      badge: { emoji: "📈", label: "数据汇报达人" },
      nextLevelId: "c8-5",
    },
  ],
};

export default level;
