import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
  FlaskConical,
  Layers3,
  Play,
  Route,
  Wrench,
} from "lucide-react";
import { getSeriesArticles } from "@/lib/articles";
import { breadChapterPath, breadCourses, BREAD_SERIES_PATH, BREAD_SERIES_SLUG } from "@/lib/bread-series";

export const metadata = {
  title: "从零手写 AI 助手",
  description: "用 33 个可以直接运行的 Python 章节，从零手写 Agent、MCP、RAG、浏览器 Agent 与多 Agent 系统。",
};

const method = [
  { number: "01", title: "先跑通", text: "每章从一个可以直接运行的最小结果开始。", icon: Play },
  { number: "02", title: "再拆开", text: "把关键代码逐段拆开，看清数据怎么流动。", icon: Layers3 },
  { number: "03", title: "补能力", text: "每次只加一块零件，旧代码继续成为新章节的地基。", icon: Wrench },
  { number: "04", title: "做成项目", text: "最后把能力重新组合，留下能继续改造的完整项目。", icon: FlaskConical },
];

export default function BreadSeriesPage() {
  const articles = getSeriesArticles(BREAD_SERIES_SLUG);
  const firstArticle = articles[0];

  return (
    <main className="pb-20">
      <section className="border-b border-bread-900/12 bg-[#F7EBCF]">
        <div className="container-page py-8 md:py-12">
          <Link href="/ai-learn" className="inline-flex items-center gap-2 text-xs font-bold text-bread-900/58 hover:text-bread-900"><ArrowLeft className="h-3.5 w-3.5" />全部课程</Link>
          <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,.7fr)] lg:items-stretch">
            <div className="py-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold"><span className="rounded-full bg-[#DDF1E9] px-3 py-1 text-[#27685E]">免费图文课</span><span className="rounded-full border border-bread-900/12 bg-white/55 px-3 py-1 text-bread-900/55">Python · 零框架起步</span></div>
              <p className="mt-7 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-bread-700">Bread Lab / Course 001</p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-bread-900 md:text-6xl">从零手写<br className="hidden sm:block" />自己的 AI 助手</h1>
              <p className="mt-6 max-w-3xl text-sm leading-8 text-bread-900/65 md:text-base">不先背 Agent、MCP、RAG 这些名词。我们从一次模型调用开始，每章只加一块能力，直到它会用工具、查资料、操作网页，也能和其他 Agent 一起完成任务。</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {firstArticle && <Link href={breadChapterPath(firstArticle.slug)} className="inline-flex items-center gap-2 rounded-lg bg-bread-900 px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_#F3B83F] transition-transform hover:-translate-y-0.5">开始第 1 章 <ArrowRight className="h-4 w-4" /></Link>}
                <a href="#curriculum" className="inline-flex items-center gap-2 rounded-lg border-2 border-bread-900/18 bg-white/60 px-5 py-3 text-sm font-bold text-bread-900 hover:bg-white">浏览课程地图 <Route className="h-4 w-4" /></a>
              </div>
            </div>

            <aside className="border-2 border-bread-900 bg-[#FFFDF7] p-5 shadow-[6px_7px_0_rgba(31,22,17,.14)] md:p-6" aria-label="课程模块概览">
              <div className="flex items-end justify-between gap-4 border-b border-bread-900/12 pb-4"><div><p className="page-kicker">Course map</p><h2 className="mt-2 text-xl font-bold text-bread-900">五段装配路线</h2></div><span className="font-mono text-[10px] text-bread-900/38">01 → 05</span></div>
              <ol className="mt-3">
                {breadCourses.map((course) => {
                  const count = articles.filter((article) => article.courseSlug === course.slug).length;
                  return (
                    <li key={course.slug} className="group border-b border-bread-900/10 last:border-b-0">
                      <a href={`#${course.slug}`} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 py-3.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-[10px] font-bold text-white" style={{ backgroundColor: course.color }}>{course.number}</span>
                        <span><strong className="block text-sm text-bread-900">{course.shortName}</strong><small className="mt-0.5 block text-[10px] text-bread-900/43">{course.action}</small></span>
                        <span className="font-mono text-[9px] text-bread-900/35">{count} 章</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </aside>
          </div>

          <dl className="mt-10 grid divide-y divide-bread-900/12 border-y border-bread-900/12 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <Stat icon={Route} value="5" label="个递进模块" />
            <Stat icon={Code2} value={String(articles.length)} label="个动手章节" />
            <Stat icon={Clock3} value="30–60" label="分钟 / 章" />
            <Stat icon={CheckCircle2} value="0" label="个黑盒框架" />
          </dl>
        </div>
      </section>

      <section className="container-page py-12 md:py-16" aria-labelledby="how-to-learn">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div><p className="eyebrow">How we learn</p><h2 id="how-to-learn" className="display-title mt-4 text-3xl md:text-4xl">这套课怎么学</h2><p className="mt-4 text-sm leading-7 text-bread-900/55">它更像一份装配手册：不用先把理论全背完，顺着章节把零件装起来。</p></div>
          <ol className="grid border-y border-bread-900/12 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-bread-900/12">
            {method.map((item) => {
              const Icon = item.icon;
              return <li key={item.number} className="border-b border-bread-900/10 p-5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-bread-700" /><span className="font-mono text-[10px] text-bread-900/28">{item.number}</span></div><h3 className="mt-5 text-base font-bold text-bread-900">{item.title}</h3><p className="mt-2 text-xs leading-6 text-bread-900/52">{item.text}</p></li>;
            })}
          </ol>
        </div>
      </section>

      <section id="curriculum" className="container-page scroll-mt-24 border-t-2 border-bread-900 pt-9 md:pt-12">
        <div className="grid gap-9 xl:grid-cols-[230px_minmax(0,1fr)] xl:gap-14">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <p className="page-kicker">Curriculum</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-bread-900">完整课程</h2>
            <p className="mt-3 text-xs leading-6 text-bread-900/55">第一次学，建议从 Agent 顺着走到 Multi-Agent；有基础也可以直接进某个模块。</p>
            <nav className="mt-6 space-y-1" aria-label="课程模块">
              {breadCourses.map((course) => <a key={course.slug} href={`#${course.slug}`} className="flex items-center gap-3 border-l-2 border-bread-900/12 px-3 py-2.5 text-xs font-bold text-bread-900/55 hover:border-bread-500 hover:bg-white/60 hover:text-bread-900"><span className="font-mono text-[9px]" style={{ color: course.color }}>{course.number}</span>{course.shortName}</a>)}
            </nav>
            <a href="/downloads/bread-ai-tutorial-code.zip" download className="mt-7 inline-flex w-full items-center justify-between rounded-lg border-2 border-bread-900 bg-white px-4 py-3 text-xs font-bold text-bread-900 shadow-[4px_4px_0_#e6b34e] transition-transform hover:-translate-y-0.5"><span className="inline-flex items-center gap-2"><Download className="h-4 w-4" />配套代码</span><span className="font-mono text-[9px] text-bread-900/40">ZIP</span></a>
          </aside>

          <div className="space-y-12">
            {breadCourses.map((course, courseIndex) => {
              const chapters = articles.filter((article) => article.courseSlug === course.slug);
              return (
                <section key={course.slug} id={course.slug} className="scroll-mt-24">
                  <div className="grid gap-4 border-b-2 border-bread-900 pb-5 md:grid-cols-[84px_1fr]">
                    <span className="font-mono text-xs font-bold tracking-[0.12em]" style={{ color: course.color }}>VOL.{course.number}</span>
                    <div><div className="flex flex-wrap items-baseline justify-between gap-3"><h3 className="font-display text-3xl font-bold text-bread-900 md:text-4xl">{course.name}</h3><span className="font-mono text-[9px] text-bread-900/36">{chapters.length} CHAPTERS</span></div><p className="mt-2 text-sm font-bold" style={{ color: course.color }}>{course.action}</p><p className="mt-2 max-w-3xl text-sm leading-7 text-bread-900/55">{course.description}</p></div>
                  </div>
                  <ol className="divide-y divide-bread-900/10 border-x border-bread-900/10 bg-white/72">
                    {chapters.map((chapter) => (
                      <li key={chapter.slug}>
                        <Link href={breadChapterPath(chapter.slug)} prefetch className="group grid gap-3 px-4 py-4 hover:bg-bread-100/45 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:items-center md:px-6">
                          <span className="font-mono text-[11px] font-bold text-bread-900/34">{String((chapter.chapter ?? 0) + 1).padStart(2, "0")}</span>
                          <span className="min-w-0"><strong className="block text-sm text-bread-900 group-hover:text-bread-700 md:text-[15px]">{cleanChapterTitle(chapter.title)}</strong><span className="mt-1 block text-[11px] text-bread-900/42">约 {chapter.readMin} 分钟 · {chapter.codeLines} 行代码 · 难度 {"★".repeat(chapter.difficulty ?? 1)}</span></span>
                          <ArrowRight className="hidden h-4 w-4 text-bread-900/25 transition-transform group-hover:translate-x-1 group-hover:text-bread-700 sm:block" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                  {courseIndex < breadCourses.length - 1 && <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-bread-900/28">Next → {breadCourses[courseIndex + 1].shortName}</p>}
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Route; value: string; label: string }) {
  return <div className="flex items-center gap-3 py-4 sm:px-5"><Icon className="h-4 w-4 text-bread-700" /><div><dt className="text-[10px] text-bread-900/45">{label}</dt><dd className="mt-0.5 font-mono text-base font-bold text-bread-900">{value}</dd></div></div>;
}

function cleanChapterTitle(title: string) {
  return title.replace(/^第\s*\d+\s*章\s*[·—-]?\s*/, "");
}
