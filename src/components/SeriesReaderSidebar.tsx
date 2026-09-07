import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, ListTree } from "lucide-react";
import type { Article } from "@/lib/articles";
import { breadChapterPath, breadCourses, BREAD_SERIES_PATH } from "@/lib/bread-series";

export function SeriesReaderSidebar({ articles, activeSlug }: { articles: Article[]; activeSlug: string }) {
  const activeIndex = articles.findIndex((article) => article.slug === activeSlug);
  const progress = Math.max(1, Math.round(((activeIndex + 1) / articles.length) * 100));

  return (
    <aside className="hidden h-[calc(100vh-64px)] min-w-0 border-r border-bread-900/12 bg-[#FFF9EA] xl:sticky xl:top-16 xl:block xl:overflow-y-auto">
      <div className="border-b border-bread-900/10 px-5 pb-5 pt-4">
        <Link href="/ai-learn" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-bread-900/45 hover:text-bread-900"><ChevronLeft className="h-3 w-3" />AI 学习</Link>
        <Link href={BREAD_SERIES_PATH} className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-bread-900/10 bg-white text-bread-700 shadow-sm"><BookOpen className="h-5 w-5" /></span>
          <span className="min-w-0"><strong className="block text-sm text-bread-900">从零手写 AI 助手</strong><small className="mt-1 block text-[10px] text-bread-900/43">5 个模块 · {articles.length} 章</small></span>
        </Link>
        <div className="mt-5 flex items-center gap-3"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bread-900/8"><span className="block h-full rounded-full bg-bread-500" style={{ width: `${progress}%` }} /></span><span className="font-mono text-[9px] text-bread-900/38">{activeIndex + 1}/{articles.length}</span></div>
      </div>

      <nav aria-label="课程章节" className="space-y-2 p-3">
        {breadCourses.map((course) => {
          const courseArticles = articles.filter((article) => article.courseSlug === course.slug);
          const isActive = courseArticles.some((article) => article.slug === activeSlug);
          return (
            <details key={course.slug} open={isActive} className={`group overflow-hidden rounded-xl border bg-white/76 ${isActive ? "border-bread-900/18 shadow-sm" : "border-bread-900/8"}`}>
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3.5">
                <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: course.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: course.color }}>Module {course.number}</span><strong className="mt-0.5 block truncate text-xs text-bread-900">{course.name}</strong></span>
                <ChevronRight className="h-3.5 w-3.5 text-bread-900/30 transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-bread-900/8 py-1.5">
                {courseArticles.map((article) => {
                  const current = article.slug === activeSlug;
                  return (
                    <Link key={article.slug} href={breadChapterPath(article.slug)} prefetch title={cleanTitle(article.title)} aria-current={current ? "page" : undefined} className={`grid grid-cols-[24px_1fr] gap-2 border-l-2 px-3 py-2.5 text-[11px] leading-4 transition-colors ${current ? "border-bread-500 bg-bread-100/65 font-bold text-bread-900" : "border-transparent text-bread-900/52 hover:bg-bread-50 hover:text-bread-900"}`}>
                      <span className="font-mono text-[9px] opacity-55">{String((article.chapter ?? 0) + 1).padStart(2, "0")}</span>
                      <span>{cleanTitle(article.title)}</span>
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        })}
      </nav>
    </aside>
  );
}

export function SeriesMobileMenu({ articles, activeSlug }: { articles: Article[]; activeSlug: string }) {
  return (
    <details className="group rounded-xl border border-bread-900/12 bg-[#FFF9EA] xl:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-xs font-bold text-bread-900"><ListTree className="h-4 w-4 text-bread-700" /><span className="flex-1">展开当前模块目录</span><ChevronRight className="h-4 w-4 text-bread-900/35 transition-transform group-open:rotate-90" /></summary>
      <div className="max-h-[55vh] overflow-y-auto border-t border-bread-900/10 p-2">
        {breadCourses.map((course) => {
          const courseArticles = articles.filter((article) => article.courseSlug === course.slug);
          if (!courseArticles.some((article) => article.slug === activeSlug)) return null;
          return <div key={course.slug}><p className="px-3 py-2 text-[10px] font-bold" style={{ color: course.color }}>{course.name}</p>{courseArticles.map((article) => <Link key={article.slug} href={breadChapterPath(article.slug)} className={`grid grid-cols-[28px_1fr] rounded-lg px-3 py-2.5 text-xs ${article.slug === activeSlug ? "bg-bread-100 font-bold text-bread-900" : "text-bread-900/58"}`}><span className="font-mono text-[9px]">{String((article.chapter ?? 0) + 1).padStart(2, "0")}</span><span>{cleanTitle(article.title)}</span></Link>)}</div>;
        })}
        <Link href={BREAD_SERIES_PATH} className="mt-2 flex items-center justify-between rounded-lg border border-bread-900/10 bg-white px-3 py-2.5 text-xs font-bold text-bread-900">查看全部 {articles.length} 章 <ChevronRight className="h-3.5 w-3.5" /></Link>
      </div>
    </details>
  );
}

function cleanTitle(title: string) {
  return title.replace(/^第\s*\d+\s*章\s*[·—-]?\s*/, "");
}
