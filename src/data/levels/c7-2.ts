import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c7-2",
  chapterId: "c7",
  title: "Coze：国内 Bot 平台",
  emoji: "🥟",
  difficulty: 1,
  xpReward: 50,
  estimatedMin: 9,
  steps: [
    {
      kind: "text",
      markdown: `如果说 Dify 是给小团队用的"AI 应用瑞士军刀"，**Coze**（字节跳动出的 Bot 平台）就是给个人玩家用的"AI Bot 流水线"。

**特点三件套**：免费、零代码、一键发到飞书/抖音/豆包。

这一关咱们看清楚 Coze 和 Dify 的差别，知道啥时候用哪个。`,
    },
    {
      kind: "text",
      markdown: `**Coze vs Dify ——一张表说清楚**：

| 维度 | Coze | Dify |
|------|------|------|
| **定位** | 个人玩家、轻量 Bot | 团队/企业、能上线的应用 |
| **是否开源** | 闭源（字节托管） | 开源（可自部署） |
| **发布渠道** | 飞书、豆包、抖音原生支持 | API、Web 嵌入、自集成 |
| **数据托管** | 在字节服务器 | 自部署 = 数据在自己服务器 |
| **门槛** | 极低（点点点） | 中等（要懂变量/节点） |
| **适合** | "我想做个好玩 Bot" | "公司要上线 AI 客服" |`,
    },
    {
      kind: "quiz",
      question: "下面 4 种场景，**应该用 Coze 而不是 Dify** 的是哪些？",
      allowMulti: true,
      options: [
        {
          id: "a",
          label: "我想做一个塔罗牌占卜 Bot 发到豆包给朋友玩",
          correct: true,
          feedback: "✓ 个人玩、要发到字节生态——Coze 优势明显。",
        },
        {
          id: "b",
          label: "公司有 5000 份合同要做内部问答系统，数据不能出公司",
          correct: false,
          feedback: "数据不出公司 = 必须自部署 = 选 Dify（开源）。Coze 是字节托管的。",
        },
        {
          id: "c",
          label: "我做了一个故事生成器，想发到飞书群里大家一起玩",
          correct: true,
          feedback: "✓ 飞书是字节系，Coze 一键发布。Dify 也能做但要自己配 webhook。",
        },
        {
          id: "d",
          label: "我们团队做的 AI 助手要给 100 家企业客户用，且要按企业隔离数据",
          correct: false,
          feedback: "多租户企业级应用，要 API、要可控——Dify 更合适。",
        },
      ],
      explanation: `**记忆口诀**：

- **个人玩 + 发到字节生态** → **Coze**
- **公司用 + 数据要可控** → **Dify**

两者并不冲突——很多人是先用 Coze 玩明白概念，再用 Dify 做正式项目。`,
    },
    {
      kind: "prompt-input",
      intro:
        "Coze 上线 Bot 时要写一段「Bot 简介」给用户看。想象你做了一个自己的 Bot——可能是给家人用的菜谱助手、给同事用的周报小工具、给朋友用的吐槽机——写一段 50 字以内的简介。",
      placeholder: "嗨，我是…，我可以帮你…，特别擅长…，不擅长…",
      sampleInputs: [
        "嗨，我是「面包脑」——专门帮你回忆菜谱的 Bot。说出「上次那个红烧肉怎么做」，我就能从你之前发过的菜谱里找出来。不擅长创新菜，只会复刻你做过的。",
        "嗨我是「周报代笔」。把你这周的 Jira 链接丢给我，我吐出一份不夸张、不造词的周报。不擅长写漂亮话，擅长写人话。",
      ],
      minChars: 25,
      expectKeywords: ["我", "Bot", "帮", "擅长", "可以"],
      miss: "提醒：简介里至少要说清「我是谁 + 我能干啥 + 我不擅长啥」。最后一条很重要——管理用户预期。",
      aiReply: [
        "简介挺好。Coze 上线时还有几个小细节：",
        "**头像**：尽量用一张能看出 Bot 性格的图（萌系、专业、复古都行）。",
        "**开场白**：用户第一次进来时 Bot 主动说的话。要包含 1 个使用示例，不然新人不知道咋问。",
        "**预设问题**：Coze 支持挂 3 个示例问题做按钮。**这个一定要配**——降低用户开口成本。",
      ],
    },
    {
      kind: "fill-blank",
      prompt: "Coze 是 ___ 公司出的 Bot 平台，所以原生对接它自家的飞书、抖音、豆包等生态。",
      placeholder: "一家国内大厂",
      accept: ["字节", "字节跳动", "bytedance", "ByteDance"],
      hint: "想想飞书、抖音、豆包是哪家公司的产品？",
      reveal: `**字节跳动**。

这就是为啥 Coze 在国内个人玩家里渗透率高——你做的 Bot **一键就能扔到飞书工作群、豆包对话框、抖音评论区**。

> 反过来说，如果你的目标用户在**微信生态**里（公众号、小程序、企业微信），Coze 的渠道优势就不明显了——这时候选 Dify + 微信对接，或者直接用腾讯系的元器、混元等平台更顺手。`,
    },
    {
      kind: "reveal",
      prompt: "Coze 上有什么好玩的模板可以直接抄？",
      buttonLabel: "揭晓 4 个 Coze 入门模板",
      hidden: `进 Coze 应用商店随便逛逛，下面这几类模板**最适合新人抄一遍**：

1. **塔罗 / 占星 Bot** —— 角色扮演 + 知识库，麻雀虽小五脏俱全
2. **菜谱助手** —— 演示了"挂菜谱知识库 + 多轮对话"
3. **周报 / 日报代笔** —— 演示了"输入结构化信息 + 套模板输出"
4. **吐槽机 / 情感陪聊** —— 演示了"人设 prompt + 长对话记忆"

**怎么抄**：进模板 → 点"复制为我的 Bot" → 改人设 prompt → 改知识库 → 发布。

> 30 分钟就能上线第一个属于自己的 Bot，比你想象中简单。`,
    },
    {
      kind: "celebration",
      title: "Coze 入门！🥟",
      subtitle: "你已经懂了 Dify 和 Coze 的区别。下一关咱们看看怎么把私料挂上去——也就是「知识库」的实战。",
      xp: 50,
      badge: { emoji: "🥟", label: "Coze 启蒙" },
      nextLevelId: "c7-3",
    },
  ],
};

export default level;
