import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c6-5",
  chapterId: "c6",
  title: "BOSS · 上线一个个人小工具",
  emoji: "👑",
  difficulty: 3,
  xpReward: 180,
  estimatedMin: 18,
  steps: [
    {
      kind: "text",
      markdown: `**第六章 BOSS 战来了**。

任务：**上线一个属于你自己的、能在浏览器访问的小工具**。可以是英语单词卡、Todo、灵感记录板、喝水提醒，随你选。

要求：**真的部署成功**——别人输入网址能打开。这一关把 Claude Code、Cursor、Vibe Coding 全部串起来用。`,
    },
    {
      kind: "text",
      markdown: `**整体节奏**——

1. 先想清楚**要做啥**（写一份简短 PRD）
2. 选**对的工具**起项目（vibe coding 起骨架 / Claude Code 搭工程 / Cursor 写细节）
3. 一个模块一个 commit，**review diff**
4. 部署到 **Vercel**（免费、一键、给你个网址）

走完一遍——你就是一个真·独立开发者了。`,
    },
    {
      kind: "prompt-input",
      intro: "**第一关：写需求文档（PRD）**。给你打算做的小工具写一份五句话 PRD——做什么、给谁用、最小功能集、技术栈、明确不做什么。",
      placeholder: "项目名：...\n做什么：...\n给谁用：...\n核心功能（不超过 3 个）：...\n技术栈：...\n暂时不做：...",
      sampleInputs: [
        `项目名：每日灵感板（DailyMuse）

做什么：一个让我每天记录闪过脑子的灵感的小工具。

给谁用：自己。手机+电脑都能用。

核心功能（不超过 3 个）：
1. 一句话快速记录灵感（带时间戳）
2. 按日期浏览历史
3. 随机翻牌——抽一条过去的灵感重看

技术栈：Next.js 15 + TypeScript + Tailwind + localStorage。不接后端。

暂时不做：登录、跨设备同步、分享、标签分类。`,
      ],
      minChars: 80,
      expectKeywords: ["做什么", "功能", "技术", "栈", "不做", "用户", "给谁"],
      miss: "提醒：好的 PRD 必须有「明确不做什么」——这是控制范围的关键，不然 AI 会越写越多。",
      aiReply: [
        "✓ 这是一份合格的 PRD——**该有的边界都有了**。",
        "尤其「暂时不做：登录、同步、分享、标签」这一句——**这是新手最容易缺的部分**。",
        "范围一旦失控，AI 会把你带去做一个 SaaS 产品，3 天写不完。",
        "现在带着这份 PRD 进下一步：让 Claude Code 起项目骨架。",
      ],
    },
    {
      kind: "quiz",
      question: "**第二关：工具选型**。带着 PRD 起项目，你最该用哪个工具？",
      options: [
        {
          id: "a",
          label: "直接打开 v0.dev / Bolt.new，把整个 PRD 贴进去，让它一键生成完整项目",
          correct: false,
          feedback: "适合做原型快速验证。但要**上线长期使用**的项目，vibe coding 生成的代码不够干净，后续改第二版会痛苦。",
        },
        {
          id: "b",
          label: "用 Claude Code 起骨架，再用 Cursor 日常写代码——必要时去 v0 借一个漂亮的页面布局",
          correct: true,
          feedback: "✓ **混合打法**。骨架要稳（Claude Code）、日常补全要快（Cursor）、视觉灵感借力（v0）。",
        },
        {
          id: "c",
          label: "全程只用 ChatGPT 网页版，复制粘贴代码",
          correct: false,
          feedback: "可行但极慢——它读不到你的项目，每次都要你贴上下文。这一章学的工具就是为了避免这种用法。",
        },
      ],
      explanation: `**老手的工程化打法**：

- **Claude Code** 起骨架、跑大改、做重构（项目级）
- **Cursor / Copilot** 日常补全（行级 / 文件级）
- **v0 / Bolt** 借一个漂亮的初版界面（视觉级）

**别迷信单一工具**——不同工具有不同舒适区。`,
    },
    {
      kind: "quiz",
      question: "**第三关：写代码节奏**。下面哪种节奏最稳？",
      options: [
        {
          id: "a",
          label: "一句话给 Claude Code「把整个 PRD 实现」，然后等 30 分钟",
          correct: false,
          feedback: "30 分钟后大概率拿到一坨改不动的代码。任务太大、AI 容易跑飞。",
        },
        {
          id: "b",
          label: "拆成 5–8 个小任务，一个一个让它做，每完成一个就 commit + 浏览器验证",
          correct: true,
          feedback: "✓ 上一关讲过的「分阶段」。每个阶段 10–20 分钟、可回退、可 review。",
        },
        {
          id: "c",
          label: "全部自己手写，AI 只负责答疑",
          correct: false,
          feedback: "这一章不是这个画风。要敢于让 AI 写代码——但是分小步、看 diff。",
        },
      ],
      explanation: `**写代码节奏 = 小步快跑**：

1. **拆任务**：一个 commit 干一件事（加路由 / 写一个组件 / 接一个数据源）
2. **看 diff**：每次让 AI 改完，跑 \`git diff\` 看具体变化
3. **跑一遍**：浏览器打开看效果，没问题再 commit

**别问「我要不要看 diff」——永远要看**。`,
    },
    {
      kind: "quiz",
      question: "**第四关：部署判断**。代码写完了，下面哪个部署方案最适合个人小工具？",
      options: [
        {
          id: "a",
          label: "买台云服务器（ECS）+ 自己装 nginx + 配 SSL 证书",
          correct: false,
          feedback: "可行但是大炮打蚊子。运维负担一大堆，第一次上线没必要。",
        },
        {
          id: "b",
          label: "Vercel——GitHub 连接仓库 → 一键部署 → 拿到 https 网址，免费",
          correct: true,
          feedback: "✓ **个人项目首选**。免费档够用，CI/CD（自动部署）+ HTTPS + CDN（全球加速）全自动。",
        },
        {
          id: "c",
          label: "上传到自己的虚拟主机用 FTP",
          correct: false,
          feedback: "Next.js 这类需要 Node 运行时，普通虚拟主机跑不起来。",
        },
      ],
      explanation: `**Vercel 一键部署流程**：

1. 把代码 push 到 **GitHub**
2. 在 Vercel 注册（GitHub 一键登录）
3. 点 「Import Project」选你的仓库
4. 等 1 分钟 → 拿到一个 \`xxx.vercel.app\` 的网址

**免费档**：每月 100GB 流量、无限项目、自定义域名都有。个人小工具完全够。`,
    },
    {
      kind: "prompt-input",
      intro: "**第五关：写一个部署提示词**。给 Claude Code 写一段——让它帮你把项目推到 GitHub、再部署到 Vercel。",
      placeholder: "我项目已经写完了，帮我...",
      sampleInputs: [
        `我项目已经写完，本地能跑起来。现在要上线。

请帮我：
1. 在项目根目录跑 git status，确认没有未提交的改动
2. 检查 package.json 里 build 命令是不是 next build
3. 教我怎么在 GitHub 网页上建一个新仓库（一步一步说）
4. 给我接下来要跑的命令（git remote add → git push）
5. 教我在 Vercel 怎么 import 这个仓库

注意：不要替我执行 push 命令，每一步告诉我做什么、我自己跑。`,
      ],
      minChars: 80,
      expectKeywords: ["GitHub", "github", "Vercel", "vercel", "push", "部署", "上线", "build"],
      miss: "提醒：部署提示词要包含「GitHub」「push」「Vercel」这几个关键步骤——别让 AI 替你猜。",
      aiReply: [
        "✓ 这是一个**安全的部署提示词**——尤其「不要替我执行 push」这一条。",
        "我建议你**亲手敲 push 命令**——这样每次推送你心里都清楚发生了什么。",
        "下面我给你详细一步步走完整流程。",
      ],
    },
    {
      kind: "terminal",
      intro: "**第六关：模拟部署**。跑完整的上线流程——",
      cwd: "~/wordcard",
      command: "git add . && git commit -m 'feat: ready to deploy' && git push origin main",
      output: [
        { line: "[main 8f2a1c3] feat: ready to deploy", delay: 600, tone: "ok" },
        { line: "  18 files changed, 612 insertions(+), 23 deletions(-)", delay: 400, tone: "dim" },
        { line: "", delay: 200 },
        { line: "→ Counting objects: 24, done.", delay: 500, tone: "dim" },
        { line: "→ Compressing objects: 100%", delay: 500, tone: "dim" },
        { line: "→ Pushing to github.com:you/wordcard.git", delay: 600, tone: "dim" },
        { line: "✓ Push complete (main → main)", delay: 600, tone: "ok" },
        { line: "", delay: 300 },
        { line: "📡 Vercel webhook triggered automatically...", delay: 700, tone: "dim" },
        { line: "→ Installing dependencies (next, react, tailwind)...", delay: 800, tone: "dim" },
        { line: "→ Running `next build`...", delay: 900, tone: "dim" },
        { line: "  · compiled successfully", delay: 600, tone: "dim" },
        { line: "  · 12 static pages generated", delay: 500, tone: "dim" },
        { line: "→ Uploading to CDN (global edge)...", delay: 700, tone: "dim" },
        { line: "", delay: 300 },
        { line: "✓ Deploy ready!", delay: 600, tone: "ok" },
        { line: "🌐 https://wordcard-yourname.vercel.app", delay: 700, tone: "ok" },
        { line: "", delay: 200 },
        { line: "Build time: 47s · 0 errors · 0 warnings", delay: 600, tone: "dim" },
      ],
    },
    {
      kind: "reveal",
      prompt: "**最后一关——上线之后该干嘛？**",
      buttonLabel: "揭晓老司机建议",
      hidden: `**上线之后的 4 件正经事**：

1. **发朋友圈 / 推特** —— 有访问量它才有价值。哪怕只有 10 个朋友看，也是真实反馈。
2. **加一个使用日志** —— 自己每天用 1 周，记录哪里别扭。这是迭代第二版的素材。
3. **看 Vercel Analytics** —— 免费档自带访问统计。看看真有人用没。
4. **不要立刻接付费 / 接登录** —— 先验证 10 个用户喜欢用，再考虑商业化。

> **独立开发的真相**：**上线只是第 1 步**。从 0 到 1 最难，但**从 1 到能持续用**才是真的考验。

恭喜你——你已经完整走完了**从想法到可访问网址**的全流程。**这件事 5 年前还需要一个团队 + 一个月**。今天你一个人 + AI + 一下午就行。`,
    },
    {
      kind: "celebration",
      title: "上线成功！🚀",
      subtitle: "你已经是独立开发者了。下一章换个画风——不写代码也能搭 AI Bot：Dify / Coze 把你的想法变成对话式产品。",
      xp: 180,
      badge: { emoji: "🚀", label: "独立开发上线" },
      nextLevelId: "c7-1",
    },
  ],
};

export default level;
