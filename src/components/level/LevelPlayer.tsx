"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Star } from "lucide-react";
import type { Level, LevelStep } from "@/lib/levels";
import { StepText } from "./StepText";
import { StepQuiz } from "./StepQuiz";
import { StepFillBlank } from "./StepFillBlank";
import { StepPromptInput } from "./StepPromptInput";
import { StepTerminal } from "./StepTerminal";
import { StepImageGen } from "./StepImageGen";
import { StepReveal } from "./StepReveal";
import { StepCelebration } from "./StepCelebration";
import { useProgress } from "@/lib/use-progress";
import { isLevelPlayable } from "@/lib/levels-progress";

export function LevelPlayer({ level }: { level: Level }) {
  const userProgress = useProgress();
  // hydration 完成后再判 gate，避免 SSR 期间一闪锁屏
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const gate = isLevelPlayable(level.id, userProgress.completedLevels);
  const isReplaying = userProgress.completedLevels.includes(level.id);

  if (hydrated && !gate.playable && !isReplaying) {
    return <LockScreen level={level} gate={gate} />;
  }

  // 当前激活到第几个 Step（从 0 开始），第 active 个是当前可交互的，前面是已完成的
  const [active, setActive] = useState(0);
  // 已完成的 step index
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const total = level.steps.length;
  const progress = useMemo(
    () => Math.round((completed.size / total) * 100),
    [completed.size, total]
  );

  function handleComplete(idx: number) {
    setCompleted((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }

  function next() {
    if (active < total - 1 && completed.has(active)) {
      setActive((a) => a + 1);
    }
  }

  // 当 active 增加时，滚动到新 Step
  useEffect(() => {
    const el = stepRefs.current[active];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  }, [active]);

  // 上一关下一关导航 - 末关已完成则展示返回地图
  const isLast = active === total - 1;
  const canAdvance = completed.has(active) && !isLast;

  return (
    <div className="bg-bread-50">
      {/* 顶部 meta */}
      <div className="sticky top-16 z-30 border-b border-bread-100 bg-white/90 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 rounded-full border border-bread-200 bg-bread-50 px-3 py-1.5 text-xs font-medium text-bread-800 transition-colors hover:border-bread-400"
          >
            <ArrowLeft className="h-3 w-3" />
            学习地图
          </Link>
          <div className="flex flex-1 items-center gap-3 truncate">
            <span className="text-2xl">{level.emoji}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-bread-900">
                {level.title}
              </div>
              <div className="text-[11px] text-bread-900/55">
                {level.id} · 约 {level.estimatedMin} 分钟
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < level.difficulty
                    ? "fill-bread-500 text-bread-500"
                    : "text-bread-200"
                }`}
              />
            ))}
            <span className="ml-2 rounded-full bg-bread-100 px-2 py-0.5 text-[11px] font-medium text-bread-700">
              +{level.xpReward} XP
            </span>
          </div>
        </div>
      </div>

      {/* 中间内容（底部留出 fixed 进度栏 + 安全间距，避免被遮挡） */}
      <div ref={containerRef} className="pb-32 md:pb-28">
        <div className="container-page max-w-3xl space-y-6 py-8">
          {level.steps.slice(0, active + 1).map((step, idx) => (
            <div
              key={idx}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              className={`transition-all duration-500 ${
                idx === active
                  ? "opacity-100"
                  : completed.has(idx)
                  ? "opacity-90"
                  : "opacity-100"
              }`}
            >
              <StepRenderer
                step={step}
                active={idx === active}
                onComplete={() => handleComplete(idx)}
                levelId={level.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 底部进度 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-bread-100 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-bread-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bread-400 to-bread-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-bread-900/60">
              {completed.size}/{total}
            </span>
          </div>
          <button
            type="button"
            disabled={!canAdvance}
            onClick={next}
            className="inline-flex items-center gap-1 rounded-full bg-bread-900 px-5 py-2 text-xs font-medium text-white transition-all hover:bg-bread-800 disabled:cursor-not-allowed disabled:bg-bread-200 disabled:text-white/80"
          >
            {isLast ? "已是最后一步" : "下一步"}
            {!isLast && <ArrowRight className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LockScreen({
  level,
  gate,
}: {
  level: Level;
  gate: ReturnType<typeof isLevelPlayable>;
}) {
  return (
    <div className="container-page max-w-2xl py-16 md:py-24">
      <div className="rounded-3xl border border-bread-200 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-bread-100 text-3xl">
          <Lock className="h-7 w-7 text-bread-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-bread-900 md:text-3xl">
          {level.emoji} {level.title}
        </h1>
        {gate.reason === "needs-prev" ? (
          <>
            <p className="mt-3 text-base leading-relaxed text-bread-900/70">
              这一关需要先把前一关
              <span className="mx-1 rounded-md bg-bread-100 px-1.5 py-0.5 font-semibold text-bread-900">
                {gate.prevNodeTitle}
              </span>
              通关后再来。这样路径才是连贯的。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`/learn/${gate.prevNodeId}`}
                className="inline-flex items-center gap-1 rounded-full bg-bread-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-bread-600 hover:shadow-bread"
              >
                <ArrowLeft className="h-4 w-4" />
                先打前一关
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1 rounded-full border border-bread-300 px-5 py-2.5 text-sm font-medium text-bread-800 transition-all hover:border-bread-500 hover:bg-bread-50"
              >
                返回学习地图
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-base leading-relaxed text-bread-900/70">
              这一关还在筹备中，敬请期待。
            </p>
            <Link
              href="/learn"
              className="mt-8 inline-flex items-center gap-1 rounded-full bg-bread-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-bread-600 hover:shadow-bread"
            >
              返回学习地图
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function StepRenderer({
  step,
  active,
  onComplete,
  levelId,
}: {
  step: LevelStep;
  active: boolean;
  onComplete: () => void;
  levelId: string;
}) {
  switch (step.kind) {
    case "text":
      return <StepText step={step} active={active} onComplete={onComplete} />;
    case "quiz":
      return <StepQuiz step={step} active={active} onComplete={onComplete} />;
    case "fill-blank":
      return <StepFillBlank step={step} active={active} onComplete={onComplete} />;
    case "prompt-input":
      return <StepPromptInput step={step} active={active} onComplete={onComplete} />;
    case "terminal":
      return <StepTerminal step={step} active={active} onComplete={onComplete} />;
    case "image-gen":
      return <StepImageGen step={step} active={active} onComplete={onComplete} />;
    case "reveal":
      return <StepReveal step={step} active={active} onComplete={onComplete} />;
    case "celebration":
      return (
        <StepCelebration
          step={step}
          active={active}
          onComplete={onComplete}
          levelId={levelId}
        />
      );
    default: {
      // 编译时穷尽检查
      const _exhaustive: never = step;
      return null;
    }
  }
}
