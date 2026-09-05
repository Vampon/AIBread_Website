import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Compass, Layers3, Terminal, Wrench } from "lucide-react";
import { matrixStats } from "@/data/matrix";

export const metadata = { title: "学习资源", description: "按你的问题选择 AI 闯关学习、Claude Code 互动实验与实用参考。" };

const upcoming = [
  { icon: Wrench, title: "AI 工具实战手册", description: "按具体任务找工具，也写清楚什么情况不值得用。", meta: "工具选择" },
  { icon: Layers3, title: "提示词案例库", description: "收集真实任务中的输入、调整过程和最后结果。", meta: "案例参考" },
  { icon: Compass, title: "工作流小课", description: "把零散技巧接起来，放进日常工作里。", meta: "方法与流程" },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="container-page">
        <div className="page-intro">
          <div><p className="eyebrow">Learning resources</p><h1 className="display-title mt-4 text-4xl md:text-6xl">学习资源</h1></div>
          <p className="max-w-lg text-sm leading-7 text-bread-900/62">课程、练习和参考资料都归在这里。不必按固定顺序，先解决手头的问题。</p>
        </div>
      </section>

      <section className="container-page mt-7 pb-8">
        <div className="grid gap-7 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-9">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <p className="page-kicker">资源分类</p>
            <nav className="mt-4 space-y-1" aria-label="学习资源分类">
              <a href="#start" className="flex items-center justify-between rounded-xl bg-bread-900 px-4 py-2.5 text-sm font-bold text-white"><span>从这里开始</span><span className="font-mono text-[9px] text-white/45">02</span></a>
              <a href="#next" className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-bread-900/60 hover:bg-white hover:text-bread-900"><span>工具与方法</span><span className="font-mono text-[9px] text-bread-900/30">03</span></a>
              <a href="/blog" className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-bread-900/60 hover:bg-white hover:text-bread-900"><span>相关文章</span><ArrowRight className="h-3.5 w-3.5" /></a>
            </nav>
            <div className="mt-6 rounded-xl border border-bread-900/10 bg-bread-100/55 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-bread-900"><CheckCircle2 className="h-4 w-4 text-bread-600" /> 怎么选？</p>
              <p className="mt-2 text-[11px] leading-5 text-bread-900/50">完全没接触过 AI，先去闯关地图；已经在写代码，直接进 Claude Code 实验室。</p>
            </div>
          </aside>

          <div className="min-w-0">
            <div id="start" className="scroll-mt-24">
              <div className="flex items-end justify-between border-b border-bread-900/10 pb-4"><div><h2 className="text-xl font-bold text-bread-900">从这里开始</h2><p className="mt-1 text-xs text-bread-900/40">已经可以直接使用</p></div><span className="hidden items-center gap-1 text-[11px] text-bread-900/40 sm:inline-flex"><Clock3 className="h-3.5 w-3.5" /> 每次 5—10 分钟</span></div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Link href="/learn" className="group relative overflow-hidden rounded-2xl border border-bread-900/10 bg-bread-500 p-6 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/75"><BookOpen className="h-5 w-5" /></span><span className="rounded-full bg-bread-900 px-2.5 py-1 text-[9px] font-bold text-white">推荐起点</span></div>
                  <p className="mt-10 text-[10px] font-bold text-bread-900/55">零基础 · {matrixStats.totalNodes} 关</p><h3 className="mt-2 font-display text-2xl text-bread-900">AI 闯关地图</h3><p className="mt-3 max-w-md text-xs leading-6 text-bread-900/60">从“AI 是什么”开始，用问答和小练习把概念一点点拆开。</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-bread-900">开始第一关 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </Link>
                <Link href="/cc" className="group relative overflow-hidden rounded-2xl border border-bread-900 bg-bread-900 p-6 text-white transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Terminal className="h-5 w-5 text-bread-300" /></span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-white/65">互动实验</span></div>
                  <p className="mt-10 text-[10px] font-bold text-bread-300">Claude Code · 仿真环境</p><h3 className="mt-2 font-display text-2xl">Claude Code 实验室</h3><p className="mt-3 max-w-md text-xs leading-6 text-white/55">不用安装。敲命令、看反馈，也看清上下文和工具调用。</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold">进入实验室 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </div>
            </div>

            <div id="next" className="mt-10 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-bread-900/10 pb-4"><div><h2 className="text-xl font-bold text-bread-900">工具与方法</h2><p className="mt-1 text-xs text-bread-900/40">正在整理，完成后会直接开放</p></div></div>
              <div className="mt-4 divide-y divide-bread-900/10 overflow-hidden rounded-2xl border border-bread-900/10 bg-white">
                {upcoming.map((item) => { const Icon = item.icon; return (
                  <article key={item.title} className="grid gap-4 p-5 sm:grid-cols-[40px_1fr_auto] sm:items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bread-100 text-bread-700"><Icon className="h-4 w-4" /></span>
                    <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-bread-900">{item.title}</h3><span className="rounded-full bg-bread-50 px-2 py-0.5 text-[9px] text-bread-700">{item.meta}</span></div><p className="mt-1 text-xs leading-5 text-bread-900/50">{item.description}</p></div>
                    <span className="text-[10px] font-bold text-bread-900/35">准备中</span>
                  </article>
                ); })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
