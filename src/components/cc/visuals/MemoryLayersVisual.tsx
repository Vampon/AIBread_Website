"use client";

import { useState } from "react";
import { Briefcase, Building2, FileText, User } from "lucide-react";

const LAYERS = [
  {
    id: "project",
    label: "项目级",
    path: "./CLAUDE.md",
    Icon: FileText,
    priority: 1,
    color: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    sample: "本项目用 Next.js 15。dev 命令是 npm run dev。\n不要改 dist/ 目录。",
  },
  {
    id: "user",
    label: "用户级",
    path: "~/.claude/CLAUDE.md",
    Icon: User,
    priority: 2,
    color: "border-sky-500/40 bg-sky-500/10 text-sky-200",
    sample: "我习惯 tab 缩进 2 格。\n中文回复优先，不要使用「正在」之类的进行时。",
  },
  {
    id: "enterprise",
    label: "企业级",
    path: "(IT 部署)",
    Icon: Building2,
    priority: 3,
    color: "border-violet-500/40 bg-violet-500/10 text-violet-200",
    sample: "公司全员：禁止把代码贴到外部 LLM。\n敏感信息一律走内网检索。",
  },
];

export function MemoryLayersVisual() {
  const [active, setActive] = useState<string>("project");
  const layer = LAYERS.find((l) => l.id === active) ?? LAYERS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-3 space-y-1.5">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${
              active === l.id
                ? l.color
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <l.Icon className="h-3.5 w-3.5 flex-none" />
            <span className="text-[12px] font-medium">{l.label}</span>
            <span className="ml-auto font-mono text-[10.5px] opacity-70">
              {l.path}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[9.5px] ${
                active === l.id
                  ? "border-current opacity-90"
                  : "border-slate-700 text-slate-500"
              }`}
            >
              优先级 {l.priority}
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-slate-500">
          <Briefcase className="h-3 w-3" />
          {layer.label}内容样例
        </div>
        <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-6 text-slate-300">
          {layer.sample}
        </pre>
      </div>
      <div className="mt-2 px-1 text-[11px] leading-5 text-slate-500">
        三层叠加注入；冲突时**项目级**先生效。
      </div>
    </div>
  );
}
