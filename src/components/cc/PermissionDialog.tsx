"use client";

import { useEffect, useState } from "react";
import { useSimDispatch, useSimulator } from "./SimulatorContext";

const OPTIONS = [
  { key: "allow-once" as const, label: "Yes" },
  {
    key: "allow-session" as const,
    label: "Yes, and don't ask again this session",
  },
  { key: "deny" as const, label: "No, deny" },
];

/**
 * 仿真权限询问弹窗 —— 模仿真实 Claude Code 的箭头光标式选单：
 *
 *   ⏺ Bash requires permission
 *     reason text...
 *
 *     ❯ 1. Yes
 *       2. Yes, and don't ask again this session
 *       3. No, deny
 */
export function PermissionDialog() {
  const state = useSimulator();
  const dispatch = useSimDispatch();
  const req = state.pendingPermission;
  const [cursor, setCursor] = useState(0);

  // 不同权限请求出现时，把光标重置到第一项
  useEffect(() => {
    setCursor(0);
  }, [req?.tool, req?.reason]);

  if (!req) return null;

  const decide = (resolution: "allow-once" | "allow-session" | "deny") => {
    dispatch({ type: "RESOLVE_PERMISSION", resolution });
  };

  return (
    <div className="my-1 rounded border border-amber-500/40 bg-amber-500/[0.06] p-3 font-mono text-[12.5px] leading-6">
      <button
        type="button"
        onClick={() =>
          dispatch({ type: "PIN_EXPLAIN", explainId: req.explainId })
        }
        className="block w-full text-left"
        title="把原理面板锁到这一步"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-300">⏺</span>
          <span className="text-amber-200">{req.tool}</span>
          <span className="text-slate-500">requires permission</span>
        </div>
        <div className="ml-5 mt-1 text-[12px] text-slate-300">{req.reason}</div>
      </button>

      <div className="ml-5 mt-2.5 space-y-0.5">
        {OPTIONS.map((opt, i) => {
          const active = cursor === i;
          return (
            <button
              key={opt.key}
              type="button"
              onMouseEnter={() => setCursor(i)}
              onFocus={() => setCursor(i)}
              onClick={() => decide(opt.key)}
              className={`block w-full text-left text-[12.5px] transition-colors ${
                active ? "text-amber-200" : "text-slate-400 hover:text-amber-200"
              }`}
            >
              <span className="inline-block w-4 select-none text-amber-300">
                {active ? "❯" : " "}
              </span>
              <span className="text-slate-500">{i + 1}.</span> {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
