"use client";

import { useEffect, useRef, useState } from "react";
import { useSimDispatch, useSimulator, useSubmit } from "./SimulatorContext";

const MODE_LABEL: Record<string, string> = {
  default: "default mode",
  acceptEdits: "accept edits on",
  plan: "plan mode on",
  bypass: "bypass permissions",
};

const MODE_ICON: Record<string, string> = {
  default: "›",
  acceptEdits: "⏵⏵",
  plan: "⌖",
  bypass: "⚡",
};

export function InputBar() {
  const state = useSimulator();
  const dispatch = useSimDispatch();
  const submit = useSubmit();
  const [draft, setDraft] = useState("");
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const disabled = state.isProcessing || !!state.pendingPermission;

  // 处理完一轮后聚焦回输入框
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function send() {
    if (disabled) return;
    const t = draft.trim();
    if (!t) return;
    submit(t);
    setDraft("");
    setHistoryIdx(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "ArrowUp") {
      if (state.inputHistory.length === 0) return;
      e.preventDefault();
      const next =
        historyIdx === null
          ? state.inputHistory.length - 1
          : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setDraft(state.inputHistory[next] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      if (historyIdx === null) return;
      e.preventDefault();
      const next = historyIdx + 1;
      if (next >= state.inputHistory.length) {
        setHistoryIdx(null);
        setDraft("");
      } else {
        setHistoryIdx(next);
        setDraft(state.inputHistory[next] ?? "");
      }
    }
  }

  const ctxColor =
    state.tokenUsedPct >= 80
      ? "text-amber-400"
      : state.tokenUsedPct >= 60
      ? "text-amber-300/80"
      : "text-slate-500";

  return (
    <div className="px-3 pb-2.5 pt-1.5">
      <div className="rounded-md border border-slate-700/80 bg-slate-900/40 px-3 py-2 transition-colors focus-within:border-slate-500/80">
        <div className="flex items-center gap-2">
          <span className="select-none font-mono text-[14px] text-slate-500">
            {">"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setHistoryIdx(null);
            }}
            onKeyDown={onKey}
            disabled={disabled}
            placeholder={
              state.pendingPermission
                ? "等你决定权限再继续…"
                : disabled
                ? "Claude is working…"
                : "敲入命令或问题，Enter 发送"
            }
            className="flex-1 bg-transparent font-mono text-[13px] text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between px-1 font-mono text-[10.5px]">
        <div className="flex items-center gap-2.5 text-slate-600">
          <span className="text-slate-500">
            {MODE_ICON[state.permissionMode]} {MODE_LABEL[state.permissionMode]}
          </span>
          <span className="text-slate-700">·</span>
          <span>↑↓ history</span>
          <span className="text-slate-700">·</span>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="transition-colors hover:text-slate-300"
          >
            /clear
          </button>
        </div>
        <div className={`tabular-nums ${ctxColor}`}>
          Context {Math.round(state.tokenUsedPct)}%
        </div>
      </div>
    </div>
  );
}
