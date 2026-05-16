/**
 * 仿真器状态机：reducer + initialState + Action 类型。
 *
 * 调度规则：
 * - SUBMIT_INPUT：把用户输入加入消息流 + scenario.phases 入队 + 标记 isProcessing
 * - ADVANCE_PHASE：弹出队首 phase → 转成 Message + 处理副作用（fs / token） → 队列清空时 isProcessing=false
 * - permission-prompt phase 命中时调度暂停，挂上 pendingPermission，等 RESOLVE_PERMISSION
 * - RESOLVE_PERMISSION：把 onAllow / onDeny 子序列推到队首，继续推进
 *
 * 上层（SimulatorContext.tsx）的 useEffect 监视 phaseQueue + pendingPermission，
 * 用 setTimeout 按 phase 自带 delay 串行 dispatch ADVANCE_PHASE。
 */

import { initialVirtualFs, removePath } from "./virtualFs";
import type {
  SimulatorState,
  Message,
  Phase,
  Scenario,
} from "./types";

// ---- id 生成 -----------------------------------------------------------

let _nextId = 0;
function makeId() {
  _nextId += 1;
  return `m-${_nextId}`;
}

// ---- 初始状态 ----------------------------------------------------------

export const initialState: SimulatorState = {
  messages: [],
  cwd: "~/my-tool",
  permissionMode: "default",
  tokenUsedPct: 8,
  virtualFs: initialVirtualFs,
  phaseQueue: [],
  pendingPermission: null,
  explainId: null,
  pinnedExplainId: null,
  inputHistory: [],
  isProcessing: false,
  allowedTools: [],
};

// ---- Action 类型 -------------------------------------------------------

export type Action =
  | { type: "SUBMIT_INPUT"; text: string; scenario: Scenario }
  | { type: "ADVANCE_PHASE" }
  | {
      type: "RESOLVE_PERMISSION";
      resolution: "allow-once" | "allow-session" | "deny";
    }
  | { type: "PIN_EXPLAIN"; explainId: string }
  | { type: "UNPIN_EXPLAIN" }
  | { type: "RESET" };

// ---- reducer -----------------------------------------------------------

export function simulatorReducer(
  state: SimulatorState,
  action: Action
): SimulatorState {
  switch (action.type) {
    case "SUBMIT_INPUT": {
      const userMsg: Message = {
        id: makeId(),
        kind: "user",
        text: action.text,
      };
      const presetToken = action.scenario.preset?.tokenUsedPct;
      const last = state.inputHistory[state.inputHistory.length - 1];
      return {
        ...state,
        messages: [...state.messages, userMsg],
        phaseQueue: [...action.scenario.phases],
        explainId: action.scenario.defaultExplainId,
        pinnedExplainId: null,
        isProcessing: action.scenario.phases.length > 0,
        inputHistory:
          last === action.text
            ? state.inputHistory
            : [...state.inputHistory, action.text],
        tokenUsedPct: presetToken !== undefined ? presetToken : state.tokenUsedPct,
      };
    }

    case "ADVANCE_PHASE": {
      if (state.phaseQueue.length === 0) {
        return state.isProcessing ? { ...state, isProcessing: false } : state;
      }
      const [phase, ...rest] = state.phaseQueue;
      return applyPhase(state, phase, rest);
    }

    case "RESOLVE_PERMISSION": {
      if (!state.pendingPermission) return state;
      const req = state.pendingPermission;
      const followUp =
        action.resolution === "deny" ? req.onDeny : req.onAllow;
      const record: Message = {
        id: makeId(),
        kind: "permission-record",
        tool: req.tool,
        reason: req.reason,
        resolution: action.resolution,
        explainId: req.explainId,
      };
      const newAllowed =
        action.resolution === "allow-session" &&
        !state.allowedTools.includes(req.tool)
          ? [...state.allowedTools, req.tool]
          : state.allowedTools;
      return {
        ...state,
        messages: [...state.messages, record],
        pendingPermission: null,
        phaseQueue: [...followUp, ...state.phaseQueue],
        allowedTools: newAllowed,
        isProcessing: followUp.length > 0 || state.phaseQueue.length > 0,
      };
    }

    case "PIN_EXPLAIN":
      return { ...state, pinnedExplainId: action.explainId };

    case "UNPIN_EXPLAIN":
      return { ...state, pinnedExplainId: null };

    case "RESET":
      return {
        ...initialState,
        virtualFs: initialVirtualFs,
      };
  }
}

// ---- phase → state transition --------------------------------------

function applyPhase(
  state: SimulatorState,
  phase: Phase,
  rest: Phase[]
): SimulatorState {
  // explainId 沿用：phase 自带 → phase 自带；否则保留旧值
  const phaseExplain = "explainId" in phase ? phase.explainId : undefined;
  const baseExplain = phaseExplain ?? state.explainId;
  const isProcessing = rest.length > 0;

  switch (phase.kind) {
    case "user-msg": {
      const msg: Message = { id: makeId(), kind: "user", text: phase.text };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        isProcessing,
      };
    }

    case "assistant-thinking": {
      const msg: Message = {
        id: makeId(),
        kind: "assistant-thinking",
        text: phase.text,
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        tokenUsedPct: bump(state.tokenUsedPct, 1),
        isProcessing,
      };
    }

    case "tool-call": {
      const msg: Message = {
        id: makeId(),
        kind: "tool-call",
        tool: phase.tool,
        input: phase.input,
        output: phase.output,
        truncated: phase.truncated,
        status: "done",
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        tokenUsedPct: bump(state.tokenUsedPct, 3),
        isProcessing,
      };
    }

    case "assistant-reply": {
      const msg: Message = {
        id: makeId(),
        kind: "assistant-reply",
        text: phase.text,
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        tokenUsedPct: bump(state.tokenUsedPct, 2),
        isProcessing,
      };
    }

    case "permission-prompt": {
      // 暂停队列，挂起待决权限
      return {
        ...state,
        pendingPermission: {
          tool: phase.tool,
          reason: phase.reason,
          onAllow: phase.onAllow,
          onDeny: phase.onDeny,
          explainId: phase.explainId,
        },
        phaseQueue: rest,
        explainId: phase.explainId,
        isProcessing: false,
      };
    }

    case "system-note": {
      const msg: Message = {
        id: makeId(),
        kind: "system-note",
        text: phase.text,
        tone: phase.tone ?? "info",
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        isProcessing,
      };
    }

    case "context-effect": {
      const msg: Message = {
        id: makeId(),
        kind: "context-effect",
        before: phase.before,
        after: phase.after,
        summaryText: phase.summaryText,
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        tokenUsedPct: phase.after,
        isProcessing,
      };
    }

    case "fs-mutation": {
      const newFs =
        phase.op === "delete" ? removePath(state.virtualFs, phase.path) : state.virtualFs;
      return {
        ...state,
        virtualFs: newFs,
        phaseQueue: rest,
        // explainId 不变（fs-mutation 是无声操作）
        isProcessing,
      };
    }

    case "memory-load": {
      const msg: Message = {
        id: makeId(),
        kind: "memory-load",
        path: phase.path,
        preview: phase.preview,
        explainId: phase.explainId,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        phaseQueue: rest,
        explainId: baseExplain,
        isProcessing,
      };
    }
  }
}

function bump(current: number, delta: number): number {
  return Math.min(95, Math.max(0, current + delta));
}
