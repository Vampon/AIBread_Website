"use client";

import Link from "next/link";
import { Lock, Star, CheckCircle2 } from "lucide-react";
import { KIND_META, type LevelNode } from "@/data/matrix";
import { useProgress } from "@/lib/use-progress";
import { isLevelPlayable } from "@/lib/levels-progress";

export function MatrixNode({ node }: { node: LevelNode }) {
  const meta = KIND_META[node.kind];
  const progress = useProgress();
  const completed = progress.completedLevels.includes(node.id);
  const gate = isLevelPlayable(node.id, progress.completedLevels);

  const base =
    "group relative flex h-[112px] w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all duration-300";

  // 内容尚未上线 / 节点未开放
  if (gate.reason === "no-content") {
    return (
      <div
        className={`${base} cursor-not-allowed border-dashed border-bread-200/70 bg-bread-50/40 text-bread-900/40`}
        aria-disabled="true"
        title="筹备中"
      >
        <div className="flex items-start justify-between">
          <span className="text-base leading-none opacity-50">{node.emoji}</span>
          <Lock className="h-3 w-3 text-bread-900/30" />
        </div>
        <div className="line-clamp-2 text-xs font-semibold leading-tight">
          {node.title}
        </div>
        <div className="mt-auto flex items-center justify-between text-[10px] text-bread-900/40">
          <span>{meta.icon} 筹备中</span>
          <span>+{node.xp}</span>
        </div>
      </div>
    );
  }

  // 内容有，但前置关卡未通关
  if (gate.reason === "needs-prev") {
    return (
      <div
        className={`${base} cursor-not-allowed border-dashed border-bread-300/80 bg-bread-50/60 text-bread-900/55`}
        aria-disabled="true"
        title={`先通关「${gate.prevNodeTitle}」再来`}
      >
        <div className="flex items-start justify-between">
          <span className="text-base leading-none opacity-70">{node.emoji}</span>
          <Lock className="h-3 w-3 text-bread-700/50" />
        </div>
        <div className="line-clamp-2 text-xs font-semibold leading-tight">
          {node.title}
        </div>
        <div className="mt-auto flex items-center justify-between text-[10px] text-bread-700/60">
          <span className="truncate">先打通前一关</span>
          <span>+{node.xp}</span>
        </div>
      </div>
    );
  }

  const isBoss = node.kind === "boss";

  return (
    <Link
      href={`/learn/${node.id}`}
      className={`${base} ${
        completed
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white text-bread-900 ring-1 ring-emerald-200 hover:-translate-y-1 hover:shadow-md"
          : isBoss
          ? "border-bread-500 bg-gradient-to-br from-bread-100 to-bread-50 text-bread-900 hover:-translate-y-1 hover:shadow-bread"
          : "border-bread-200 bg-white text-bread-900 hover:-translate-y-1 hover:border-bread-500 hover:bg-bread-50 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-lg leading-none">{node.emoji}</span>
        <div className="flex items-center gap-0.5">
          {completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < node.difficulty
                    ? "fill-bread-500 text-bread-500"
                    : "text-bread-200"
                }`}
              />
            ))
          )}
        </div>
      </div>
      <div className="line-clamp-2 text-xs font-semibold leading-tight">
        {node.title}
      </div>
      <div className="mt-auto flex items-center justify-between text-[10px]">
        <span
          className={`rounded-full px-1.5 py-0.5 font-medium ${
            completed
              ? "bg-emerald-100 text-emerald-800"
              : isBoss
              ? "bg-bread-500 text-white"
              : "bg-bread-100 text-bread-700"
          }`}
        >
          {completed ? "✓ 已通关" : `${meta.icon} ${meta.label}`}
        </span>
        <span className="font-mono text-bread-900/60">+{node.xp}</span>
      </div>
    </Link>
  );
}
