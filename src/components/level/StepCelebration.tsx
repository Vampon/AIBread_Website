"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Trophy, Sparkles, ArrowRight, Map, Lock } from "lucide-react";
import type { StepCelebration as StepCelebrationType } from "@/lib/levels";
import { completeLevel } from "@/lib/progress";
import { getLevel } from "@/data/levels";
import { getNextNode } from "@/lib/levels-progress";

export function StepCelebration({
  step,
  active,
  onComplete,
  levelId,
}: {
  step: StepCelebrationType;
  active: boolean;
  onComplete: () => void;
  levelId: string;
}) {
  const writtenRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    onComplete();
    if (writtenRef.current) return;
    writtenRef.current = true;
    completeLevel({
      levelId,
      xp: step.xp,
      badge: step.badge
        ? { id: `${levelId}-badge`, emoji: step.badge.emoji, label: step.badge.label }
        : undefined,
    });
  }, [active, onComplete, levelId, step.xp, step.badge]);

  // 用章节顺序找下一关，而不是只看 level 文件里的 nextLevelId
  // 这样即使下一关还没写内容，也能告诉用户"下一关是啥（筹备中）"
  const nextNode = getNextNode(levelId);
  const nextLevel =
    nextNode && nextNode.unlocked ? getLevel(nextNode.id) : undefined;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-bread-300 bg-gradient-to-br from-bread-100 via-bread-50 to-white p-8 shadow-bread">
      <div className="pointer-events-none absolute -right-10 -top-10 text-[140px] opacity-15">
        🍞
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-bread-500 px-3 py-1 text-xs font-medium text-white">
          <Sparkles className="h-3 w-3" />
          通关成功
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-bread-900 md:text-4xl">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="mt-2 max-w-md text-base text-bread-900/70">{step.subtitle}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-bread-200 bg-white px-4 py-3 shadow-sm">
            <Trophy className="h-5 w-5 text-bread-600" />
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-bread-700/70">
                获得 XP
              </div>
              <div className="text-lg font-bold text-bread-900">+{step.xp}</div>
            </div>
          </div>
          {step.badge && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-bread-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-2xl">{step.badge.emoji}</span>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-bread-700/70">
                  解锁徽章
                </div>
                <div className="text-sm font-semibold text-bread-900">
                  {step.badge.label}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 rounded-full border border-bread-300 bg-white px-5 py-2.5 text-sm font-medium text-bread-800 transition-all hover:border-bread-500 hover:bg-bread-50"
          >
            <Map className="h-4 w-4" />
            返回地图
          </Link>
          {nextLevel ? (
            <Link
              href={`/learn/${nextLevel.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-bread-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-bread-600 hover:shadow-bread"
            >
              下一关：{nextLevel.emoji} {nextLevel.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : nextNode ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-bread-300 bg-white/50 px-5 py-2.5 text-sm font-medium text-bread-700/70">
              <Lock className="h-3.5 w-3.5" />
              下一关：{nextNode.emoji} {nextNode.title}（筹备中）
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-bread-300 px-5 py-2.5 text-sm font-medium text-bread-700/70">
              本章节已通关
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
