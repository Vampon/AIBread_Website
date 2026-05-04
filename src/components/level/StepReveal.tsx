"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { StepReveal as StepRevealType } from "@/lib/levels";
import { MiniMd } from "@/lib/mini-md";
import { Bubble } from "./Bubble";

export function StepReveal({
  step,
  active,
  onComplete,
}: {
  step: StepRevealType;
  active: boolean;
  onComplete: () => void;
}) {
  const [shown, setShown] = useState(false);

  function reveal() {
    setShown(true);
    onComplete();
  }

  return (
    <Bubble label="想一想" speaker="tutor">
      <p className="text-sm leading-7 text-bread-900/85">{step.prompt}</p>
      {!shown ? (
        <button
          type="button"
          disabled={!active}
          onClick={reveal}
          className="mt-3 inline-flex items-center gap-1 rounded-full border border-bread-300 bg-bread-50 px-4 py-2 text-xs font-medium text-bread-800 transition-all hover:border-bread-500 hover:bg-bread-100 disabled:cursor-not-allowed"
        >
          <Eye className="h-3 w-3" />
          {step.buttonLabel ?? "点击揭晓"}
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-bread-200 bg-bread-50/60 p-3">
          <MiniMd text={step.hidden} />
        </div>
      )}
    </Bubble>
  );
}
