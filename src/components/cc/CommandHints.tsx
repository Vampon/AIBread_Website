"use client";

import { onboardingHints } from "@/data/cc/scenarios";
import { useSimulator, useSubmit } from "./SimulatorContext";

export function CommandHints() {
  const state = useSimulator();
  const submit = useSubmit();
  const disabled = state.isProcessing || !!state.pendingPermission;

  return (
    <div className="px-3 pt-1.5">
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <span className="select-none text-slate-600">try:</span>
        {onboardingHints.map((h) => (
          <button
            key={h.label}
            type="button"
            disabled={disabled}
            onClick={() => submit(h.input)}
            className="rounded border border-slate-800 bg-slate-900/40 px-2 py-0.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {h.label}
          </button>
        ))}
      </div>
    </div>
  );
}
