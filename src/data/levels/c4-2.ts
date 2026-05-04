import type { Level } from "@/lib/levels";

const level: Level = {
  id: "c4-2",
  chapterId: "c4",
  title: "AI 修图工作流",
  emoji: "🎨",
  difficulty: 2,
  xpReward: 50,
  estimatedMin: 11,
  steps: [
    {
      kind: "text",
      markdown: `想要一张能用的成品图，**单靠一个 AI 工具几乎办不到**。

业内的常规做法是三步流水线：**出图 → 局部修 → 放大去瑕疵**。每一步交给最擅长那件事的工具。

这一关把这条流水线讲清楚，下次你做小红书封面 / 公众号头图就不用瞎试了。`,
    },
    {
      kind: "text",
      markdown: `**第一步：出图（从无到有）**

主流三家：
- **Midjourney**（米家）—— 美感最强，画风统一，适合海报封面
- **Flux**（开源派）—— 真实感最好，能塞进可控工作流
- **即梦 / 豆包画图** —— 中文 prompt 友好，国内能直接用`,
    },
    {
      kind: "text",
      markdown: `出图最关键的是 **prompt 四件套**：**主体 + 风格 + 构图 + 光影**。

少一件，AI 就开始自由发挥。比如只写"一杯咖啡"，它给你的图大概率不能用；
但写"一杯拿铁特写（主体）+ 复古油画风（风格）+ 俯视 45 度（构图）+ 暖黄逆光（光影）"，命中率就高得多。`,
    },
    {
      kind: "image-gen",
      intro:
        "试一下：用「主体+风格+构图+光影」四件套写一句 prompt，给一家烘焙店出张主图。",
      promptPlaceholder: "一颗刚出炉的可颂特写，复古油画风，俯视 45 度构图，暖黄逆光",
      sampleInputs: [
        "一颗刚出炉的可颂特写，复古油画风，俯视 45 度构图，暖黄逆光",
        "木质操作台上的酸面包，杂志摄影风，中景平视，自然侧光",
        "面粉飞扬的瞬间手部特写，电影感胶片风，低角度仰拍，柔光",
      ],
      durationMs: 2400,
      resultSrc: "/placeholders/cover-3.svg",
      resultAlt: "AI 出图演示",
      resultCaption: "（演示用占位图，真实场景里这一步由 Midjourney / Flux / 即梦完成）",
    },
    {
      kind: "text",
      markdown: `**第二步：局部修图（改一处不动其他）**

出图常常 80 分——构图喜欢，但右下角多了个怪东西、脸有点歪。重出一张？多半就跑题了。

这时候用 **Photoshop AI（生成式填充）** 或 **Krea** 这类工具：圈出要改的地方，描述一句"换成一束麦穗"，它只动那一块。`,
    },
    {
      kind: "text",
      markdown: `**第三步：放大 / 去瑕疵（最后打磨）**

AI 出图默认分辨率不够印刷、也不够当大屏壁纸。

- **Topaz**（拓扑斯）—— 老牌放大工具，把 1024px 拉到 4K 不糊
- **Magnific**（魔放）—— 一边放大一边补细节，像给图重新上釉

到这一步，图才算真正"能交付"。`,
    },
    {
      kind: "quiz",
      question: "你出了一张可颂图，主体很满意但右下角多了一只奇怪的手，下一步该用？",
      options: [
        {
          id: "a",
          label: "重新让 Midjourney 再出一张",
          correct: false,
          feedback: "重出大概率换了个构图，前面满意的部分也没了。",
        },
        {
          id: "b",
          label: "用 Photoshop AI / Krea 圈出那只手，让它改成别的",
          correct: true,
          feedback: "对！局部修图工具就是干这个的。",
        },
        {
          id: "c",
          label: "直接交付，让客户自己 P 掉",
          correct: false,
          feedback: "你是流水线的厂长，质量你负责。",
        },
        {
          id: "d",
          label: "先用 Topaz 放大",
          correct: false,
          feedback: "放大是最后一步——瑕疵会跟着一起被放大。",
        },
      ],
      explanation:
        "记住顺序：**出图 → 局部修 → 放大**。顺序错了，前一步的成果就白费。",
    },
    {
      kind: "fill-blank",
      prompt: "出图 prompt 四件套是：主体 + 风格 + 构图 + ___",
      placeholder: "决定氛围的关键",
      accept: ["光影", "光线", "灯光", "光"],
      hint: "决定一张图氛围的最后一件——白天傍晚、顺光逆光…",
      reveal: `**光影**。同一个主体在不同光下完全是两张图。

新手最容易丢的就是这一件——结果出来的图总有种"塑料感"，正是因为光没说清楚。`,
    },
    {
      kind: "reveal",
      prompt: "想看一份「懒人 prompt 模板」吗？点开看",
      buttonLabel: "揭晓模板",
      hidden: `**通用四件套模板**：

> 「\\[主体\\]，\\[风格\\]，\\[构图角度\\]，\\[光影描述\\]，--ar 3:4」

举例：
> 「一只柴犬叼着法棍，吉卜力动画风，正面中景，清晨柔光，--ar 3:4」

记不住别的，记住这一句就够 90% 场景用了。`,
    },
    {
      kind: "celebration",
      title: "修图流水线打通！🎨",
      subtitle:
        "记住：出图→局部修→放大，三步走。下次别再死磕一个工具了。",
      xp: 50,
      badge: { emoji: "🎨", label: "AI 修图三步曲" },
      nextLevelId: "c4-3",
    },
  ],
};

export default level;
