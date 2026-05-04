import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c7-4",
  chapterId: "c7",
  title: "把 Bot 接到微信 / 飞书",
  emoji: "📱",
  difficulty: 2,
  xpReward: 60,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `Bot 在 Dify / Coze 里跑通了——但用户**不会进你的后台聊天**。

得让它出现在大家本来就用的地方：**飞书群、微信群、公司官网**。这一步叫"渠道接入"（Channel）。

这一关讲清楚三种主流渠道的接法和**坑**——尤其是微信，搞不好会封号。`,
    },
    {
      kind: "text",
      markdown: `**三大渠道全景**：

| 渠道 | 难度 | 合规风险 | 适合谁 |
|------|------|---------|--------|
| **飞书机器人** | 极低（Coze 一键发布） | 无 | 公司团队、字节生态用户 |
| **企业微信** | 中（要审核） | 低 | 正规公司、对外服务 |
| **个人微信** | 高（用第三方框架） | **极高，可能封号** | 不推荐 |
| **网页嵌入** | 低（Dify 一键导出） | 无 | 自己网站、公众号文章 |

**敲黑板**：**个人微信调用 Bot 是灰色地带**——腾讯不开放官方接口，只能用 itchat 之类的非官方框架，账号随时可能被封。**正经做事用企业微信**。`,
    },
    {
      kind: "terminal",
      intro: "演示一下 Coze 上把 Bot 发到飞书的全流程。点了「发布到飞书」按钮之后——",
      cwd: "coze-publish",
      command: "publish --channel feishu",
      output: [
        { line: "→ Step 1: 检查 Bot 配置", delay: 400, tone: "dim" },
        { line: "  └ 人设 prompt ✓", delay: 300, tone: "dim" },
        { line: "  └ 知识库（已挂 1 个） ✓", delay: 300, tone: "dim" },
        { line: "  └ 头像 + 简介 ✓", delay: 300, tone: "dim" },
        { line: "✓ 配置检查通过", delay: 400, tone: "ok" },
        { line: "→ Step 2: 创建飞书自建应用", delay: 500, tone: "dim" },
        { line: "  └ 跳转 open.feishu.cn → 创建应用", delay: 400, tone: "dim" },
        { line: "  └ 拿到 App ID + App Secret", delay: 400, tone: "dim" },
        { line: "  └ 粘贴回 Coze 配置框", delay: 400, tone: "dim" },
        { line: "✓ 应用绑定完成", delay: 400, tone: "ok" },
        { line: "→ Step 3: 配置 Webhook（消息回调地址）", delay: 500, tone: "dim" },
        { line: "  └ Coze 自动生成: https://api.coze.cn/feishu/cb/abc123", delay: 400, tone: "dim" },
        { line: "  └ 复制粘贴到飞书后台「事件订阅」", delay: 400, tone: "dim" },
        { line: "  └ 订阅事件: im.message.receive_v1", delay: 400, tone: "dim" },
        { line: "✓ Webhook 已配", delay: 400, tone: "ok" },
        { line: "→ Step 4: 拉到飞书群里测一下", delay: 500, tone: "dim" },
        { line: "  └ @我的Bot 你好", delay: 600, tone: "normal" },
        { line: "  └ Bot 回复: 嗨！我是面包君的助手~", delay: 800, tone: "normal" },
        { line: "✓ 发布成功，Bot 已在飞书工作", delay: 600, tone: "ok" },
      ],
    },
    {
      kind: "quiz",
      question: "下面 4 种做法，**哪些是合规、可长期跑**的？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "用 Coze 把 Bot 发到飞书工作群",
          correct: true,
          feedback: "✓ 飞书有官方机器人接口，Coze 一键发布——完全合规。",
        },
        {
          id: "b",
          label: "用 itchat 框架挂个人微信号当 Bot 客服",
          correct: false,
          feedback: "✗ 高风险。腾讯不开放个人微信第三方接入，号随时可能被封。",
        },
        {
          id: "c",
          label: "走企业微信「客户联系」+「应用」官方接口接入 Bot",
          correct: true,
          feedback: "✓ 企业微信有官方机器人接口，要走资质审核但完全合规。",
        },
        {
          id: "d",
          label: "Dify 导出 iframe / JS SDK，嵌到自己公司官网",
          correct: true,
          feedback: "✓ 自己网站完全可控，无任何渠道方限制。",
        },
      ],
      explanation: `**合规口诀**：

- **飞书 / 企业微信** → 官方接口，放心用
- **个人微信** → 没官方接口，**绕过 = 封号风险**
- **自己网站** → 想咋嵌咋嵌，没人管

实操建议：先在飞书群里跑通 → 业务起来后接企业微信 → 大客户要白标就给 iframe 嵌入。`,
    },
    {
      kind: "fill-blank",
      prompt: "Bot 渠道接入的核心机制叫 ___ ——意思是「平台收到消息后，自动 POST 到你提供的回调 URL」。",
      placeholder: "一个英文单词",
      accept: ["webhook", "Webhook", "WebHook", "回调"],
      hint: "刚才终端日志 Step 3 里那个被复制粘贴的 URL，配的是啥？",
      reveal: `**Webhook**（回调钩子）。

机制：
1. 你在飞书 / 企业微信后台填一个 URL（Coze 给的）
2. 用户在群里 @Bot 时，飞书把消息 POST 到这个 URL
3. Coze 收到后调你的 Bot 生成回答 → 调飞书 API 把回答发回群里

> **类比**：Webhook 像门铃。你在飞书家门口装了个铃，按了之后铃声响在 Coze 家——Coze 接到响声起来开门（处理消息）。`,
    },
    {
      kind: "reveal",
      prompt: "上线前**必做**的 3 件事——避免被同事骂",
      buttonLabel: "揭晓上线 checklist",
      hidden: `**1. 先小群灰度，再全员推**
找 3~5 个同事先试用一天。**第一天 Bot 答错的回答，会决定你后面 30 天有没有用户**。

**2. 设触发词 / @ 触发，别让 Bot 抢话**
默认很多机器人会回答群里**所有**消息——这会让群友疯。**只在被 @ 时回答**是基本礼貌。

**3. 加"转人工"出口**
Bot 答不出 / 用户连续问同一问题 / 用户说"叫人来"——**自动 @ 一个真人**或推一个工单链接。
没出口的 Bot = 被骂的 Bot。

> 这三件事在 Dify 工作流里就是 3 个条件节点，10 分钟能配完。但 90% 的人上线时不配——然后被群友骂一顿才回来加。`,
    },
    {
      kind: "celebration",
      title: "Bot 上线啦！📱",
      subtitle: "你已经懂了完整的「搭 → 挂知识库 → 发上线」三段流程。下一关 BOSS——把这一切串起来做一个真正属于你的 Bot。",
      xp: 60,
      badge: { emoji: "📱", label: "渠道接入师" },
      nextLevelId: "c7-5",
    },
  ],
};

export default level;
