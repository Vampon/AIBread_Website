"use client";

import { useState } from "react";
import { Eye, FileEdit, Pencil, Search, Terminal, Wrench } from "lucide-react";

type State = "allow" | "ask" | "deny";

type Tool = {
  name: string;
  Icon: typeof Eye;
  level: "read" | "write" | "exec";
  default: State;
  why: string;
};

const TOOLS: Tool[] = [
  { name: "Read", Icon: Eye, level: "read", default: "allow", why: "只读文件，不会改环境" },
  { name: "Glob", Icon: Search, level: "read", default: "allow", why: "只列文件" },
  { name: "Grep", Icon: Search, level: "read", default: "allow", why: "只搜索内容" },
  { name: "Edit", Icon: Pencil, level: "write", default: "ask", why: "改已有文件，先问你" },
  { name: "Write", Icon: FileEdit, level: "write", default: "ask", why: "新建文件，先问你" },
  { name: "Bash", Icon: Terminal, level: "exec", default: "ask", why: "执行命令，最危险" },
];

const STATE_META: Record<State, { color: string; label: string; dot: string }> = {
  allow: { color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", label: "自动放行", dot: "bg-emerald-400" },
  ask: { color: "border-amber-500/40 bg-amber-500/10 text-amber-300", label: "弹窗确认", dot: "bg-amber-400" },
  deny: { color: "border-rose-500/40 bg-rose-500/10 text-rose-300", label: "永久拒绝", dot: "bg-rose-400" },
};

const ORDER: State[] = ["allow", "ask", "deny"];

export function PermissionVisual() {
  const [states, setStates] = useState<Record<string, State>>(() =>
    Object.fromEntries(TOOLS.map((t) => [t.name, t.default]))
  );

  const cycle = (name: string) => {
    setStates((s) => {
      const cur = s[name];
      const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
      return { ...s, [name]: next };
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 text-[10.5px] uppercase tracking-wider text-slate-500">
        点工具切换权限：放行 → 问 → 拒绝
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => {
          const st = states[t.name];
          const meta = STATE_META[st];
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => cycle(t.name)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${meta.color}`}
              title={t.why}
            >
              <t.Icon className="h-3.5 w-3.5 flex-none" />
              <span className="font-mono text-[12px] font-medium">{t.name}</span>
              <span className="ml-auto flex items-center gap-1.5 text-[10.5px]">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-slate-950/50 px-3 py-2 text-[11.5px] leading-6 text-slate-400">
        默认配置：只读工具放行，会改环境的弹窗。可以在
        <code className="mx-1 rounded bg-slate-800 px-1 text-amber-200">settings.json</code>
        里固化白名单。
      </div>
    </div>
  );
}
