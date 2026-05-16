"use client";

import { useState } from "react";
import { Clock, FolderGit2 } from "lucide-react";

const sessions = [
  {
    id: "s1",
    time: "今天 14:30",
    project: "my-tool",
    topic: "改首页 hero 文案",
    turns: 23,
  },
  {
    id: "s2",
    time: "昨天 19:00",
    project: "my-blog",
    topic: "写 claude-skills.md",
    turns: 8,
  },
  {
    id: "s3",
    time: "3 天前 11:15",
    project: "my-api",
    topic: "调试 webhook 鉴权",
    turns: 41,
  },
  {
    id: "s4",
    time: "上周",
    project: "my-tool",
    topic: "初始化 Next.js + Tailwind",
    turns: 17,
  },
];

const cwd = "my-tool";

export function SessionResumeVisual() {
  const [active, setActive] = useState<string | null>(null);
  const cur = sessions.find((s) => s.id === active);
  const wrongProject = !!cur && cur.project !== cwd;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">历史会话</span>
        <span className="font-mono text-slate-500">cwd: ~/{cwd}</span>
      </div>

      <div className="mb-2.5 space-y-1">
        {sessions.map((s) => {
          const isActive = active === s.id;
          const sameProj = s.project === cwd;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`w-full rounded-md border px-2.5 py-1.5 text-left transition-colors ${
                isActive
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-2 text-[11px]">
                <Clock className="h-3 w-3 text-slate-500" />
                <span className="text-slate-300">{s.time}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">
                  {s.turns} 轮
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11.5px]">
                <FolderGit2
                  className={`h-3 w-3 ${
                    sameProj ? "text-amber-400/70" : "text-slate-500"
                  }`}
                />
                <span
                  className={`font-mono text-[10.5px] ${
                    sameProj ? "text-amber-200/80" : "text-slate-500"
                  }`}
                >
                  {s.project}/
                </span>
                <span className="truncate text-slate-300">{s.topic}</span>
              </div>
            </button>
          );
        })}
      </div>

      {cur && (
        <div
          className={`rounded-lg px-2.5 py-1.5 text-[11px] leading-5 ${
            wrongProject
              ? "border border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {wrongProject ? (
            <>
              ⚠ 你现在在{" "}
              <span className="font-mono">~/{cwd}</span>，但这个会话来自{" "}
              <span className="font-mono">~/{cur.project}</span>。恢复后里面的文件路径可能跑不通。
            </>
          ) : (
            <>✓ 已恢复 {cur.turns} 轮对话上下文，继续聊。</>
          )}
        </div>
      )}
      {!cur && (
        <div className="rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-500">
          点一条会话恢复——只读旧上下文，不会覆盖你现在的进度。
        </div>
      )}
    </div>
  );
}
