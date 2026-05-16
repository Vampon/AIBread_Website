"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  initialState,
  simulatorReducer,
  type Action,
} from "@/lib/cc/simulator";
import { nextDelay, shouldAdvance } from "@/lib/cc/scheduler";
import { parse, resolveScenario } from "@/lib/cc/parser";
import type { SimulatorState } from "@/lib/cc/types";

type Submitter = (text: string) => void;

/** server 端预查的文章 slug → 标题映射，注入给 Explainer 显示"延伸阅读"。 */
export type ArticleMap = Record<string, string>;

const StateCtx = createContext<SimulatorState | null>(null);
const DispatchCtx = createContext<((action: Action) => void) | null>(null);
const SubmitCtx = createContext<Submitter | null>(null);
const ArticleMapCtx = createContext<ArticleMap>({});

export function SimulatorProvider({
  children,
  articleMap,
}: {
  children: React.ReactNode;
  articleMap?: ArticleMap;
}) {
  const [state, dispatch] = useReducer(simulatorReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 单一调度循环：每次 phase 队列变化，决定下一个 ADVANCE_PHASE 的时机。
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!shouldAdvance(state)) return;
    const delay = nextDelay(state);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      dispatch({ type: "ADVANCE_PHASE" });
    }, delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phaseQueue, state.pendingPermission]);

  const submit: Submitter = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // 处理中或等权限时不接受新输入
      if (state.isProcessing || state.pendingPermission) return;
      const result = parse(trimmed);
      const scenario = resolveScenario(result);
      dispatch({ type: "SUBMIT_INPUT", text: trimmed, scenario });
    },
    [state.isProcessing, state.pendingPermission]
  );

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        <SubmitCtx.Provider value={submit}>
          <ArticleMapCtx.Provider value={articleMap ?? {}}>
            {children}
          </ArticleMapCtx.Provider>
        </SubmitCtx.Provider>
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useArticleMap(): ArticleMap {
  return useContext(ArticleMapCtx);
}

export function useSimulator(): SimulatorState {
  const s = useContext(StateCtx);
  if (!s) throw new Error("useSimulator: outside SimulatorProvider");
  return s;
}

export function useSimDispatch() {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("useSimDispatch: outside SimulatorProvider");
  return d;
}

export function useSubmit(): Submitter {
  const s = useContext(SubmitCtx);
  if (!s) throw new Error("useSubmit: outside SimulatorProvider");
  return s;
}
