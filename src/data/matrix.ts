export type NodeKind = "knowledge" | "practice" | "quiz" | "boss";

export type LevelNode = {
  id: string;
  title: string;
  emoji: string;
  /** 1=轻松 2=进阶 3=硬核 */
  difficulty: 1 | 2 | 3;
  /** 节点类型：知识 / 实操 / 测验 / 章节 BOSS */
  kind: NodeKind;
  xp: number;
  /** 是否有可玩的关卡（在 src/data/levels/ 里有对应文件） */
  unlocked: boolean;
};

export type Chapter = {
  id: string;
  /** 视觉主题名（"AI 萌新村" 这种） */
  theme: string;
  title: string;
  subtitle: string;
  /** Tailwind 颜色 token（仅用 color 名字，渲染时拼 class） */
  accent:
    | "amber"
    | "rose"
    | "violet"
    | "sky"
    | "emerald"
    | "indigo"
    | "fuchsia"
    | "teal";
  nodes: LevelNode[];
};

export const chapters: Chapter[] = [
  {
    id: "c1",
    theme: "AI 萌新村",
    title: "第一章 · 认识 AI",
    subtitle: "搞懂 AI 到底是个啥——从神经元到大模型",
    accent: "amber",
    nodes: [
      { id: "c1-1", title: "AI 到底是什么", emoji: "🤖", difficulty: 1, kind: "knowledge", xp: 30, unlocked: true },
      { id: "c1-2", title: "神经网络一小时入门", emoji: "🧠", difficulty: 2, kind: "knowledge", xp: 50, unlocked: true },
      { id: "c1-3", title: "训练 vs 推理：AI 怎么学会的", emoji: "🎓", difficulty: 2, kind: "knowledge", xp: 50, unlocked: true },
      { id: "c1-4", title: "AI 能做什么、不能做什么", emoji: "✅", difficulty: 1, kind: "quiz", xp: 30, unlocked: true },
      { id: "c1-5", title: "BOSS · 新手村结业测", emoji: "👑", difficulty: 2, kind: "boss", xp: 80, unlocked: true },
    ],
  },
  {
    id: "c2",
    theme: "提问练习场",
    title: "第二章 · 玩转大模型",
    subtitle: "学会和 AI 对话——比你想得有讲究",
    accent: "rose",
    nodes: [
      { id: "c2-1", title: "注册和首次对话", emoji: "🔑", difficulty: 1, kind: "practice", xp: 40, unlocked: true },
      { id: "c2-2", title: "联网搜索", emoji: "🔍", difficulty: 1, kind: "knowledge", xp: 35, unlocked: true },
      { id: "c2-3", title: "上下文：AI 的短期记忆", emoji: "🧵", difficulty: 2, kind: "knowledge", xp: 45, unlocked: true },
      { id: "c2-4", title: "上传文件 / 图像理解", emoji: "🖼️", difficulty: 2, kind: "practice", xp: 45, unlocked: true },
      { id: "c2-5", title: "BOSS · 信息检索综合战", emoji: "👑", difficulty: 3, kind: "boss", xp: 100, unlocked: true },
    ],
  },
  {
    id: "c3",
    theme: "提示词修炼场",
    title: "第三章 · 提示词工程",
    subtitle: "同样的 AI，提示词写得好坏差 10 倍效果",
    accent: "violet",
    nodes: [
      { id: "c3-1", title: "4 件套框架", emoji: "🧩", difficulty: 2, kind: "knowledge", xp: 60, unlocked: true },
      { id: "c3-2", title: "身份设定 + 任务拆解", emoji: "🎭", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c3-3", title: "Few-shot：用例子教 AI", emoji: "🪄", difficulty: 2, kind: "practice", xp: 55, unlocked: true },
      { id: "c3-4", title: "思维链 CoT：让 AI 慢慢想", emoji: "🪜", difficulty: 3, kind: "knowledge", xp: 60, unlocked: true },
      { id: "c3-5", title: "迭代调优：从 50 分到 90 分", emoji: "🔁", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c3-6", title: "BOSS · 提示词擂台赛", emoji: "👑", difficulty: 3, kind: "boss", xp: 120, unlocked: true },
    ],
  },
  {
    id: "c4",
    theme: "工具组合厨房",
    title: "第四章 · AI 工具组合拳",
    subtitle: "把 AI 织进你的写作 / 修图 / 表格 / PPT",
    accent: "sky",
    nodes: [
      { id: "c4-1", title: "写作三件套", emoji: "✍️", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c4-2", title: "AI 修图工作流", emoji: "🎨", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c4-3", title: "翻译与润色", emoji: "🌐", difficulty: 1, kind: "practice", xp: 40, unlocked: true },
      { id: "c4-4", title: "AI 做表格 / PPT", emoji: "📊", difficulty: 2, kind: "practice", xp: 55, unlocked: true },
      { id: "c4-5", title: "AI 整理长文 / 笔记", emoji: "🗒️", difficulty: 1, kind: "practice", xp: 40, unlocked: true },
      { id: "c4-6", title: "BOSS · 一周日更挑战", emoji: "👑", difficulty: 3, kind: "boss", xp: 150, unlocked: true },
    ],
  },
  {
    id: "c5",
    theme: "进阶概念实验室",
    title: "第五章 · 大模型新概念",
    subtitle: "RAG / Function Calling / MCP / Agent——一次讲清",
    accent: "emerald",
    nodes: [
      { id: "c5-1", title: "RAG：让 AI 用上你的资料", emoji: "📚", difficulty: 2, kind: "knowledge", xp: 60, unlocked: true },
      { id: "c5-2", title: "Function Calling 一文看懂", emoji: "🔧", difficulty: 2, kind: "knowledge", xp: 60, unlocked: true },
      { id: "c5-3", title: "MCP：AI 的 USB 接口", emoji: "🔌", difficulty: 2, kind: "knowledge", xp: 60, unlocked: true },
      { id: "c5-4", title: "Agent：会自己干活的 AI", emoji: "🤖", difficulty: 3, kind: "knowledge", xp: 70, unlocked: true },
      { id: "c5-5", title: "工作流编排：把 AI 串起来", emoji: "🪢", difficulty: 3, kind: "practice", xp: 70, unlocked: true },
      { id: "c5-6", title: "BOSS · 搭一个会查资料的 Agent", emoji: "👑", difficulty: 3, kind: "boss", xp: 180, unlocked: true },
    ],
  },
  {
    id: "c6",
    theme: "AI 编程战场",
    title: "第六章 · AI 编程实战",
    subtitle: "Claude Code、Cursor，一句话起一个 App",
    accent: "indigo",
    nodes: [
      { id: "c6-1", title: "Claude Code 入门", emoji: "💻", difficulty: 2, kind: "practice", xp: 60, unlocked: true },
      { id: "c6-2", title: "Cursor / Windsurf / Copilot 怎么选", emoji: "⚖️", difficulty: 2, kind: "knowledge", xp: 50, unlocked: true },
      { id: "c6-3", title: "让 AI 帮你写完整项目", emoji: "🏗️", difficulty: 3, kind: "practice", xp: 70, unlocked: true },
      { id: "c6-4", title: "Vibe Coding：一句话起 Web App", emoji: "🎢", difficulty: 3, kind: "practice", xp: 70, unlocked: true },
      { id: "c6-5", title: "BOSS · 上线一个个人小工具", emoji: "👑", difficulty: 3, kind: "boss", xp: 180, unlocked: true },
    ],
  },
  {
    id: "c7",
    theme: "AI 应用工坊",
    title: "第七章 · 搭你自己的 AI 应用",
    subtitle: "Dify / Coze 拖拽即用，不写代码也能上线",
    accent: "fuchsia",
    nodes: [
      { id: "c7-1", title: "Dify：拖拽式 AI 应用", emoji: "🧱", difficulty: 2, kind: "practice", xp: 60, unlocked: true },
      { id: "c7-2", title: "Coze：国内 Bot 平台", emoji: "🥟", difficulty: 1, kind: "practice", xp: 50, unlocked: true },
      { id: "c7-3", title: "知识库 + 检索：把私料挂上去", emoji: "📦", difficulty: 2, kind: "practice", xp: 60, unlocked: true },
      { id: "c7-4", title: "把 Bot 接到微信 / 飞书", emoji: "📱", difficulty: 2, kind: "practice", xp: 60, unlocked: true },
      { id: "c7-5", title: "BOSS · 上线你的第一个 Bot", emoji: "👑", difficulty: 3, kind: "boss", xp: 180, unlocked: true },
    ],
  },
  {
    id: "c8",
    theme: "职场作战部",
    title: "第八章 · 把 AI 用到工作里",
    subtitle: "搬掉日常工作里最费时间的几座小山",
    accent: "teal",
    nodes: [
      { id: "c8-1", title: "搞定周报日报", emoji: "📅", difficulty: 1, kind: "practice", xp: 40, unlocked: true },
      { id: "c8-2", title: "客户邮件回复", emoji: "📧", difficulty: 1, kind: "practice", xp: 40, unlocked: true },
      { id: "c8-3", title: "会议纪要", emoji: "📝", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c8-4", title: "数据汇报", emoji: "📈", difficulty: 2, kind: "practice", xp: 50, unlocked: true },
      { id: "c8-5", title: "BOSS · 搭建个人知识库", emoji: "👑", difficulty: 3, kind: "boss", xp: 150, unlocked: true },
    ],
  },
];

export const matrixStats = {
  totalNodes: chapters.reduce((acc, c) => acc + c.nodes.length, 0),
  unlockedNodes: chapters.reduce(
    (acc, c) => acc + c.nodes.filter((n) => n.unlocked).length,
    0
  ),
  chapters: chapters.length,
  totalXp: chapters.reduce(
    (acc, c) => acc + c.nodes.reduce((a, n) => a + n.xp, 0),
    0
  ),
};

/**
 * 章节主题色 → Tailwind class（边框/背景/文字）。
 * 注意：所有可能用到的 Tailwind class 必须在源码里以字面量出现，
 * 否则 JIT 编译时会被 purge 掉。下面的字典就起这个作用。
 */
export const accentClasses: Record<
  Chapter["accent"],
  { border: string; bg: string; ring: string; text: string; chip: string }
> = {
  amber: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-800",
    chip: "bg-amber-100 text-amber-800",
  },
  rose: {
    border: "border-rose-300",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    text: "text-rose-800",
    chip: "bg-rose-100 text-rose-800",
  },
  violet: {
    border: "border-violet-300",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    text: "text-violet-800",
    chip: "bg-violet-100 text-violet-800",
  },
  sky: {
    border: "border-sky-300",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    text: "text-sky-800",
    chip: "bg-sky-100 text-sky-800",
  },
  emerald: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    text: "text-emerald-800",
    chip: "bg-emerald-100 text-emerald-800",
  },
  indigo: {
    border: "border-indigo-300",
    bg: "bg-indigo-50",
    ring: "ring-indigo-200",
    text: "text-indigo-800",
    chip: "bg-indigo-100 text-indigo-800",
  },
  fuchsia: {
    border: "border-fuchsia-300",
    bg: "bg-fuchsia-50",
    ring: "ring-fuchsia-200",
    text: "text-fuchsia-800",
    chip: "bg-fuchsia-100 text-fuchsia-800",
  },
  teal: {
    border: "border-teal-300",
    bg: "bg-teal-50",
    ring: "ring-teal-200",
    text: "text-teal-800",
    chip: "bg-teal-100 text-teal-800",
  },
};

export const KIND_META: Record<NodeKind, { label: string; icon: string }> = {
  knowledge: { label: "知识关", icon: "📘" },
  practice: { label: "实操关", icon: "🧪" },
  quiz: { label: "测验关", icon: "🎯" },
  boss: { label: "BOSS 关", icon: "👑" },
};
