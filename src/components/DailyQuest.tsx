"use client";

import Link from "next/link";
import { CalendarCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { getAllLevels } from "@/data/levels";
import { useProgress } from "@/lib/use-progress";

export function DailyQuest() {
  const progress = useProgress();
  const all = getAllLevels();
  // 推荐第一个还没通关的关卡；都通关了就推荐回顾第一关
  const candidate =
    all.find((l) => !progress.completedLevels.includes(l.id)) ?? all[0];
  if (!candidate) return null;
  const allDone = progress.completedLevels.length >= all.length;

  return (
    <div className="overflow-hidden rounded-3xl border border-bread-300 bg-gradient-to-r from-bread-500 to-bread-600 text-white shadow-bread">
      <div className="relative grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
        <div className="pointer-events-none absolute -right-6 -top-10 text-[160px] opacity-15 md:-right-2 md:top-auto md:bottom-0">
          🍞
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          {allDone ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <CalendarCheck className="h-6 w-6" />
          )}
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
            {allDone ? "通关全图" : "今日任务"}
          </div>
          <h3 className="mt-2 text-2xl font-bold md:text-3xl">
            {allDone
              ? `已通关全部已开放关卡，再来回顾下：${candidate.emoji} ${candidate.title}`
              : `今天烤一关：${candidate.emoji} ${candidate.title}`}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            约 {candidate.estimatedMin} 分钟，奖励 +{candidate.xpReward} XP，连烤天数继续累加。
          </p>
        </div>
        <Link
          href={`/learn/${candidate.id}`}
          className="relative inline-flex items-center gap-1 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-bread-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:self-auto"
        >
          {allDone ? "再烤一遍" : "开始烘烤"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
