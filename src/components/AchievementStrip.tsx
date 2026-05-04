"use client";

import { Lock } from "lucide-react";
import { useProgress } from "@/lib/use-progress";

type Achievement = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  /** 判断是否解锁的函数 */
  unlocked: (input: {
    completedLevels: string[];
    badges: { id: string }[];
    totalXp: number;
    streakDays: number;
  }) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bake",
    emoji: "🥖",
    title: "首次出炉",
    desc: "完成第一关",
    unlocked: ({ completedLevels }) => completedLevels.length >= 1,
  },
  {
    id: "streak-3",
    emoji: "🔥",
    title: "连烤 3 天",
    desc: "连续 3 天来打卡",
    unlocked: ({ streakDays }) => streakDays >= 3,
  },
  {
    id: "prompt-master",
    emoji: "🧩",
    title: "提示词工匠",
    desc: "通关任意提示词章节关卡",
    unlocked: ({ completedLevels }) => completedLevels.some((id) => id.startsWith("c3-")),
  },
  {
    id: "boss-killer",
    emoji: "👑",
    title: "BOSS 终结者",
    desc: "拿下任意章节 BOSS",
    unlocked: ({ completedLevels }) =>
      completedLevels.some((id) => /-(5|6)$/.test(id)),
  },
  {
    id: "fullstars",
    emoji: "⭐",
    title: "三关连烤",
    desc: "累计通关 3 关以上",
    unlocked: ({ completedLevels }) => completedLevels.length >= 3,
  },
  {
    id: "100-bread",
    emoji: "🍞",
    title: "百面包",
    desc: "累计获得 1000 XP",
    unlocked: ({ totalXp }) => totalXp >= 1000,
  },
];

export function AchievementStrip() {
  const progress = useProgress();
  const ctx = {
    completedLevels: progress.completedLevels,
    badges: progress.badges,
    totalXp: progress.totalXp,
    streakDays: progress.streakDays,
  };
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked(ctx)).length;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-bread-900 md:text-2xl">徽章墙</h2>
        <span className="text-xs text-bread-900/50">
          解锁 {unlockedCount} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ACHIEVEMENTS.map((a) => {
          const got = a.unlocked(ctx);
          return (
            <div
              key={a.id}
              className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                got
                  ? "border-bread-200 bg-white hover:-translate-y-1 hover:shadow-md"
                  : "border-dashed border-bread-200/70 bg-bread-50/50"
              }`}
              title={a.desc}
            >
              <div className={`text-3xl ${got ? "" : "grayscale opacity-40"}`}>
                {a.emoji}
              </div>
              <div className="text-xs font-semibold text-bread-900/85">{a.title}</div>
              <div className="text-[10px] leading-tight text-bread-900/50">
                {a.desc}
              </div>
              {!got && (
                <Lock className="absolute right-2 top-2 h-3 w-3 text-bread-900/30" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
