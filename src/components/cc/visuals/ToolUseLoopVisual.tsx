"use client";

import { Fragment, useState } from "react";
import {
  Brain,
  MessageSquare,
  Repeat,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";

const NODES = [
  {
    id: "user",
    label: "你",
    Icon: User,
    detail: "你输入一句话，比如「看一下 README」。",
    tint: "amber",
  },
  {
    id: "decide",
    label: "模型决策",
    Icon: Brain,
    detail: "模型输出一段 tool_use JSON：「我要调 Read 工具，参数 README.md」。",
    tint: "emerald",
  },
  {
    id: "exec",
    label: "工具执行",
    Icon: Wrench,
    detail: "Claude Code 拦下 tool_use，真的去读文件。",
    tint: "sky",
  },
  {
    id: "result",
    label: "结果回流",
    Icon: MessageSquare,
    detail: "把读到的内容包成 tool_result，塞回模型上下文。",
    tint: "violet",
  },
  {
    id: "reply",
    label: "模型回复",
    Icon: Sparkles,
    detail: "模型看到结果，写出最终回答（或继续调下一个工具，循环）。",
    tint: "emerald",
  },
];

const TINT_ON: Record<string, string> = {
  amber: "border-amber-400 bg-amber-500/20 text-amber-200 ring-2 ring-amber-400/30",
  emerald:
    "border-emerald-400 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/30",
  sky: "border-sky-400 bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/30",
  violet:
    "border-violet-400 bg-violet-500/20 text-violet-200 ring-2 ring-violet-400/30",
};

export function ToolUseLoopVisual() {
  const [active, setActive] = useState<string>("user");
  const node = NODES.find((n) => n.id === active) ?? NODES[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-1">
        {NODES.map((n, i) => (
          <Fragment key={n.id}>
            <button
              type="button"
              onClick={() => setActive(n.id)}
              className="group flex flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                  active === n.id
                    ? TINT_ON[n.tint]
                    : "border-slate-700 bg-slate-800/60 text-slate-400 group-hover:border-slate-500 group-hover:text-slate-200"
                }`}
              >
                <n.Icon className="h-3.5 w-3.5" />
              </span>
              <span
                className={`text-[10px] ${
                  active === n.id ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {n.label}
              </span>
            </button>
            {i < NODES.length - 1 && (
              <span className="-mt-3 select-none text-slate-700">→</span>
            )}
          </Fragment>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[12px] leading-6 text-slate-300">
        <Repeat className="mt-0.5 h-3 w-3 flex-none text-slate-500" />
        <span>{node.detail}</span>
      </div>
    </div>
  );
}
