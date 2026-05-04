import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c2-2",
  chapterId: "c2",
  title: "AI 联网搜索：让它知道'今天'",
  emoji: "🔍",
  difficulty: 1,
  xpReward: 35,
  estimatedMin: 8,
  steps: [
    {
      kind: "text",
      markdown: `上一关说过：**AI 不知道当下在发生什么**。它的知识停留在训练数据被切断的那一刻——可能是去年某个月。

那它怎么帮你查今天的新闻、最新的产品、当下的股价？答案是：**联网搜索**。

新版的 ChatGPT、Claude、通义千问都能联网了。打开"联网"开关，AI 就会先去搜索引擎查一圈，再综合结果回答你。`,
    },
    {
      kind: "text",
      markdown: `下面咱们模拟一下。你来下达一个搜索任务，看看 AI 联网时它内部在干嘛。`,
    },
    {
      kind: "terminal",
      intro: "假设你问 AI：「2026 年 4 月最新发布的 AI 产品有哪些值得关注的？」AI 后台会启动搜索流程——",
      cwd: "ai-search",
      command: "search '2026年4月 AI新品 值得关注'",
      output: [
        { line: "→ 启动搜索引擎…", delay: 600, tone: "dim" },
        { line: "→ 调用 Bing / Google / 知乎 / 微信公众号", delay: 700, tone: "dim" },
        { line: "✓ 命中 24 条相关结果", delay: 600, tone: "ok" },
        { line: "→ 抓取前 8 条网页正文", delay: 700, tone: "dim" },
        { line: "  · openai.com/blog/...      ✓", delay: 300, tone: "normal" },
        { line: "  · anthropic.com/news/...   ✓", delay: 300, tone: "normal" },
        { line: "  · sspai.com/post/...        ✓", delay: 300, tone: "normal" },
        { line: "  · zhihu.com/question/...   ✓", delay: 300, tone: "normal" },
        { line: "→ 去重 + 按时间排序 + 按权威度加权", delay: 700, tone: "dim" },
        { line: "→ 综合摘要…", delay: 700, tone: "dim" },
        { line: "✓ 已生成回答（附 5 条来源链接）", delay: 800, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `这就是联网搜索的真相：**AI 没有真的"知道"今天的新闻，它只是去搜了一下，再把结果整理给你**。

所以联网回答有两个特点：
- *准确度* 取决于它搜到的源头可不可靠
- *实时性* 还是有几小时到几天的延迟（搜索引擎收录需要时间）`,
    },
    {
      kind: "quiz",
      question: "下面哪种问题，**必须**让 AI 联网搜索才答得准？",
      allowMulti: true,
      options: [
        { id: "a", label: "用文言文翻译这首诗", correct: false, feedback: "这是 AI 知识库里就有的，不需要联网。" },
        {
          id: "b",
          label: "今天上证指数收盘价多少",
          correct: true,
          feedback: "实时数据，必须联网。",
        },
        {
          id: "c",
          label: "本周特斯拉发布会上说了啥",
          correct: true,
          feedback: "时效性强的新闻，必须联网。",
        },
        { id: "d", label: "解释什么是光合作用", correct: false, feedback: "高中生物常识，AI 知识库里早有了。" },
      ],
      explanation:
        "判断要不要联网：**答案会变吗？**\n\n- 历史/常识/原理 → 不会变 → 不用联网\n- 新闻/价格/数据/产品动态 → 每天在变 → 必须联网\n\n**但凡涉及'最新/今天/本周'，先打开联网开关再问。**",
    },
    {
      kind: "fill-blank",
      prompt: "AI 联网搜索的回答靠不靠谱，关键看 ___ 。",
      placeholder: "决定了 AI 综合得对不对",
      accept: ["来源", "源头", "信息源", "数据源", "网站"],
      hint: "AI 自己不会生造事实——它综合的是搜到的内容…",
      reveal: `**来源**。如果 AI 搜到的都是营销号，它综合出来的回答就是营销号水平。

所以好习惯是：**让 AI 给你列出参考来源**。比如在问题后面加一句"请在末尾列出你引用的网址"——这样你一眼就知道靠不靠谱。`,
    },
    {
      kind: "celebration",
      title: "联网解锁！🌐",
      subtitle: "下次问 AI 实时问题前，记得开联网开关；看完回答记得检查来源。",
      xp: 35,
      badge: { emoji: "🌐", label: "联网搜索" },
      nextLevelId: "c2-3",
    },
  ],
};

export default level;
