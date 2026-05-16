"use client";

import { useState } from "react";
import { Brain, Cpu, Keyboard, Wrench } from "lucide-react";

const SAMPLES: Array<{ input: string; route: "slash" | "model"; note: string }> = [
  { input: "/help", route: "slash", note: "直接进分发器，找到 help 内置技能，瞬间执行。" },
  { input: "/compact", route: "slash", note: "找到 compact 技能，触发上下文压缩。" },
  { input: "/init", route: "slash", note: "扫项目并生成 CLAUDE.md，全程模型不参与决策。" },
  { input: "看一下 README", route: "model", note: "进模型推理，模型决定调 Read 工具，再回复。" },
  { input: "帮我删 dist", route: "model", note: "进模型推理，模型决定调 Bash，触发权限弹窗。" },
];

export function SlashRouteVisual() {
  const [idx, setIdx] = useState(0);
  const cur = SAMPLES[idx];
  const isSlash = cur.route === "slash";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-slate-500">
        <Keyboard className="h-3 w-3" />
        点下方输入看分流
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`rounded-full border px-2 py-0.5 font-mono text-[11px] transition-colors ${
              idx === i
                ? "border-amber-400 bg-amber-500/15 text-amber-200"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            {s.input}
          </button>
        ))}
      </div>

      {/* 分流图 */}
      <div className="space-y-1.5">
        <div className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-center font-mono text-[12px] text-slate-200">
          输入：「{cur.input}」
        </div>
        <div className="text-center text-slate-600">↓</div>
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
              isSlash
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 ring-2 ring-emerald-400/20"
                : "border-slate-800 bg-slate-900/40 text-slate-500"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 flex-none" />
            <div className="text-[11px] leading-4">
              <div className="font-medium">命令分发器</div>
              <div className="opacity-70">/ 开头</div>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
              !isSlash
                ? "border-violet-500/40 bg-violet-500/15 text-violet-200 ring-2 ring-violet-400/20"
                : "border-slate-800 bg-slate-900/40 text-slate-500"
            }`}
          >
            <Brain className="h-3.5 w-3.5 flex-none" />
            <div className="text-[11px] leading-4">
              <div className="font-medium">模型推理</div>
              <div className="opacity-70">普通输入</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-slate-950/50 px-3 py-2 text-[11.5px] leading-6 text-slate-300">
          {cur.note}
        </div>
      </div>
      <div className="mt-2 inline-flex items-center gap-1 px-1 text-[10.5px] text-slate-500">
        <Wrench className="h-2.5 w-2.5" />
        slash 命令更快、更可预测；模型推理更灵活。
      </div>
    </div>
  );
}
