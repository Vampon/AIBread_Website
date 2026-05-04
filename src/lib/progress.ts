/**
 * 学习进度持久化（localStorage）
 *
 * 存放在浏览器的 localStorage 里——和"浏览器缓存"不是一回事：
 * - 浏览器缓存（HTTP cache）：清浏览器缓存就没了
 * - localStorage：用户清"网站数据"才会清，一般不会丢
 *
 * 想把进度搬到云端（多设备同步），未来接登录系统后把 load/save 改成读写后端就行。
 */

const KEY = "aibread:progress:v1";
export const PROGRESS_EVENT = "aibread:progress-changed";

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  /** 解锁日期 YYYY-MM-DD */
  date: string;
};

export type Progress = {
  completedLevels: string[];
  totalXp: number;
  badges: Badge[];
  lastPlayedAt: string;
  streakDays: number;
  /** 最近一次活动日（YYYY-MM-DD） */
  streakDate: string;
};

export const emptyProgress: Progress = {
  completedLevels: [],
  totalXp: 0,
  badges: [],
  lastPlayedAt: "",
  streakDays: 0,
  streakDate: "",
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...emptyProgress, ...parsed };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayOf(today: string): string {
  const d = new Date(today + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** 完成一关：累加 XP、收下徽章、更新连烤天数。已完成的关卡幂等不重复加 XP。 */
export function completeLevel(input: {
  levelId: string;
  xp: number;
  badge?: { id?: string; emoji: string; label: string };
}): Progress {
  const cur = loadProgress();
  if (cur.completedLevels.includes(input.levelId)) {
    return cur;
  }
  const today = todayStr();

  let streakDays = cur.streakDays;
  if (cur.streakDate === today) {
    // 同一天再过关，连烤天数不变
  } else if (cur.streakDate && yesterdayOf(today) === cur.streakDate) {
    streakDays = cur.streakDays + 1;
  } else {
    streakDays = 1;
  }

  const nextBadges = input.badge
    ? [
        ...cur.badges,
        {
          id: input.badge.id ?? `${input.levelId}-badge`,
          emoji: input.badge.emoji,
          label: input.badge.label,
          date: today,
        },
      ]
    : cur.badges;

  const next: Progress = {
    completedLevels: [...cur.completedLevels, input.levelId],
    totalXp: cur.totalXp + input.xp,
    badges: nextBadges,
    lastPlayedAt: new Date().toISOString(),
    streakDays,
    streakDate: today,
  };
  saveProgress(next);
  return next;
}

/** 等级算法：每 200 XP 一级 */
export function levelInfo(xp: number) {
  const xpPerLevel = 200;
  const level = Math.floor(xp / xpPerLevel) + 1;
  return {
    level,
    xpInLevel: xp % xpPerLevel,
    xpToNext: xpPerLevel,
  };
}
