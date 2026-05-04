import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c4-6",
  chapterId: "c4",
  title: "BOSS · 一周日更挑战",
  emoji: "👑",
  difficulty: 3,
  xpReward: 150,
  estimatedMin: 16,
  steps: [
    {
      kind: "text",
      markdown: `**第四章 BOSS 关到了。**

任务背景：你给一家新开的烘焙店打工，老板让你**在小红书日更 7 天**，主题是"烘焙学徒日记"——
每天一条图文，文字 + 配图，海外亲戚还要看英文版。

你一个人扛不下来？没事，本章学的全部工具今天串成一条流水线。`,
    },
    {
      kind: "text",
      markdown: `**整体流水线一图**：

1. AI 出 7 天大纲（c4-1 写作流水线）
2. 每天 1 条文案初稿 + 1 张配图（c4-1 + c4-2）
3. 配图三步走：出图→局部修→放大（c4-2）
4. 英文版翻译 + 自审（c4-3）
5. 一周复盘：把 7 天数据总结成下周选题（c4-5）

下面咱们走一遍关键节点。`,
    },
    {
      kind: "quiz",
      question: "Day 1 你打算让 AI 给 7 天大纲。下面哪种 prompt 更靠谱？",
      options: [
        {
          id: "a",
          label: "「给我 7 天的小红书选题」",
          correct: false,
          feedback: "太宽泛，AI 给你的会是七条同质化的水文。",
        },
        {
          id: "b",
          label: "「你是小红书烘焙账号操盘手。给我「烘焙学徒第一周日记」7 天选题，每条要含：钩子标题、卖点、配图建议。希望节奏从'萌新闹笑话'递进到'第一次出炉'，整周有故事弧线。」",
          correct: true,
          feedback: "对！角色 + 结构 + 节奏 + 输出格式都给到了。",
        },
        {
          id: "c",
          label: "「你想写啥写啥」",
          correct: false,
          feedback: "BOSS 关不要这么放养。",
        },
      ],
      explanation: "好的内容流水线起点都一样：**给角色 + 给结构 + 给节奏感**。",
    },
    {
      kind: "prompt-input",
      intro:
        "Day 3 选题是「第一次烤糊了一炉吐司」。请你写一条**小红书图文文案**的 prompt——要求 AI 给一版温情自嘲风、150 字左右、带 3 个 hashtag。",
      placeholder: "你是小红书…，主题…，风格…，长度…",
      sampleInputs: [
        "你是小红书烘焙学徒人设的内容写手。主题：第一次把整炉吐司烤糊了。风格：温情自嘲，不卖惨不讲鸡汤。约 150 字，分 3-4 段，每段不超过 2 行。开头要有钩子，结尾留一个能让粉丝评论的小问题。文末加 3 个相关 hashtag。",
      ],
      minChars: 35,
      expectKeywords: ["小红书", "学徒", "150", "字", "段", "hashtag", "钩子", "风格", "自嘲"],
      miss: "提醒：把人设、风格、字数、结构、互动钩子都写进去——一条 prompt 越具体越省后续修改时间。",
      aiReply: [
        "**烤糊那一炉，我哭笑了一整晚。**",
        "180 度调成了 280 度——师傅说「我没看就闻到味了」。",
        "整炉吐司从奶白色直接进化成了焦炭色。我蹲在烤箱前 10 分钟没说话。",
        "后来师傅笑我：糊一次记一辈子，比看 100 个教程都好用。",
        "你们第一次入行 / 入坑 / 学手艺，有没有一个「糊吐司」瞬间？",
        "#烘焙学徒日记 #第一次烤面包 #翻车实录",
      ],
    },
    {
      kind: "quiz",
      question: "Day 3 配图你想要「焦黑吐司从烤箱拿出来的瞬间」。这张图需要走几步？",
      options: [
        {
          id: "a",
          label: "一步——直接 Midjourney 出，能用就发",
          correct: false,
          feedback: "出来八成有瑕疵，分辨率也不够。",
        },
        {
          id: "b",
          label: "三步——出图（Midjourney/即梦）→ 局部修（PS AI 修畸形的手）→ 放大（Topaz/Magnific）",
          correct: true,
          feedback: "对，这就是 c4-2 教过的修图工作流。",
        },
        {
          id: "c",
          label: "两步——出图后直接放大，跳过局部修",
          correct: false,
          feedback: "瑕疵会被一起放大；该修就在中间修。",
        },
      ],
      explanation: "**出图 → 局部修 → 放大**，三步缺一不可。BOSS 关不偷懒。",
    },
    {
      kind: "image-gen",
      intro: "Day 3 配图 prompt——用「主体+风格+构图+光影」四件套写一句。",
      promptPlaceholder: "焦黑吐司从烤箱端出的瞬间，电影感胶片风，俯视特写，烤箱内暖红余光",
      sampleInputs: [
        "焦黑吐司从烤箱端出的瞬间，电影感胶片风，俯视特写，烤箱内暖红余光",
        "学徒的手戴着烤手套捧着糊吐司，纪实摄影风，半身平视，下午斜阳",
      ],
      durationMs: 2400,
      resultSrc: "/placeholders/cover-4.svg",
      resultAlt: "Day 3 配图演示",
      resultCaption: "（演示用占位图——真实场景由 Midjourney/即梦 完成首图）",
    },
    {
      kind: "quiz",
      question: "海外亲戚要看英文版。你打算怎么翻译 Day 3 这条？",
      options: [
        {
          id: "a",
          label: "丢进 Google Translate 直接复制",
          correct: false,
          feedback: "逐字翻不识「自嘲风」，海外读者会觉得很怪。",
        },
        {
          id: "b",
          label: "告诉 AI「这是小红书自嘲风学徒日记，目标读者是英文社交媒体用户」再翻，翻完让它自查",
          correct: true,
          feedback: "对——语境 + 风格 + 自我审查，c4-3 教的三招全到位。",
        },
        {
          id: "c",
          label: "让 AI 改写一份完全不同的英文版本",
          correct: false,
          feedback: "改写不是翻译，可能丢掉中文版的关键梗。",
        },
      ],
      explanation: "翻译三招在 BOSS 关一个不能少：**给语境 + 给风格 + 让它自查**。",
    },
    {
      kind: "prompt-input",
      intro:
        "周末复盘：你想让 AI 把「7 天 21 条评论 + 7 篇文案 + 7 张图 CTR 数据」汇总成下周选题建议。写一条**结构化总结指令**（要求结构 + 引用原文 + 长度限制）。",
      placeholder: "请按以下结构总结：① …② …③ …，每条结论标注 ___，全文不超过 ___ 字",
      sampleInputs: [
        "请基于附件里的 7 天数据（21 条评论 + 7 篇文案 + 7 张图 CTR）做复盘。按结构输出：① 一句话核心结论 ② 表现最好的 2 篇及原因（标注是哪一天） ③ 表现最差的 2 篇及原因 ④ 下周 7 个选题建议（每个标明对标本周哪条数据）。每个结论后用括号引用具体评论或数据。全文不超过 600 字。",
      ],
      minChars: 50,
      expectKeywords: ["结构", "引用", "标注", "字", "对标", "下周", "选题", "原文"],
      miss: "三件套全要：结构 + 原文引用 + 长度限制。",
      aiReply: [
        "**核心结论**：自嘲翻车类 > 教学类 > 成品展示类（评论数 3:2:1）。",
        "**最好的 2 篇**：Day 3 烤糊吐司（评论 47 条，转发 12，p.原文 D3） / Day 6 揉面手伤了（评论 38 条）。",
        "**最差的 2 篇**：Day 1 自我介绍（互动 6 条） / Day 5 设备开箱（互动 4 条）。",
        "**下周 7 个选题建议**：① 第一次拉丝失败（对标 D3 翻车线） …",
        "全文 547 字。",
      ],
    },
    {
      kind: "reveal",
      prompt: "BOSS 战通关清单——核对一下你都掌握了吗？",
      buttonLabel: "揭晓",
      hidden: `**第四章工具组合拳清单**：

- 写作流水线：大纲 → 初稿 → 配图，每步只解决一个问题
- 修图三步曲：出图 → 局部修 → 放大，工具各司其职
- 翻译三招：给语境 + 给风格样本 + 让 AI 自查
- 表格 / PPT：上传 + 代码解释器 / Gamma 一句话生成
- 长文整理：给结构 + 要原文出处 + 用 NotebookLM

**心法**：你是工厂厂长，AI 是流水线工人。
工具再多也只是分工——决策永远在你这边。`,
    },
    {
      kind: "celebration",
      title: "BOSS 通关！👑",
      subtitle:
        "你已经把 AI 当成一支团队来用了。接下来第五章，我们学一些进阶概念：RAG（让 AI 读你自己的资料库）、Function Calling（让 AI 调用工具）、Agent（让 AI 自己干活）。",
      xp: 150,
      badge: { emoji: "⚡", label: "日更挑战王" },
      nextLevelId: "c5-1",
    },
  ],
};

export default level;
