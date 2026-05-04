import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c2-4",
  chapterId: "c2",
  title: "上传文件 / 图像理解",
  emoji: "🖼️",
  difficulty: 2,
  xpReward: 45,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `前面你已经学会了**对话**和**联网搜索**。这一关解锁第三个超能力：**让 AI "看"东西**。

主流 AI（ChatGPT、Claude、通义、豆包）现在都支持上传文件——**PDF、图片、Excel、Word 都能直接拖进对话框**。它会读、会看、会算。

下面挨个讲三个最常用的场景。`,
    },
    {
      kind: "text",
      markdown: `**场景一：PDF 让它总结。**

你下载了一份 30 页的行业报告，没空全看。把 PDF 拖进对话框，发一句"用 5 个要点总结这份报告，重点关注 2026 年的趋势"。30 秒后你就拿到摘要。

**场景二：图片让它看。**

拍一张菜单、一张错题、一张商品标签、一张表格截图——它能**识别文字**（OCR）、**描述画面**、**回答你关于图里内容的问题**。`,
    },
    {
      kind: "terminal",
      intro: "假设你拍了一张餐厅菜单照片，让 AI 帮你提取信息——AI 看图时内部是这么干的：",
      cwd: "ai-vision",
      command: "analyze --input=menu.jpg --task='提取所有菜品和价格'",
      output: [
        { line: "→ 加载图像 menu.jpg (1.2 MB)…", delay: 500, tone: "dim" },
        { line: "→ 视觉编码器扫描像素…", delay: 700, tone: "dim" },
        { line: "✓ 识别到 1 张菜单（中文 + 阿拉伯数字）", delay: 600, tone: "ok" },
        { line: "→ OCR 文字识别…", delay: 700, tone: "dim" },
        { line: "  · 行 01: '招牌菜' (栏目标题)", delay: 250, tone: "normal" },
        { line: "  · 行 02: '红烧肉    ¥58'", delay: 250, tone: "normal" },
        { line: "  · 行 03: '糖醋排骨  ¥45'", delay: 250, tone: "normal" },
        { line: "  · 行 04: '清蒸鲈鱼  ¥88'", delay: 250, tone: "normal" },
        { line: "  · …共识别 23 道菜", delay: 400, tone: "normal" },
        { line: "→ 整理成结构化表格…", delay: 600, tone: "dim" },
        { line: "✓ 输出: { 招牌菜: 8项, 凉菜: 6项, 主食: 9项 }", delay: 700, tone: "ok" },
        { line: "✓ 已生成回答（最贵 ¥168 / 最便宜 ¥12 / 均价 ¥48）", delay: 700, tone: "ok" },
      ],
    },
    {
      kind: "text",
      markdown: `**场景三：Excel 让它分析。**

你有一份"过去半年订单数据"表格。拖进 ChatGPT，问"每个月销售额走势如何？给我画个折线图"。

它后台会**用 Python 跑一段代码**（这个功能叫"代码解释器" / "高级数据分析"），算完直接出图给你。**你不用懂代码**，给它 Excel + 一句中文问题就行。`,
    },
    {
      kind: "reveal",
      prompt: "AI 看图很强，但有几件事它真的干不了。点开避雷。",
      buttonLabel: "看 AI 看图的能力边界",
      hidden: `**AI 看图能干**：
- 识别文字（菜单、合同、错题、海报）
- 描述画面（人物、场景、风格、情绪）
- 读图表（折线图、柱状图、流程图）
- 看医学影像/工程图给个**初步**参考（不能当诊断！）

**AI 看图干不了 / 容易翻车**：
- *画图*——看图和画图是两回事。画图要用文生图模型（DALL·E、即梦、Midjourney）
- *精确测量*——别让它量"这张图里桌子有多长"
- *人脸识别身份*——出于隐私大模型一般会拒
- *模糊 / 反光 / 倾斜* 的图——OCR 准确率会断崖下跌

**PDF 上传也有边界**：
- 太大（超过几十兆 / 几百页）会**截断**，AI 只看前面一部分
- 扫描版 PDF（图片型）需要先 OCR，长文档容易丢细节
- 复杂表格、多栏排版可能解析错位

**Excel 边界**：超过几万行 AI 可能会跑超时或抽样分析——超大数据集还是得自己用工具。`,
    },
    {
      kind: "quiz",
      question: "下面哪些场景**适合**直接上传文件让 AI 处理，而不是把内容粘贴成文字？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "一份 40 页的 PDF 行业报告",
          correct: true,
          feedback: "对，这种粘贴会丢格式而且字数太多，直接上传更靠谱。",
        },
        {
          id: "b",
          label: "一张写满公式的黑板照片",
          correct: true,
          feedback: "对，让 AI 看图识别比你手动敲公式快得多。",
        },
        {
          id: "c",
          label: "一段 50 字的微信聊天",
          correct: false,
          feedback: "这种直接粘贴文字最快，上传文件反而多此一举。",
        },
        {
          id: "d",
          label: "一份带公式的 Excel 销售数据表",
          correct: true,
          feedback: "对，让 AI 用代码解释器跑分析，比你截图问效果好 10 倍。",
        },
      ],
      explanation:
        "判断标准很简单：**内容多、有格式、有结构 → 上传**；**内容短、纯文字 → 直接粘**。能让 AI 一眼看到全貌，它的判断质量就高。",
    },
    {
      kind: "fill-blank",
      prompt: "AI 看图能识别文字、描述画面、读图表，但它**不会画图**——画图要用专门的 ___ 模型。",
      placeholder: "DALL·E / 即梦 / Midjourney 都属于…",
      accept: ["文生图", "图像生成", "出图", "画图"],
      hint: "和「看图」相反的方向——输入文字，输出图片…",
      reveal: `**文生图 / 图像生成**模型。

记住区分：
- **图像理解**（看图）：你给图，AI 给文字描述/分析
- **文生图**（出图）：你给文字描述，AI 给图

ChatGPT 同时支持两种，但用的是不同的模型在背后跑。下一章咱们会专门玩文生图。`,
    },
    {
      kind: "celebration",
      title: "上传三件套，齐活！🖼️",
      subtitle: "现在 PDF / 图片 / Excel 你都能丢给 AI 处理了。下一关是第二章 BOSS——把所有信息检索的招数综合用一遍。",
      xp: 45,
      badge: { emoji: "🖼️", label: "看图识物" },
      nextLevelId: "c2-5",
    },
  ],
};

export default level;
