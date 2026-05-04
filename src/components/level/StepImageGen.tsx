"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Wand2, ImageIcon } from "lucide-react";
import type { StepImageGen as StepImageGenType } from "@/lib/levels";

type Phase = "idle" | "generating" | "done";

export function StepImageGen({
  step,
  active,
  onComplete,
}: {
  step: StepImageGenType;
  active: boolean;
  onComplete: () => void;
}) {
  const [val, setVal] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const duration = step.durationMs ?? 2400;

  function start() {
    if (!active || phase !== "idle" || val.trim().length < 3) return;
    setPhase("generating");
  }

  useEffect(() => {
    if (phase !== "generating") return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setPct(p);
      if (p >= 100) {
        clearInterval(id);
        setPhase("done");
        setTimeout(onComplete, 200);
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase, duration, onComplete]);

  return (
    <div className="rounded-2xl border border-bread-200 bg-white p-4">
      {step.intro && (
        <p className="mb-3 text-sm text-bread-900/85">{step.intro}</p>
      )}

      {step.sampleInputs && phase === "idle" && (
        <div className="mb-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-bread-700/70">
            来一个 prompt：
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {step.sampleInputs.map((s, i) => (
              <button
                key={i}
                type="button"
                disabled={!active}
                onClick={() => setVal(s)}
                className="rounded-full border border-bread-200 bg-bread-50 px-3 py-1 text-xs text-bread-800 transition-colors hover:border-bread-400 hover:bg-bread-100"
              >
                {s.length > 30 ? s.slice(0, 28) + "…" : s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-bread-200 bg-bread-50/40">
        <div className="flex items-stretch">
          <div className="flex flex-1 flex-col">
            <input
              type="text"
              value={val}
              disabled={!active || phase !== "idle"}
              placeholder={step.promptPlaceholder ?? "描述你想生成的图…"}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") start();
              }}
              className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-bread-900/40 disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            disabled={!active || phase !== "idle" || val.trim().length < 3}
            onClick={start}
            className="m-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-bread-500 to-bread-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-bread disabled:cursor-not-allowed disabled:from-bread-200 disabled:to-bread-200"
          >
            <Wand2 className="h-3.5 w-3.5" />
            生成
          </button>
        </div>
      </div>

      <div className="mt-4">
        {phase === "idle" && (
          <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-bread-200 bg-bread-50/50 text-sm text-bread-900/50">
            <ImageIcon className="mr-2 h-4 w-4" />
            还没出图，先输入提示词
          </div>
        )}

        {phase === "generating" && (
          <div className="rounded-2xl border border-bread-200 bg-gradient-to-br from-bread-50 to-bread-100 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-bread-900">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bread-500/60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-bread-500" />
              </span>
              正在出图…（{pct}%）
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bread-300 via-bread-500 to-bread-600 transition-all duration-100"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-gradient-to-br from-bread-200/70 to-bread-300/40"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <figure className="overflow-hidden rounded-2xl border border-bread-200">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={step.resultSrc}
                alt={step.resultAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
            {step.resultCaption && (
              <figcaption className="border-t border-bread-100 bg-bread-50/50 px-4 py-2 text-xs text-bread-900/70">
                {step.resultCaption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </div>
  );
}
