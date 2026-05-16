"use client";

import { useState } from "react";
import { Eye, Edit3, AlertTriangle } from "lucide-react";

const modes = [
  {
    id: "default",
    label: "default",
    desc: "动手前问你。最稳，但啰嗦。",
    icon: AlertTriangle,
    tone: "amber",
    badge: "问你",
  },
  {
    id: "plan",
    label: "plan",
    desc: "只列计划，不真的动手。先想清楚再说。",
    icon: Eye,
    tone: "sky",
    badge: "只列",
  },
  {
    id: "acceptEdits",
    label: "acceptEdits",
    desc: "Edit 全自动放行。前置：git 干净，能 reset。",
    icon: Edit3,
    tone: "emerald",
    badge: "自动改",
  },
];

const planSteps = [
  "扫一遍 src/auth 下文件",
  "提取重复的 token 校验到 hooks/",
  "把 4 个 component 改成新接口",
  "更新对应单测",
  "跑 npm test 确认通过",
];

export function PlanModeVisual() {
  const [modeId, setModeId] = useState("plan");
  const mode = modes.find((m) => m.id === modeId)!;
  const Icon = mode.icon;
  const accentText =
    mode.tone === "amber"
      ? "text-amber-300"
      : mode.tone === "sky"
      ? "text-sky-300"
      : "text-emerald-300";
  const accentIcon =
    mode.tone === "amber"
      ? "text-amber-400"
      : mode.tone === "sky"
      ? "text-sky-400"
      : "text-emerald-400";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 flex gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModeId(m.id)}
            className={`flex-1 rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
              modeId === m.id
                ? "bg-emerald-500/90 text-slate-900"
                : "border border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mb-2.5 rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-400">
        {mode.desc}
      </div>

      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-slate-500">
        AI 给出的计划
      </div>
      <div className="space-y-1">
        {planSteps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-slate-800/80 bg-slate-950/40 px-2 py-1.5 text-[11.5px] text-slate-200"
          >
            <span className="font-mono text-[10.5px] text-slate-600">{i + 1}</span>
            <Icon className={`h-3 w-3 flex-none ${accentIcon}`} />
            <span className="flex-1">{s}</span>
            <span className={`font-mono text-[10px] ${accentText}`}>
              {mode.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
