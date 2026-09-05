import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroWorkbench } from "@/components/HeroWorkbench";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-bread-900/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_40%,rgba(255,197,46,0.26),transparent_26rem)]" />
      <div className="container-page relative grid min-h-[540px] items-center gap-10 py-10 lg:grid-cols-[1.06fr_.94fr]">
        <div className="animate-bread-rise">
          <p className="eyebrow">AI creator & lifelong learner</p>
          <h1 className="display-title mt-5 max-w-3xl text-[clamp(2.8rem,5.8vw,5.3rem)]">
            把 AI 讲明白，<br />也做点<span className="relative whitespace-nowrap text-bread-600">有用的东西。<span className="absolute -bottom-1 left-0 -z-10 h-2 w-full -rotate-1 rounded-full bg-bread-300/65" /></span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-bread-900/68 md:text-base">
            这里记录一个普通人如何理解 AI、创造工具，再把过程讲给更多人听。没有高高在上的术语，只有真实的实践、踩坑和作品。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/work" className="group inline-flex items-center justify-center gap-2 rounded-full bg-bread-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-bread-800">
              看看我做的东西 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full border border-bread-900/15 bg-white/70 px-6 py-3.5 text-sm font-bold text-bread-900 transition-all hover:border-bread-500 hover:bg-white">
              从学习资源开始
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-bread-900/10 pt-4 text-xs text-bread-900/50">
            <span><strong className="text-bread-900">持续更新</strong> AI 实践笔记</span>
            <span><strong className="text-bread-900">独立开发</strong> 工具与实验</span>
            <span><strong className="text-bread-900">面向普通人</strong> 的学习内容</span>
          </div>
        </div>

        <HeroWorkbench />
      </div>
    </section>
  );
}
