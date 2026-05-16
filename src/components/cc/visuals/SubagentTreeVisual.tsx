"use client";

import { useState } from "react";
import { Bot, GitBranch, Sparkles } from "lucide-react";

type Sub = {
  id: string;
  label: string;
  task: string;
  tools: string[];
  ctx: number;
};

const SUBS: Sub[] = [
  { id: "s1", label: "scanner", task: "扫 src/ 找所有 TODO", tools: ["Glob", "Grep"], ctx: 14 },
  { id: "s2", label: "tester", task: "跑测试套件并汇报", tools: ["Bash", "Read"], ctx: 22 },
  { id: "s3", label: "reviewer", task: "审查代码风格", tools: ["Read", "Grep"], ctx: 18 },
];

export function SubagentTreeVisual() {
  const [active, setActive] = useState<string>("s1");
  const sub = SUBS.find((s) => s.id === active) ?? SUBS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      {/* 主代理 */}
      <div className="mx-auto mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="font-medium">主代理（你正在对话的）</span>
        <span className="ml-auto rounded bg-emerald-900/40 px-1.5 py-0.5 font-mono text-[10.5px]">
          桌面 35%
        </span>
      </div>

      {/* 连线 */}
      <div className="relative mb-3 px-2">
        <div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-slate-700" />
        <div className="ml-2 mt-3 h-px w-[calc(100%-1rem)] bg-slate-700" />
      </div>

      {/* 子代理们 */}
      <div className="grid grid-cols-3 gap-2">
        {SUBS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
              active === s.id
                ? "border-violet-500/40 bg-violet-500/15 text-violet-200 ring-2 ring-violet-400/20"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px] font-medium">{s.label}</span>
            <span className="rounded bg-slate-950/60 px-1 py-0.5 text-[9.5px] opacity-80">
              桌面 {s.ctx}%
            </span>
          </button>
        ))}
      </div>

      {/* 选中详情 */}
      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-slate-500">
          <GitBranch className="h-3 w-3" />
          子代理 / {sub.label}
        </div>
        <div className="text-[12px] leading-6 text-slate-300">
          任务：{sub.task}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[10.5px]">
          <span className="text-slate-500">允许工具：</span>
          {sub.tools.map((t) => (
            <span
              key={t}
              className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 px-1 text-[10.5px] text-slate-500">
        每个子代理有自己独立的桌面，跑完只把摘要回主代理。
      </div>
    </div>
  );
}
