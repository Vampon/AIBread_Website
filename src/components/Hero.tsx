import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(245,183,15,0.18),_transparent_60%)]" />
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
            <Sparkles className="h-3.5 w-3.5" />
            给普通人的 AI 面包房
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-bread-900 md:text-6xl">
            教普通人，<br className="md:hidden" />
            也能玩转 <span className="text-bread-500">AI</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-bread-900/70 md:text-xl">
            AI 工具评测 · 提示词技巧 · 真实使用案例
            <br />
            不讲玄学，不堆术语，每篇看完都能上手。
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/learn"
              className="group inline-flex items-center gap-2 rounded-full bg-bread-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-bread-600 hover:shadow-bread"
            >
              开始 0 基础学习
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-bread-200 bg-white px-6 py-3 text-sm font-medium text-bread-900 transition-all hover:border-bread-500 hover:text-bread-600"
            >
              逛逛博客
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
