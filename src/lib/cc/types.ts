/**
 * 仿真 Claude Code（/cc 栏目）共享类型
 *
 * 这里只放纯类型，不放运行时逻辑，以便 server / client 都能 import。
 */

// ---- 基础 ----------------------------------------------------------------

export type ToolName = "Read" | "Write" | "Edit" | "Bash" | "Glob" | "Grep";

export type PermissionMode = "default" | "acceptEdits" | "plan" | "bypass";

// ---- 虚拟文件系统 --------------------------------------------------------

export type VFsFile = { kind: "file"; name: string; content: string };
export type VFsDir = { kind: "dir"; name: string; children: VFsNode[] };
export type VFsNode = VFsFile | VFsDir;

// ---- 场景里的 phase（脚本指令）-----------------------------------------

export type Phase =
  | { kind: "user-msg"; text: string; delay?: number }
  | { kind: "assistant-thinking"; text: string; delay?: number; explainId?: string }
  | {
      kind: "tool-call";
      tool: ToolName;
      input: Record<string, unknown>;
      /** 工具执行后的输出文本；若不给则走兜底"（执行完毕）" */
      output?: string;
      truncated?: boolean;
      explainId?: string;
      delay?: number;
    }
  | { kind: "assistant-reply"; text: string; delay?: number; explainId?: string }
  | {
      kind: "permission-prompt";
      tool: ToolName;
      reason: string;
      onAllow: Phase[];
      onDeny: Phase[];
      explainId: string;
    }
  | {
      kind: "system-note";
      text: string;
      tone?: "info" | "warn";
      delay?: number;
      explainId?: string;
    }
  | {
      kind: "context-effect";
      before: number;
      after: number;
      summaryText: string;
      explainId: string;
      delay?: number;
    }
  | { kind: "fs-mutation"; op: "create" | "delete"; path: string }
  | {
      kind: "memory-load";
      path: string;
      preview: string;
      explainId: string;
      delay?: number;
    };

// ---- 消息流（messages 数组里的渲染条目）-------------------------------

export type Message =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant-thinking"; text: string; explainId?: string }
  | { id: string; kind: "assistant-reply"; text: string; explainId?: string }
  | {
      id: string;
      kind: "tool-call";
      tool: ToolName;
      input: Record<string, unknown>;
      output?: string;
      truncated?: boolean;
      status: "pending" | "done" | "denied";
      explainId?: string;
    }
  | {
      id: string;
      kind: "system-note";
      text: string;
      tone: "info" | "warn";
      explainId?: string;
    }
  | {
      id: string;
      kind: "permission-record";
      tool: ToolName;
      reason: string;
      resolution: "allow-once" | "allow-session" | "deny";
      explainId: string;
    }
  | {
      id: string;
      kind: "context-effect";
      before: number;
      after: number;
      summaryText: string;
      explainId: string;
    }
  | {
      id: string;
      kind: "memory-load";
      path: string;
      preview: string;
      explainId: string;
    };

// ---- 待决权限请求（中断队列时挂在 state 上）---------------------------

export type PermissionRequest = {
  tool: ToolName;
  reason: string;
  onAllow: Phase[];
  onDeny: Phase[];
  explainId: string;
};

// ---- 场景 ----------------------------------------------------------------

export type Scenario = {
  id: string;
  title: string;
  triggers: { slash?: string[]; keywords?: RegExp[] };
  defaultExplainId: string;
  phases: Phase[];
  /** 进入场景时强制 patch state 的部分字段，常用于 /compact 这种需要先把 token 拉到高位 */
  preset?: { tokenUsedPct?: number };
};

// ---- 仿真器全局状态 ------------------------------------------------------

export type SimulatorState = {
  messages: Message[];
  cwd: string;
  permissionMode: PermissionMode;
  tokenUsedPct: number;
  virtualFs: VFsNode;
  phaseQueue: Phase[];
  pendingPermission: PermissionRequest | null;
  /** 当前正在演示的 phase 提示原理面板看哪张概念卡 */
  explainId: string | null;
  /** 用户点了消息流里某个工具调用 → 锁住面板，优先于 explainId 显示 */
  pinnedExplainId: string | null;
  /** 用户输入历史（↑↓ 翻） */
  inputHistory: string[];
  /** 是否正在演示中（输入框禁用） */
  isProcessing: boolean;
  /** 同一会话已经"永久允许"的工具集合 */
  allowedTools: ToolName[];
};

// ---- 概念卡（原理面板 + 概念索引网格用）-------------------------------

export type ConceptCard = {
  id: string;
  title: string;
  /** 原理面板里展示的 markdown（mini 子集） */
  markdown: string;
  /** 关联博文 slug，按推荐度排序 */
  relatedSlugs: string[];
  /** 是否已实现（false = 概念索引里灰底"v2 解锁"卡） */
  implemented: boolean;
  /** 概念索引网格里的一句话副标题 */
  tagline: string;
  /** 概念索引网格里的 emoji */
  emoji: string;
  /** 可视化组件的 id（在 Explainer 里映射到具体 React 组件，可选） */
  visual?: string;
};

// ---- 解析结果 ------------------------------------------------------------

export type ParseResult =
  | { hit: true; scenario: Scenario }
  | { hit: false; fallback: Scenario };
