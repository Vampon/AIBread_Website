/**
 * phase queue 调度器（纯函数）。
 * Provider 的 useEffect 用 shouldAdvance + nextDelay 决定 setTimeout 多久后 dispatch ADVANCE_PHASE。
 */

import type { Phase, SimulatorState } from "./types";

export function shouldAdvance(state: SimulatorState): boolean {
  return state.phaseQueue.length > 0 && state.pendingPermission === null;
}

export function nextDelay(state: SimulatorState): number {
  const next = state.phaseQueue[0];
  if (!next) return 0;
  return getDelay(next);
}

function getDelay(phase: Phase): number {
  switch (phase.kind) {
    case "user-msg":
      return phase.delay ?? 0;
    case "assistant-thinking":
      return phase.delay ?? 600;
    case "tool-call":
      return phase.delay ?? 800;
    case "assistant-reply":
      return phase.delay ?? 700;
    case "permission-prompt":
      return 600;
    case "system-note":
      return phase.delay ?? 500;
    case "context-effect":
      return phase.delay ?? 900;
    case "fs-mutation":
      return 0;
    case "memory-load":
      return phase.delay ?? 800;
  }
}
