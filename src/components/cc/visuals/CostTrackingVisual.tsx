"use client";

import { useState } from "react";
import { Database, RefreshCw, Plus } from "lucide-react";

const baseInput = 12450;
const baseOutput = 3200;
const baseCache = 8900;

function formatTok(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

export function CostTrackingVisual() {
  const [input, setInput] = useState(baseInput);
  const [output, setOutput] = useState(baseOutput);
  const [cache, setCache] = useState(baseCache);

  const fresh = input - cache;
  const inputCost = (fresh * 3 + cache * 0.3) / 1_000_000;
  const outputCost = (output * 15) / 1_000_000;
  const total = inputCost + outputCost;
  const noCacheCost = (input * 3 + output * 15) / 1_000_000;
  const saved = noCacheCost - total;

  const cacheHit = Math.round((cache / Math.max(input, 1)) * 100);
  const max = Math.max(input, output, cache, 1);

  const next = () => {
    setInput((x) => x + 1500);
    setOutput((x) => x + 400);
    setCache((x) => x + 1300);
  };
  const reset = () => {
    setInput(baseInput);
    setOutput(baseOutput);
    setCache(baseCache);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] text-slate-400">本次会话花费</span>
        <span className="font-mono text-[18px] font-semibold tabular-nums text-emerald-300">
          ${total.toFixed(4)}
        </span>
      </div>

      <div className="space-y-1.5">
        {[
          {
            label: "input tokens（新进入）",
            v: fresh,
            color: "bg-sky-400",
          },
          {
            label: "output tokens",
            v: output,
            color: "bg-purple-400",
          },
          {
            label: "cache hit（缓存复用）",
            v: cache,
            color: "bg-emerald-400",
          },
        ].map((row) => (
          <div key={row.label} className="space-y-0.5">
            <div className="flex justify-between text-[10.5px]">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-mono tabular-nums text-slate-300">
                {formatTok(row.v)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full ${row.color} transition-all duration-500`}
                style={{ width: `${(row.v / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-900/15 px-2.5 py-1.5 text-[11px] text-emerald-200">
        <Database className="h-3 w-3 flex-none" />
        <span>
          缓存命中 <span className="font-mono">{cacheHit}%</span> → 比不缓存省了{" "}
          <span className="font-mono">${saved.toFixed(4)}</span>
        </span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-[11px] font-medium text-slate-900 hover:bg-emerald-400"
        >
          <Plus className="h-3 w-3" />
          再聊一轮
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
        >
          <RefreshCw className="h-3 w-3" />
          重置
        </button>
      </div>
    </div>
  );
}
