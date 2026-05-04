import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c6-2",
  chapterId: "c6",
  title: "Cursor / Windsurf / Copilot 怎么选",
  emoji: "⚖️",
  difficulty: 2,
  xpReward: 50,
  estimatedMin: 10,
  steps: [
    {
      kind: "text",
      markdown: `上一关学了 **Claude Code**——AI 主导的"放手干"模式。

但你日常写代码 80% 的时间，是想要一个**坐在副驾**、随时给你补一行的伙伴。这一类工具叫 **AI IDE / AI 编程插件**。

市面上三家主流：**Cursor**、**Windsurf**、**GitHub Copilot**。这一关帮你挑。`,
    },
    {
      kind: "text",
      markdown: `**先看一句话定位**——

- **Cursor**：VSCode 派生的独立 IDE（集成开发环境，写代码的软件），AI 是一等公民。Agent（智能体）模式很强。**$20/月**起。
- **Windsurf**：Codeium 出品的同类 IDE，**免费额度宽松**，国内访问友好。新手最低门槛。
- **GitHub Copilot**：装在 VSCode/JetBrains 里的**插件**，不换 IDE，融入 GitHub 全家桶。**$10/月**起。`,
    },
    {
      kind: "quiz",
      question: "下面三个场景，你会怎么搭配？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "公司团队，已经全员用 GitHub + VSCode，要找最少摩擦的方案 → Copilot",
          correct: true,
          feedback: "✓ 不换 IDE、跟 PR / Issue 联动好，团队推广阻力最小。",
        },
        {
          id: "b",
          label: "个人开发者，预算紧，想先白嫖入门 → Windsurf",
          correct: true,
          feedback: "✓ 免费额度大、注册门槛低，先用着再说。",
        },
        {
          id: "c",
          label: "重度独立开发者，靠 AI agent 跑大段任务赚生产力 → Cursor",
          correct: true,
          feedback: "✓ Cursor 的 Composer / Agent 能力当下最成熟，老手多用它。",
        },
        {
          id: "d",
          label: "iPad 或手机上写代码 → 三家都不行，得用 Claude Code 网页版或云端 IDE",
          correct: true,
          feedback: "✓ 这三家都是桌面应用。移动端写代码目前只能靠云 IDE（如 GitHub Codespaces）或 Claude/Cursor 的网页 agent。",
        },
      ],
      explanation: `这道题没有错答案——**关键是知道每家擅长什么场景**。

记一句话：**Cursor 看上限，Windsurf 看门槛，Copilot 看生态**。`,
    },
    {
      kind: "text",
      markdown: `**手感差异**（这点比官网宣传更值得信）：

- **Cursor**：最新功能上得最快（Tab 补全、Composer、Agent）。但价格贵，每月 $20。
- **Windsurf**：补全速度快、Cascade（它家的 agent）也好用。**免费档每月几百次调用**够个人玩。
- **Copilot**：最稳。融入 PR review、Issue 转 PR 这种**团队工作流**最丝滑。补全已经很强，但 agent 模式起步晚于前两家。`,
    },
    {
      kind: "fill-blank",
      prompt: "三家中，**唯一以「插件」形式存在、不需要换 IDE** 的是 ___ 。",
      placeholder: "GitHub 出品的那个",
      accept: ["copilot", "github copilot", "Copilot"],
      hint: "Cursor 和 Windsurf 都是独立 IDE，只有它是装进 VSCode/JetBrains 用的。",
      reveal: `**GitHub Copilot**。

这就是它最大的优势——**你的 IDE、快捷键、插件、主题全都不用换**。

代价是：agent 模式（让 AI 跑一段长任务）目前还没 Cursor 成熟。`,
    },
    {
      kind: "reveal",
      prompt: "想看面包君日常的**真实组合**？",
      buttonLabel: "揭晓推荐组合",
      hidden: `**面包君的日常组合**（仅供参考，不绝对）：

1. **日常写代码**：Cursor 或 Copilot——开 Tab 补全 + 偶尔 inline chat（行内对话）
2. **跑较大任务**：切到 **Claude Code**——比如「重构这个模块」「加一个完整功能」「全项目改命名」
3. **团队代码评审**：Copilot 的 PR review 接 GitHub 工作流最顺

**核心思路**：**辅助型**（Cursor / Copilot / Windsurf）和**主导型**（Claude Code）**两种工具搭配用**，不是二选一。

> 类比：辅助型像副驾导航，主导型像代驾。短途自己开+导航，长途交给代驾。`,
    },
    {
      kind: "quiz",
      question: "如果你只能选一家**入门**，下面哪个建议最合理？",
      options: [
        {
          id: "a",
          label: "直接上 Cursor，最强就是它",
          correct: false,
          feedback: "Cursor 是好，但每月 $20 对新手是负担。先免费玩起来更划算。",
        },
        {
          id: "b",
          label: "先用 Windsurf 的免费档玩两周，确认你真的会经常用，再考虑付费的 Cursor / Copilot",
          correct: true,
          feedback: "✓ 务实路线。先验证习惯再花钱。",
        },
        {
          id: "c",
          label: "先把三家都装上同时用一周",
          correct: false,
          feedback: "切换成本太高，反而都没用熟。先专精一家。",
        },
      ],
      explanation: `**新手原则**：先免费跑两周（Windsurf 或 Copilot 学生白嫖档）→ 确认每天都在用 → 再升级到付费。

没必要一上来就付费——**先证明你会用**。`,
    },
    {
      kind: "celebration",
      title: "选型完成！⚖️",
      subtitle: "下一关咱们让 AI 干一件大事——从零搭一个完整项目。",
      xp: 50,
      badge: { emoji: "⚖️", label: "AI IDE 选型" },
      nextLevelId: "c6-3",
    },
  ],
};

export default level;
