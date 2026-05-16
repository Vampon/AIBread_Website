"use client";

import { useState } from "react";
import { ArrowRight, Backpack, MessageCircle, Sparkles } from "lucide-react";

type Skill = {
  id: string;
  label: string;
  matcher: string;
  brief: string;
};

const SKILLS: Skill[] = [
  {
    id: "code-review",
    label: "code-review",
    matcher: "review / 看一下 PR / 检查改动",
    brief: "扫描 git diff，按风险级排序问题，输出报告",
  },
  {
    id: "weekly-summary",
    label: "weekly-summary",
    matcher: "周报 / 本周做了什么 / 周三",
    brief: "整合 git log 和 Linear 任务生成本周摘要",
  },
  {
    id: "add-tests",
    label: "add-tests",
    matcher: "写测试 / add tests / 补一下用例",
    brief: "对应函数生成 5 个测试用例（边界、异常、正常）",
  },
];

const INPUTS = [
  { text: "帮我看一下这个 PR", matchId: "code-review" },
  { text: "本周我做了什么", matchId: "weekly-summary" },
  { text: "给 parseDate 写测试", matchId: "add-tests" },
  { text: "今天天气怎么样", matchId: null },
];

export function SkillsAutoloadVisual() {
  const [idx, setIdx] = useState(0);
  const cur = INPUTS[idx];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
      <div className="mb-2 text-[10.5px] uppercase tracking-wider text-slate-500">
        点输入看哪个 skill 被自动加载
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {INPUTS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
              idx === i
                ? "border-amber-400 bg-amber-500/15 text-amber-200"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            {s.text}
          </button>
        ))}
      </div>

      {/* 输入 → 匹配 */}
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2">
        <MessageCircle className="h-3.5 w-3.5 flex-none text-amber-400" />
        <span className="flex-1 text-[12px] text-slate-200">「{cur.text}」</span>
        <ArrowRight className="h-3.5 w-3.5 flex-none text-slate-600" />
      </div>

      {/* skill 列表 */}
      <div className="space-y-1.5">
        {SKILLS.map((s) => {
          const matched = cur.matchId === s.id;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
                matched
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 ring-2 ring-emerald-400/20"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}
            >
              <Backpack className="h-3.5 w-3.5 flex-none" />
              <div className="flex-1 text-[11.5px]">
                <div className="font-mono font-medium">{s.label}</div>
                <div className="mt-0.5 text-[10px] opacity-80">
                  description 关键词：{s.matcher}
                </div>
              </div>
              {matched && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-1.5 py-0.5 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" />
                  匹配
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg bg-slate-950/50 px-3 py-2 text-[11.5px] leading-6 text-slate-400">
        {cur.matchId
          ? "主代理读到匹配的 skill，把它的工作流注入上下文，按那个流程干活。"
          : "无匹配 skill。主代理走默认推理。"}
      </div>
    </div>
  );
}
