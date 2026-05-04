"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { StepFillBlank as StepFillBlankType } from "@/lib/levels";
import { MiniMd } from "@/lib/mini-md";
import { Bubble } from "./Bubble";

export function StepFillBlank({
  step,
  active,
  onComplete,
}: {
  step: StepFillBlankType;
  active: boolean;
  onComplete: () => void;
}) {
  const [val, setVal] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  function check() {
    const v = val.trim().toLowerCase();
    if (!v) return;
    setTried(true);
    const ok = step.accept.some((a) => v.includes(a.trim().toLowerCase()));
    if (ok) {
      setDone(true);
      onComplete();
    }
  }

  return (
    <Bubble label="填空题" speaker="tutor">
      <p className="font-medium text-bread-900">{step.prompt}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={val}
          disabled={!active || done}
          placeholder={step.placeholder ?? "在这里输入答案…"}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
          className="w-full rounded-xl border border-bread-200 bg-white px-4 py-2 text-sm outline-none transition-colors placeholder:text-bread-900/40 focus:border-bread-500 disabled:bg-bread-50/50"
        />
        <button
          type="button"
          disabled={!active || done || val.trim().length === 0}
          onClick={check}
          className="shrink-0 rounded-full bg-bread-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-bread-600 disabled:cursor-not-allowed disabled:bg-bread-200"
        >
          {done ? "已通过" : "提交"}
        </button>
      </div>
      {tried && !done && step.hint && (
        <p className="mt-2 text-xs text-rose-600">提示：{step.hint}</p>
      )}
      {done && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">答得不错！</div>
            {step.reveal && <MiniMd text={step.reveal} className="mt-1 !text-emerald-900" />}
          </div>
        </div>
      )}
    </Bubble>
  );
}
