import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Cable,
  Clock3,
  Code2,
  Database,
  Globe2,
  Network,
  Route,
  UsersRound,
  Workflow,
} from "lucide-react";
import { BREAD_SERIES_PATH } from "@/lib/bread-series";

const steps = [
  { label: "Agent", icon: Bot },
  { label: "MCP", icon: Cable },
  { label: "RAG", icon: Database },
  { label: "Browser", icon: Globe2 },
  { label: "Multi-Agent", icon: UsersRound },
];

const planned = [
  {
    title: "智能体协作平台",
    description: "从任务拆解、角色分工到过程追踪，做一套能真正协作的多智能体工作台。",
    tags: ["多智能体", "完整项目"],
    icon: Network,
    theme: "bg-[#DDEFEA] text-[#23685F]",
  },
  {
    title: "Dify 工作流实战",
    description: "从第一个节点开始，把知识库、条件分支和外部工具接成一条完整工作流。",
    tags: ["Dify", "工作流"],
    icon: Workflow,
    theme: "bg-[#EAE4F4] text-[#65508C]",
  },
];

export function CourseCatalog({ chapterCount }: { chapterCount: number }) {
  return (
    <>
      <section className="container-page mt-8" aria-labelledby="course-catalog-title">
        <div className="flex flex-col gap-3 border-b border-bread-900/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">Course shelf</p>
            <h2 id="course-catalog-title" className="mt-2 text-2xl font-bold text-bread-900 md:text-3xl">选择一条学习路线</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-bread-900/55">课程会按项目持续增加。已经上线的可以直接学，筹备中的先把位置留在这里。</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Link href={BREAD_SERIES_PATH} className="group overflow-hidden rounded-[22px] border-2 border-bread-900 bg-white shadow-[5px_6px_0_rgba(31,22,17,.16)] transition-transform hover:-translate-y-1 lg:col-span-2">
            <div className="relative min-h-[270px] overflow-hidden bg-[#202A27] p-5 text-[#fff8e7] md:p-7">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="rounded-full border border-[#88D7C8]/50 bg-[#183632] px-3 py-1 text-[10px] font-bold text-[#9EE1D4]">免费 · 已上线</span>
                <span className="font-mono text-[10px] text-white/45">COURSE 001</span>
              </div>
              <div className="relative mt-8 flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#F4BC46] bg-[#151D1B] text-[#F4BC46] shadow-[4px_4px_0_#A85F2E]"><Bot className="h-8 w-8" /></span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4BC46]">Build it from scratch</p>
                  <h3 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">从零手写 AI 助手</h3>
                </div>
              </div>
              <div className="relative mt-9 grid grid-cols-5 gap-1.5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="relative min-w-0">
                      {index > 0 && <span className="absolute right-1/2 top-[18px] h-px w-full bg-[#F4BC46]/38" aria-hidden="true" />}
                      <span className="relative mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#F4BC46]/55 bg-[#202A27] text-[#F4BC46]"><Icon className="h-4 w-4" /></span>
                      <span className="mt-2 block truncate text-center font-mono text-[8px] text-white/58 sm:text-[9px]">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap gap-2">{["Python", "Agent", "MCP", "RAG"].map((tag) => <span key={tag} className="rounded-full border border-bread-900/12 bg-bread-50 px-2.5 py-1 text-[10px] font-bold text-bread-900/58">{tag}</span>)}</div>
              <p className="mt-4 text-sm leading-7 text-bread-900/62">从一次模型调用开始，把 Agent、工具协议、检索、浏览器操作和多智能体协作一层层搭出来。</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-bread-900/10 pt-4">
                <span className="flex flex-wrap gap-4 text-[11px] text-bread-900/48"><CourseFact icon={Route} text="5 个模块" /><CourseFact icon={Code2} text={`${chapterCount} 章`} /><CourseFact icon={Clock3} text="30–60 分钟/章" /></span>
                <strong className="inline-flex items-center gap-2 text-sm text-bread-900">查看课程 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></strong>
              </div>
            </div>
          </Link>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {planned.map((course) => {
              const Icon = course.icon;
              return (
                <article key={course.title} className="flex min-h-[245px] flex-col rounded-[22px] border-2 border-bread-900/20 bg-white/72 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${course.theme}`}><Icon className="h-6 w-6" /></span>
                    <span className="rounded-full bg-bread-100 px-2.5 py-1 text-[10px] font-bold text-bread-800/65">筹备中</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-bread-900">{course.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-bread-900/52">{course.description}</p>
                  <div className="mt-4 flex gap-2 border-t border-bread-900/10 pt-4">{course.tags.map((tag) => <span key={tag} className="rounded-full border border-bread-900/10 px-2.5 py-1 text-[10px] text-bread-900/52">{tag}</span>)}</div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page mt-14 pb-10">
        <div className="grid border-y border-bread-900/12 md:grid-cols-3 md:divide-x md:divide-bread-900/12">
          <CourseNote number="01" title="从能运行开始">每一章都有可以直接运行的结果，先动手，再解释为什么。</CourseNote>
          <CourseNote number="02" title="关键逻辑不藏起来">尽量少用大框架，让工具调用、检索和协作过程都看得见。</CourseNote>
          <CourseNote number="03" title="可以按模块学习">第一次建议顺着走；有基础后，也可以直接从 MCP、RAG 或浏览器模块开始。</CourseNote>
        </div>
      </section>
    </>
  );
}

function CourseFact({ icon: Icon, text }: { icon: typeof Route; text: string }) {
  return <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-bread-700" />{text}</span>;
}

function CourseNote({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <article className="py-6 md:px-7 md:py-8 first:md:pl-0 last:md:pr-0"><span className="font-mono text-[10px] font-bold text-bread-700">{number}</span><h3 className="mt-3 text-base font-bold text-bread-900">{title}</h3><p className="mt-2 text-xs leading-6 text-bread-900/52">{children}</p></article>;
}
