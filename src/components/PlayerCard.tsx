"use client";

import { Flame, Trophy, RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/use-progress";
import { levelInfo, resetProgress } from "@/lib/progress";

const AVATARS = [
  { min: 0, emoji: "🥣", title: "生面团" },
  { min: 100, emoji: "🥖", title: "半发酵" },
  { min: 300, emoji: "🍞", title: "新鲜出炉" },
  { min: 600, emoji: "🥐", title: "酥皮大师" },
  { min: 1000, emoji: "🎂", title: "面包传说" },
];

export function PlayerCard({ totalNodes }: { totalNodes: number }) {
  const progress = useProgress();
  const { level, xpInLevel, xpToNext } = levelInfo(progress.totalXp);
  const avatar =
    AVATARS.slice().reverse().find((a) => progress.totalXp >= a.min) ?? AVATARS[0];
  const xpPct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
  const completed = progress.completedLevels.length;

  function handleReset() {
    if (window.confirm("确定要清空所有学习进度吗？XP / 徽章 / 连烤天数都会归零。")) {
      resetProgress();
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-bread-200 bg-gradient-to-br from-white via-bread-50 to-bread-100 shadow-sm">
      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-bread-200 to-bread-400 text-6xl shadow-bread">
          {avatar.emoji}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-bread-500 px-2 py-0.5 text-xs font-bold text-white">
              Lv.{level}
            </span>
            <span className="text-sm font-semibold text-bread-900">
              {avatar.title}
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="清空学习进度"
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-bread-200 bg-white/70 px-2 py-0.5 text-[11px] text-bread-700/70 transition-colors hover:border-bread-400 hover:text-bread-700 md:hidden"
            >
              <RotateCcw className="h-3 w-3" />
              重置
            </button>
          </div>
          <h2 className="mt-1 truncate text-2xl font-bold text-bread-900 md:text-3xl">
            欢迎回来，面包君学徒
          </h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-bread-900/70">
              <span>距离下一级</span>
              <span className="font-mono">
                {xpInLevel} / {xpToNext} XP · 累计 {progress.totalXp}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-bread-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bread-400 to-bread-600 transition-all duration-700 ease-out"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 md:flex-col">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-bread-100 bg-white px-3 py-2 shadow-sm md:flex-none">
            <Flame className="h-4 w-4 text-rose-500" />
            <div>
              <div className="text-[11px] text-bread-900/60">连烤天数</div>
              <div className="text-sm font-bold text-bread-900">{progress.streakDays} 天</div>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-bread-100 bg-white px-3 py-2 shadow-sm md:flex-none">
            <Trophy className="h-4 w-4 text-bread-600" />
            <div>
              <div className="text-[11px] text-bread-900/60">已通关</div>
              <div className="text-sm font-bold text-bread-900">
                {completed} / {totalNodes}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            title="清空学习进度"
            className="hidden items-center justify-center gap-1 rounded-xl border border-bread-100 bg-white px-3 py-2 text-[11px] text-bread-700/70 transition-colors hover:border-bread-400 hover:text-bread-700 md:inline-flex"
          >
            <RotateCcw className="h-3 w-3" />
            重置进度
          </button>
        </div>
      </div>
    </div>
  );
}
