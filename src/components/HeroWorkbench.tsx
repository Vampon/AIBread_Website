"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Globe2, MousePointer2, Terminal } from "lucide-react";

const demos = [
  {
    tab: "做网站",
    icon: Globe2,
    request: "我想把文章、课程和作品放进一个网站。",
    steps: ["先排清内容", "做出页面", "手机上再看一遍"],
    result: "AI面包君个人网站",
    detail: "你现在看到的，就是成品。",
    href: "/work",
    action: "看作品",
  },
  {
    tab: "做课程",
    icon: Terminal,
    request: "Claude Code 太抽象，能不能边操作边学？",
    steps: ["拆成小概念", "做仿真终端", "配上即时讲解"],
    result: "Claude Code 实验室",
    detail: "不用安装，打开就能练。",
    href: "/cc",
    action: "试一下",
  },
  {
    tab: "找工具",
    icon: Compass,
    request: "AI 工具太多，我只想快速找到合适的。",
    steps: ["按用途分类", "筛掉重复项", "保留直达入口"],
    result: "AI 导航站",
    detail: "少翻几页，快一点开工。",
    href: "https://navigation.aibread.site/",
    action: "去看看",
    external: true,
  },
];

export function HeroWorkbench() {
  const [active, setActive] = useState(0);
  const demo = demos[active];
  const Icon = demo.icon;

  return (
    <div className="relative mx-auto w-full max-w-[510px] rotate-[-1deg] rounded-[1.75rem] border border-bread-900/15 bg-white p-3 shadow-soft transition-transform hover:rotate-0">
      <div className="flex items-center justify-between border-b border-bread-900/10 px-3 pb-3 pt-1">
        <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-bread-300" /><span className="h-2.5 w-2.5 rounded-full bg-bread-200" /><span className="h-2.5 w-2.5 rounded-full bg-bread-100" /></div>
        <span className="text-[10px] font-bold tracking-[0.14em] text-bread-900/35">面包君的 AI 工作台</span>
        <MousePointer2 className="h-3.5 w-3.5 text-bread-900/30" />
      </div>

      <div className="grid grid-cols-3 gap-2 py-3" role="tablist" aria-label="看看我能用 AI 做什么">
        {demos.map((item, index) => {
          const TabIcon = item.icon;
          return <button key={item.tab} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all ${active === index ? "bg-bread-900 text-white" : "bg-bread-50 text-bread-900/55 hover:bg-bread-100 hover:text-bread-900"}`}><TabIcon className="h-3.5 w-3.5" />{item.tab}</button>;
        })}
      </div>

      <div key={demo.tab} className="animate-bread-rise overflow-hidden rounded-[1.35rem] bg-bread-50 p-5">
        <div className="flex items-start gap-3"><span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">💬</span><div><p className="text-[10px] font-bold text-bread-700">遇到的问题</p><p className="mt-1 text-sm font-bold leading-6 text-bread-900">{demo.request}</p></div></div>
        <div className="my-4 ml-4 border-l border-dashed border-bread-700/25 pl-7">
          {demo.steps.map((step, index) => <div key={step} className="relative mb-2 flex items-center gap-2 text-xs text-bread-900/55 last:mb-0"><span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-bread-200 text-[9px] font-bold text-bread-800">{index + 1}</span>{step}</div>)}
        </div>
        <div className="rounded-2xl bg-bread-500 p-5">
          <div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/75"><Icon className="h-4 w-4 text-bread-900" /></span><span className="rounded-full bg-bread-900 px-2.5 py-1 text-[9px] font-bold text-white">做完了</span></div>
          <h3 className="mt-4 font-display text-xl text-bread-900">{demo.result}</h3><p className="mt-1 text-xs text-bread-900/60">{demo.detail}</p>
          {demo.external ? <a href={demo.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-bread-900">{demo.action}<ArrowRight className="h-3.5 w-3.5" /></a> : <Link href={demo.href} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-bread-900">{demo.action}<ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 py-3 text-[10px] text-bread-900/35"><BookOpen className="h-3 w-3" /> 点上面的按钮，换个例子</div>
    </div>
  );
}
