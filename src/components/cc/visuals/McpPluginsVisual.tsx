"use client";

import { useState } from "react";
import { Database, FileCode, Github, Plug, Sparkles } from "lucide-react";

type Server = {
  id: string;
  name: string;
  Icon: typeof Database;
  tools: string[];
  builtin?: boolean;
};

const SERVERS: Server[] = [
  {
    id: "builtin",
    name: "Claude Code 内置",
    Icon: FileCode,
    tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    builtin: true,
  },
  {
    id: "notion",
    name: "Notion",
    Icon: Sparkles,
    tools: ["search", "getPage", "createPage", "appendBlock"],
  },
  {
    id: "github",
    name: "GitHub",
    Icon: Github,
    tools: ["createPR", "listIssues", "getDiff", "comment"],
  },
  {
    id: "postgres",
    name: "Postgres",
    Icon: Database,
    tools: ["query", "describe", "listTables"],
  },
];

export function McpPluginsVisual() {
  const [active, setActive] = useState<string>("notion");
  const server = SERVERS.find((s) => s.id === active) ?? SERVERS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 text-[10.5px] uppercase tracking-wider text-slate-500">
        点 server 看它接进来的工具
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SERVERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
              active === s.id
                ? s.builtin
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 ring-2 ring-emerald-400/20"
                  : "border-sky-500/40 bg-sky-500/10 text-sky-200 ring-2 ring-sky-400/20"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <s.Icon className="h-3.5 w-3.5 flex-none" />
            <div className="text-[12px]">
              <div className="font-medium">{s.name}</div>
              <div className="text-[10px] opacity-70">{s.tools.length} 个工具</div>
            </div>
          </button>
        ))}
      </div>

      <div className="my-2 flex items-center justify-center gap-1 text-[10.5px] text-slate-500">
        <Plug className="h-3 w-3" />
        通过 MCP 协议握手，工具进入模型菜单
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] text-slate-300">
          <server.Icon className="h-3 w-3" />
          <span className="font-medium">{server.name}</span>
          <span className="ml-auto text-[10px] text-slate-500">→ 模型工具列表</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {server.tools.map((t) => (
            <span
              key={t}
              className={`rounded font-mono text-[10.5px] ${
                server.builtin
                  ? "border border-emerald-700/40 bg-emerald-900/20 px-1.5 py-0.5 text-emerald-200"
                  : "border border-sky-700/40 bg-sky-900/20 px-1.5 py-0.5 text-sky-200"
              }`}
            >
              {server.builtin ? t : `${server.id}.${t}`}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 px-1 text-[10.5px] text-slate-500">
        对模型来说没区别——它都是工具。装多少 MCP，就有多少能力。
      </div>
    </div>
  );
}
