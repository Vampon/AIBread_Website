"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Loader2, Play } from "lucide-react";

type TodoState = "pending" | "in_progress" | "completed";

const todoTemplate = [
  "读 README 了解项目结构",
  "用 Glob 找到 hero 组件入口",
  "改 hero 文案 + 加新插画",
  "跑 npm run build 确认无类型错",
  "起 dev 服务浏览器对效果",
];

export function TodoWriteVisual() {
  const [states, setStates] = useState<TodoState[]>(
    todoTemplate.map(() => "pending"),
  );
  const [running, setRunning] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, []);

  const play = () => {
    if (running) return;
    setRunning(true);
    setStates(todoTemplate.map(() => "pending"));
    let idx = 0;
    const advance = () => {
      setStates((cur) => {
        const next = [...cur];
        if (idx === 0) {
          next[0] = "in_progress";
        } else if (idx < next.length) {
          next[idx - 1] = "completed";
          next[idx] = "in_progress";
        } else {
          next[next.length - 1] = "completed";
        }
        return next;
      });
      idx++;
      if (idx <= todoTemplate.length) {
        tRef.current = setTimeout(advance, 850);
      } else {
        setRunning(false);
      }
    };
    advance();
  };

  const completed = states.filter((s) => s === "completed").length;
  const inProgress = states.findIndex((s) => s === "in_progress");
  const allDone = completed === todoTemplate.length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          内部 todo（{completed}/{todoTemplate.length}）
        </span>
        <button
          type="button"
          onClick={play}
          disabled={running}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-0.5 text-[10.5px] font-medium text-slate-900 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          <Play className="h-3 w-3" />
          {running ? "跑中" : "播放"}
        </button>
      </div>

      <div className="space-y-1">
        {todoTemplate.map((t, i) => {
          const s = states[i];
          return (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11.5px] transition-colors ${
                s === "in_progress"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
                  : s === "completed"
                  ? "border-slate-800 bg-slate-950/40 text-slate-500 line-through"
                  : "border-slate-800 bg-slate-950/40 text-slate-300"
              }`}
            >
              {s === "completed" ? (
                <CheckCircle2 className="h-3 w-3 flex-none text-emerald-400" />
              ) : s === "in_progress" ? (
                <Loader2 className="h-3 w-3 flex-none animate-spin text-amber-300" />
              ) : (
                <Circle className="h-3 w-3 flex-none text-slate-600" />
              )}
              <span className="flex-1">{t}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-[11px] leading-5 text-slate-400">
        {inProgress >= 0 ? (
          <>
            正在做：<span className="text-amber-200">{todoTemplate[inProgress]}</span>
          </>
        ) : allDone ? (
          <>✓ 全部完成。</>
        ) : (
          <>Claude 接到大任务会自己拆 todo，每完成一项就更新——不忘事、可追踪。</>
        )}
      </div>
    </div>
  );
}
