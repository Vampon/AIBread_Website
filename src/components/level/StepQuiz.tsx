"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { StepQuiz as StepQuizType } from "@/lib/levels";
import { MiniMd } from "@/lib/mini-md";
import { Bubble } from "./Bubble";

export function StepQuiz({
  step,
  active,
  onComplete,
}: {
  step: StepQuizType;
  active: boolean;
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = (id: string) => step.options.find((o) => o.id === id)?.correct;
  const allCorrect =
    submitted &&
    picked.length > 0 &&
    picked.every(isCorrect) &&
    step.options.filter((o) => o.correct).every((o) => picked.includes(o.id));

  function handlePick(id: string) {
    if (submitted) return;
    if (step.allowMulti) {
      setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    } else {
      setPicked([id]);
      setTimeout(() => {
        setSubmitted(true);
        if (step.options.find((o) => o.id === id)?.correct) onComplete();
      }, 200);
    }
  }

  function handleMultiSubmit() {
    setSubmitted(true);
    const ok =
      picked.every(isCorrect) &&
      step.options.filter((o) => o.correct).every((o) => picked.includes(o.id));
    if (ok) onComplete();
  }

  function reset() {
    setPicked([]);
    setSubmitted(false);
  }

  return (
    <Bubble label="小测验" speaker="tutor">
      <p className="font-semibold text-bread-900">{step.question}</p>
      <div className="mt-3 flex flex-col gap-2">
        {step.options.map((opt) => {
          const chosen = picked.includes(opt.id);
          let style =
            "border-bread-200 bg-bread-50/50 text-bread-900 hover:border-bread-400 hover:bg-bread-50";
          if (submitted && chosen && opt.correct)
            style = "border-emerald-400 bg-emerald-50 text-emerald-900";
          else if (submitted && chosen && !opt.correct)
            style = "border-rose-400 bg-rose-50 text-rose-900";
          else if (submitted && !chosen && opt.correct)
            style = "border-emerald-200 bg-emerald-50/40 text-emerald-800";
          else if (chosen && !submitted)
            style = "border-bread-500 bg-bread-100 text-bread-900";

          return (
            <button
              key={opt.id}
              type="button"
              disabled={!active || submitted}
              onClick={() => handlePick(opt.id)}
              className={`group flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all disabled:cursor-not-allowed ${style}`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  submitted && opt.correct
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : submitted && chosen && !opt.correct
                    ? "border-rose-500 bg-rose-500 text-white"
                    : chosen
                    ? "border-bread-500 bg-bread-500 text-white"
                    : "border-bread-300"
                }`}
              >
                {submitted && opt.correct ? (
                  <Check className="h-3 w-3" />
                ) : submitted && chosen && !opt.correct ? (
                  <X className="h-3 w-3" />
                ) : (
                  <span className="text-[11px] font-bold">{opt.id.toUpperCase()}</span>
                )}
              </span>
              <div className="flex-1">
                <div>{opt.label}</div>
                {submitted && chosen && opt.feedback && (
                  <div className="mt-1.5 text-xs text-bread-900/70">{opt.feedback}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {step.allowMulti && !submitted && (
        <button
          type="button"
          disabled={!active || picked.length === 0}
          onClick={handleMultiSubmit}
          className="mt-3 inline-flex rounded-full bg-bread-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-bread-600 disabled:cursor-not-allowed disabled:bg-bread-200"
        >
          提交答案
        </button>
      )}

      {submitted && !allCorrect && (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-rose-600">还差一点，再试一次。</span>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-bread-300 px-3 py-1 text-xs font-medium text-bread-700 hover:bg-bread-50"
          >
            重选
          </button>
        </div>
      )}
      {submitted && allCorrect && step.explanation && (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
          <MiniMd text={step.explanation} className="!text-emerald-900" />
        </div>
      )}
    </Bubble>
  );
}
