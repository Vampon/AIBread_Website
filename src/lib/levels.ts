/**
 * 关卡引擎 · 类型定义
 *
 * 一个关卡 (Level) 是若干 Step 的有序数组。引擎按顺序渲染，每完成一个 Step
 * 才能解锁下一个。新增关卡只需在 src/data/levels/ 下新建一个 .ts 文件，按
 * 这里的格式 export 一个 Level，再去 src/data/levels/index.ts 注册即可。
 *
 * Step 一共 8 种 kind，覆盖讲解 / 选择 / 填空 / 模拟 AI 对话 / 模拟终端 /
 * 模拟画图 / 揭晓答案 / 通关庆祝。每种都是固定格式，照抄即可。
 */

export type StepText = {
  kind: "text";
  speaker?: "tutor" | "user"; // 默认 tutor（面包君左侧气泡）
  markdown: string; // 支持 **粗体** *斜体* `代码` 段落 列表
};

export type QuizOption = {
  id: string;
  label: string;
  correct?: boolean;
  feedback?: string; // 选中后给出的解释（无论对错）
};

export type StepQuiz = {
  kind: "quiz";
  question: string;
  options: QuizOption[];
  explanation?: string; // 答对后展示的总结
  allowMulti?: boolean;
};

export type StepFillBlank = {
  kind: "fill-blank";
  prompt: string; // 题干，可包含 ___ 表示空格位置
  placeholder?: string;
  accept: string[]; // 接受的答案（不区分大小写、忽略首尾空格、子串匹配任一即可）
  hint?: string; // 答错时的提示
  reveal?: string; // 答对后展示的标准答案/解释
};

export type StepPromptInput = {
  kind: "prompt-input";
  /** 顶部气泡里的引导文字 */
  intro: string;
  placeholder?: string;
  /** 给用户参考的几个示例 prompt（点击一键填入） */
  sampleInputs?: string[];
  /** 用户提交后导师给出的回应（按段落） */
  aiReply: string[];
  /** 至少打多少字才能发送 */
  minChars?: number;
  /** 必须包含的关键词（任一）才算通过；不填则任意输入都算通过 */
  expectKeywords?: string[];
  /** 提示词没命中关键词时给的小贴士 */
  miss?: string;
};

export type StepTerminal = {
  kind: "terminal";
  intro?: string;
  cwd?: string; // 提示符前的目录，如 "~/desktop"
  command: string; // 用户要执行的命令
  /** 执行后逐行打印的输出，每条 [文本, 延迟ms] */
  output: Array<{ line: string; delay?: number; tone?: "normal" | "dim" | "ok" | "warn" | "err" }>;
  /** 命令是否需要用户照着敲一遍，否则直接点 ▶ 运行 */
  requireType?: boolean;
};

export type StepImageGen = {
  kind: "image-gen";
  intro?: string;
  promptPlaceholder?: string;
  sampleInputs?: string[];
  /** 进度条动画时长 */
  durationMs?: number;
  resultSrc: string;
  resultAlt: string;
  resultCaption?: string;
};

export type StepReveal = {
  kind: "reveal";
  prompt: string;
  buttonLabel?: string;
  hidden: string; // 揭晓后的 markdown
};

export type StepCelebration = {
  kind: "celebration";
  title: string;
  subtitle?: string;
  xp: number;
  badge?: { emoji: string; label: string };
  nextLevelId?: string;
};

export type LevelStep =
  | StepText
  | StepQuiz
  | StepFillBlank
  | StepPromptInput
  | StepTerminal
  | StepImageGen
  | StepReveal
  | StepCelebration;

export type Level = {
  id: string; // 与 matrix.ts 中的 node.id 对应，如 "c1-1"
  chapterId: string; // "c1"
  title: string;
  emoji: string;
  /** 1=轻松 2=进阶 3=硬核 */
  difficulty: 1 | 2 | 3;
  /** 通关奖励 XP */
  xpReward: number;
  /** 预估耗时（分钟） */
  estimatedMin: number;
  steps: LevelStep[];
};

/** 跳到指定关卡时给 LevelPlayer 用的元信息 */
export type LevelMeta = Pick<
  Level,
  "id" | "chapterId" | "title" | "emoji" | "difficulty" | "xpReward" | "estimatedMin"
>;

export function levelMeta(level: Level): LevelMeta {
  return {
    id: level.id,
    chapterId: level.chapterId,
    title: level.title,
    emoji: level.emoji,
    difficulty: level.difficulty,
    xpReward: level.xpReward,
    estimatedMin: level.estimatedMin,
  };
}
