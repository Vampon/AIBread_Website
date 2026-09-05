import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Terminal as TerminalIcon } from "lucide-react";
import { Simulator } from "@/components/cc/Simulator";
import { ConceptIndex } from "@/components/cc/ConceptIndex";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Claude Code 实验室",
  description:
    "一个仿真的 Claude Code 终端。敲任何命令，都能在旁边同步看到「这一步背后发生了什么」。",
};

export default function CCPage() {
  const articleMap: Record<string, string> = {};
  for (const a of getAllArticles()) articleMap[a.slug] = a.title;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(245,183,15,0.18),_transparent_60%)]" />
        <div className="container-page py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Link href="/resources" className="inline-flex items-center gap-1 text-xs font-bold text-bread-700 hover:text-bread-900">学习资源 <ChevronRight className="h-3.5 w-3.5" /> Claude Code 实验室</Link>
            <h1 className="display-title mt-5 text-4xl md:text-6xl">
              敲一行命令，
              <br className="md:hidden" />
              看 Claude <span className="text-bread-500">背后</span>在做什么
            </h1>
            <p className="mt-5 text-base leading-relaxed text-bread-900/70 md:text-lg">
              下面是一个仿真的 Claude Code 终端。
              <br className="hidden md:inline" />
              你输入的每一句话，旁边都会同步告诉你「这一步背后发生了什么、原理是什么」。
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-bread-200 bg-white/70 px-3 py-1 text-xs text-bread-700">
              <TerminalIcon className="h-3 w-3" />
              纯模拟环境 · 不会真的执行任何命令
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <Simulator articleMap={articleMap} />
      </section>

      <ConceptIndex />

      <section className="container-page pb-16">
        <div className="rounded-2xl border border-bread-100 bg-bread-50/60 p-6 text-center text-sm text-bread-900/70">
          这只是开胃菜。Claude Code 还有很多机制（子代理 / MCP / hooks / 自定义技能）会在 v2 解锁。
          想跟我聊聊或催更，去
          <Link
            href="/about"
            className="ml-1 text-bread-700 underline decoration-bread-300 underline-offset-2 hover:text-bread-500"
          >
            关于我
          </Link>
          。
        </div>
      </section>
    </>
  );
}
