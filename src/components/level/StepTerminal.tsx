"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Terminal as TerminalIcon } from "lucide-react";
import type { StepTerminal as StepTerminalType } from "@/lib/levels";

const TONE_COLOR: Record<string, string> = {
  normal: "text-emerald-200",
  dim: "text-emerald-400/60",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  err: "text-rose-300",
};

export function StepTerminal({
  step,
  active,
  onComplete,
}: {
  step: StepTerminalType;
  active: boolean;
  onComplete: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const cwd = step.cwd ?? "~/aibread";
  const requireType = step.requireType ?? false;
  const ready = requireType ? typed.trim() === step.command.trim() : true;
  const containerRef = useRef<HTMLDivElement>(null);

  function run() {
    if (!ready || running || done) return;
    setRunning(true);
    setShown(0);
  }

  useEffect(() => {
    if (!running) return;
    if (shown >= step.output.length) {
      setRunning(false);
      setDone(true);
      onComplete();
      return;
    }
    const delay = step.output[shown]?.delay ?? 350;
    const t = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [running, shown, step.output, onComplete]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  }, [shown]);

  return (
    <div className="rounded-2xl border border-bread-200 bg-bread-50/50 p-4">
      {step.intro && (
        <p className="mb-3 text-sm text-bread-900/85">{step.intro}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-bread-900/30 bg-[#1F1611] shadow-inner">
        <div className="flex items-center gap-2 border-b border-white/5 bg-black/30 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-200/60">
            <TerminalIcon className="h-3 w-3" />
            terminal — {cwd}
          </span>
        </div>
        <div
          ref={containerRef}
          className="max-h-72 overflow-auto p-4 font-mono text-[13px] leading-6"
        >
          <div className="flex items-center gap-2 text-emerald-200">
            <span className="text-bread-300">{cwd}</span>
            <span className="text-emerald-400">$</span>
            {requireType && !running && !done ? (
              <input
                type="text"
                value={typed}
                disabled={!active}
                placeholder={`照着敲：${step.command}`}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && ready) run();
                }}
                className="flex-1 bg-transparent text-emerald-100 outline-none placeholder:text-emerald-200/30"
                autoCorrect="off"
                spellCheck={false}
              />
            ) : (
              <span className="text-emerald-100">
                {requireType ? typed : step.command}
              </span>
            )}
          </div>

          {(running || done) &&
            step.output.slice(0, shown).map((o, i) => (
              <div key={i} className={TONE_COLOR[o.tone ?? "normal"]}>
                {o.line || " "}
              </div>
            ))}
          {running && shown < step.output.length && (
            <span className="mt-1 inline-block h-3 w-2 animate-pulse bg-emerald-300" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-bread-900/60">
        <span>
          {done
            ? "命令执行完毕 ✓"
            : requireType
            ? ready
              ? "命令对了，回车或点 ▶ 运行"
              : "把上面那行命令一字不差敲进去"
            : "点 ▶ 直接运行"}
        </span>
        <button
          type="button"
          disabled={!active || !ready || running || done}
          onClick={run}
          className="inline-flex items-center gap-1 rounded-full bg-bread-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:bg-bread-600 disabled:cursor-not-allowed disabled:bg-bread-200"
        >
          <Play className="h-3 w-3" />
          {running ? "运行中…" : done ? "已运行" : "运行"}
        </button>
      </div>
    </div>
  );
}
