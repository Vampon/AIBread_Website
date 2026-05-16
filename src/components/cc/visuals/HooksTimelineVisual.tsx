"use client";

import { useState } from "react";
import { Hammer, MessageCircle, Send, Zap } from "lucide-react";

type Hook = {
  id: string;
  label: string;
  Icon: typeof Hammer;
  when: string;
  example: string;
  pos: number; // 0..1 时间轴位置
};

const HOOKS: Hook[] = [
  {
    id: "submit",
    label: "UserPromptSubmit",
    Icon: Send,
    when: "你按下回车 → 模型还没看到",
    example: "自动给输入加上下文：「当前 git 分支是 main，已改文件 5 个」",
    pos: 0.08,
  },
  {
    id: "pre",
    label: "PreToolUse",
    Icon: Zap,
    when: "模型决定调工具 → 工具还没执行",
    example: "拦截危险命令：含 `rm -rf` 的 Bash 直接 exit 1",
    pos: 0.4,
  },
  {
    id: "post",
    label: "PostToolUse",
    Icon: Hammer,
    when: "工具刚执行完",
    example: "Edit/Write 后自动跑 prettier 格式化",
    pos: 0.65,
  },
  {
    id: "stop",
    label: "Stop",
    Icon: MessageCircle,
    when: "模型最终回复前",
    example: "自动把当前进度 git commit 一下",
    pos: 0.92,
  },
];

export function HooksTimelineVisual() {
  const [active, setActive] = useState<string>("pre");
  const hook = HOOKS.find((h) => h.id === active) ?? HOOKS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 text-[10.5px] uppercase tracking-wider text-slate-500">
        一次对话生命周期里的 4 个 hook 节点
      </div>

      {/* 时间轴 */}
      <div className="relative mb-3 mt-2 h-12">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-slate-700" />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
          输入
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
          回复
        </div>
        {HOOKS.map((h) => {
          const isOn = active === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setActive(h.id)}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.pos * 100}%` }}
              title={h.label}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                  isOn
                    ? "border-amber-400 bg-amber-500/20 text-amber-200 ring-2 ring-amber-400/30"
                    : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <h.Icon className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>

      {/* 标签层 */}
      <div className="mb-3 flex flex-wrap gap-1">
        {HOOKS.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setActive(h.id)}
            className={`rounded-full border px-2 py-0.5 font-mono text-[10.5px] transition-colors ${
              active === h.id
                ? "border-amber-400 bg-amber-500/15 text-amber-200"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* 详情 */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
        <div className="mb-1 text-[11px] font-medium text-slate-200">
          {hook.label}
        </div>
        <div className="text-[11px] text-slate-400">
          <span className="text-slate-500">触发时机：</span>
          {hook.when}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-300">
          <span className="text-slate-500">典型用法：</span>
          {hook.example}
        </div>
      </div>
    </div>
  );
}
