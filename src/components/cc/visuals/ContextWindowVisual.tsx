"use client";

import { useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";

const TOTAL_CELLS = 50;

export function ContextWindowVisual() {
  const [pct, setPct] = useState(78);
  const [compacted, setCompacted] = useState(false);

  const filledCells = Math.round((pct / 100) * TOTAL_CELLS);
  const isHigh = pct >= 80;
  const isHot = pct >= 60;

  const onCompact = () => {
    setCompacted(true);
    // 动画感：一段延迟后骤降
    setTimeout(() => setPct(22), 500);
  };

  const onFill = () => {
    setCompacted(false);
    setPct(78);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">桌面占用</span>
        <span
          className={`font-mono tabular-nums ${
            isHigh ? "text-amber-300" : isHot ? "text-amber-400/80" : "text-emerald-300"
          }`}
        >
          {pct}%
        </span>
      </div>
      <div className="mb-3 grid grid-cols-25 gap-[2px]" style={{ gridTemplateColumns: `repeat(${TOTAL_CELLS}, 1fr)` }}>
        {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
          const filled = i < filledCells;
          let cls = "bg-slate-800";
          if (filled) {
            cls = isHigh
              ? "bg-amber-400"
              : isHot
              ? "bg-amber-500/70"
              : "bg-emerald-500/80";
          }
          return (
            <div
              key={i}
              className={`h-3 rounded-[1px] transition-colors duration-700 ${cls}`}
            />
          );
        })}
      </div>

      {!compacted && (
        <div className="rounded-lg bg-slate-950/60 p-2 text-[11.5px] leading-6 text-slate-400">
          {isHigh ? (
            <>
              <span className="text-amber-300">⚠ 桌面快满了。</span>
              再加点东西就要吃前面的内容了。点下面按钮压缩一下。
            </>
          ) : (
            <>桌面还宽裕。继续干活。</>
          )}
        </div>
      )}

      {compacted && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-700/30 bg-emerald-900/15 p-2 text-[11.5px] leading-6 text-emerald-200">
          <Sparkles className="mt-0.5 h-3 w-3 flex-none" />
          <span>
            前面 N 轮对话被压成 1 段摘要。从 78% 降到 22%，桌面继续干净。
          </span>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCompact}
          disabled={pct <= 30}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-[11px] font-medium text-slate-900 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDown className="h-3 w-3" />
          /compact
        </button>
        <button
          type="button"
          onClick={onFill}
          className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
        >
          重置
        </button>
      </div>
    </div>
  );
}
