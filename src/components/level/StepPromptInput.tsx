"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import type { StepPromptInput as StepPromptInputType } from "@/lib/levels";
import { MiniMd } from "@/lib/mini-md";
import { Bubble } from "./Bubble";

export function StepPromptInput({
  step,
  active,
  onComplete,
}: {
  step: StepPromptInputType;
  active: boolean;
  onComplete: () => void;
}) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [revealedParas, setRevealedParas] = useState(0);
  const [missMessage, setMissMessage] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const minChars = step.minChars ?? 4;
  const canSubmit = active && submitted === null && val.trim().length >= minChars;

  // 逐段揭示 AI 回复
  useEffect(() => {
    if (submitted === null) return;
    if (revealedParas >= step.aiReply.length) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setRevealedParas((n) => n + 1), 700);
    return () => clearTimeout(t);
  }, [submitted, revealedParas, step.aiReply.length, onComplete]);

  function send() {
    if (!canSubmit) return;
    const text = val.trim();
    if (step.expectKeywords && step.expectKeywords.length > 0) {
      const ok = step.expectKeywords.some((kw) =>
        text.toLowerCase().includes(kw.toLowerCase())
      );
      if (!ok) {
        setMissMessage(step.miss ?? "再想想——题里要求里有几个关键点没覆盖到。");
        return;
      }
    }
    setMissMessage("");
    setSubmitted(text);
  }

  return (
    <div className="space-y-3">
      <Bubble label="动手试一下" speaker="tutor">
        <p className="text-sm leading-7 text-bread-900/85">{step.intro}</p>

        {step.sampleInputs && step.sampleInputs.length > 0 && submitted === null && (
          <div className="mt-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-bread-700/70">
              不知道写啥？点一个套用：
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {step.sampleInputs.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!active}
                  onClick={() => {
                    setVal(s);
                    taRef.current?.focus();
                  }}
                  className="rounded-full border border-bread-200 bg-bread-50 px-3 py-1 text-xs text-bread-800 transition-colors hover:border-bread-400 hover:bg-bread-100"
                >
                  {s.length > 28 ? s.slice(0, 26) + "…" : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {submitted === null && (
          <div className="mt-3">
            <div className="overflow-hidden rounded-2xl border border-bread-200 bg-white focus-within:border-bread-500 focus-within:ring-2 focus-within:ring-bread-200/60">
              <textarea
                ref={taRef}
                rows={3}
                disabled={!active}
                value={val}
                placeholder={step.placeholder ?? "在这里输入你的提示词…"}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
                }}
                className="block w-full resize-none px-4 py-3 text-sm leading-6 outline-none placeholder:text-bread-900/40 disabled:bg-bread-50/40"
              />
              <div className="flex items-center justify-between border-t border-bread-100 bg-bread-50/40 px-3 py-1.5">
                <span className="text-[11px] text-bread-900/50">
                  {val.trim().length}/{minChars} 字 · 按 ⌘/Ctrl + Enter 发送
                </span>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={send}
                  className="inline-flex items-center gap-1 rounded-full bg-bread-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-bread-600 disabled:cursor-not-allowed disabled:bg-bread-200"
                >
                  <Send className="h-3 w-3" />
                  发送
                </button>
              </div>
            </div>
            {missMessage && (
              <p className="mt-2 text-xs text-rose-600">{missMessage}</p>
            )}
          </div>
        )}
      </Bubble>

      {submitted && (
        <Bubble label="你说" speaker="user">
          <p className="whitespace-pre-wrap text-sm leading-6 text-bread-900">{submitted}</p>
        </Bubble>
      )}

      {submitted && revealedParas > 0 && (
        <Bubble
          label={
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI 回复
            </span>
          }
          speaker="tutor"
        >
          <div className="space-y-2">
            {step.aiReply.slice(0, revealedParas).map((p, i) => (
              <div key={i} className="text-sm leading-7 text-bread-900/85">
                <MiniMd text={p} />
              </div>
            ))}
            {revealedParas < step.aiReply.length && (
              <div className="flex items-center gap-1 pt-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bread-500" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bread-500 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bread-500 [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </Bubble>
      )}
    </div>
  );
}
