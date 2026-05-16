"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

type CheckState = "ok" | "fail" | "warn";

const checks: Array<{ id: string; label: string; state: CheckState; detail: string }> = [
  { id: "api", label: "Anthropic API key", state: "ok", detail: "ANTHROPIC_API_KEY 已设置" },
  { id: "model", label: "默认模型连通性", state: "ok", detail: "claude-opus-4-7 响应 320ms" },
  { id: "settings", label: "settings.json 解析", state: "ok", detail: "~/.claude/settings.json 合法" },
  { id: "mcp-notion", label: "MCP server: notion", state: "ok", detail: "search / getPage / appendBlock 已加载" },
  { id: "mcp-github", label: "MCP server: github", state: "fail", detail: "stdio 握手超时（GH_TOKEN 是否过期？）" },
  { id: "claude-md", label: "项目 CLAUDE.md", state: "ok", detail: "找到 ./CLAUDE.md（38 行）" },
  { id: "node", label: "Node 版本", state: "warn", detail: "v18.20.0（推荐 v20+）" },
  { id: "perm", label: "默认权限模式", state: "ok", detail: "default —— 动手前问你" },
];

function StateIcon({ s }: { s: CheckState }) {
  if (s === "ok") return <Check className="h-3 w-3 text-emerald-400" />;
  if (s === "fail") return <X className="h-3 w-3 text-rose-400" />;
  return <AlertTriangle className="h-3 w-3 text-amber-400" />;
}

export function DoctorCheckVisual() {
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(checks.length);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, []);

  const run = () => {
    if (running) return;
    setRunning(true);
    setRevealed(0);
    let i = 0;
    const tick = () => {
      i++;
      setRevealed(i);
      if (i < checks.length) {
        tRef.current = setTimeout(tick, 220);
      } else {
        setRunning(false);
      }
    };
    tRef.current = setTimeout(tick, 200);
  };

  const slice = checks.slice(0, revealed);
  const ok = slice.filter((c) => c.state === "ok").length;
  const fail = slice.filter((c) => c.state === "fail").length;
  const warn = slice.filter((c) => c.state === "warn").length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          环境诊断（{revealed}/{checks.length}）
        </span>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-0.5 text-[10.5px] font-medium text-slate-900 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {running ? "扫描中" : "重新诊断"}
        </button>
      </div>

      <div className="mb-2 flex gap-2 font-mono text-[10.5px]">
        <span className="text-emerald-300">✓ {ok}</span>
        <span className="text-rose-300">✗ {fail}</span>
        <span className="text-amber-300">⚠ {warn}</span>
      </div>

      <div className="space-y-1">
        {slice.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2 rounded-md border border-slate-800/80 bg-slate-950/40 px-2 py-1.5"
          >
            <div className="mt-0.5 flex-none">
              <StateIcon s={c.state} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] text-slate-200">{c.label}</div>
              <div className="truncate text-[10.5px] text-slate-500">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
