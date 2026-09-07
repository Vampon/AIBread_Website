import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock3, Code2, Gauge } from "lucide-react";
import { getArticleBySlug, extractToc, getSeriesArticles } from "@/lib/articles";
import { ArticleBody } from "@/components/ArticleBody";
import { SeriesMobileMenu, SeriesReaderSidebar } from "@/components/SeriesReaderSidebar";
import { TocSidebar } from "@/components/TocSidebar";
import { breadChapterPath, BREAD_SERIES_PATH, BREAD_SERIES_SLUG, courseMeta } from "@/lib/bread-series";

export function generateStaticParams() {
  return getSeriesArticles(BREAD_SERIES_SLUG).map((article) => ({ series: BREAD_SERIES_SLUG, slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ series: string; slug: string }> }) {
  const { series, slug } = await params;
  const article = getArticleBySlug(slug);
  if (series !== BREAD_SERIES_SLUG || !article || article.kind !== "tutorial") return { title: "找不到这一章" };
  return { title: article.title, description: article.excerpt, alternates: { canonical: breadChapterPath(article.slug) } };
}

export default async function CourseArticlePage({ params }: { params: Promise<{ series: string; slug: string }> }) {
  const { series, slug } = await params;
  const article = getArticleBySlug(slug);
  if (series !== BREAD_SERIES_SLUG || !article || article.kind !== "tutorial" || article.seriesSlug !== series) notFound();

  const all = getSeriesArticles(series);
  const toc = extractToc(article.content);
  const index = all.findIndex((item) => item.slug === article.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const course = courseMeta(article.courseSlug);
  const progress = Math.round(((index + 1) / all.length) * 100);

  return (
    <div className="mx-auto grid w-full max-w-[1760px] xl:grid-cols-[292px_minmax(0,1fr)_220px]">
      <SeriesReaderSidebar articles={all} activeSlug={article.slug} />

      <article className="min-w-0 border-bread-900/10 bg-white/50 px-5 py-6 md:px-10 md:py-9 xl:px-12">
        <div className="mx-auto max-w-[850px]">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-bread-900/42" aria-label="面包屑">
            <Link href="/ai-learn" className="hover:text-bread-900">AI 学习</Link><span>/</span><Link href={BREAD_SERIES_PATH} className="hover:text-bread-900">从零手写 AI 助手</Link><span>/</span><span style={{ color: course?.color }}>{course?.shortName}</span>
          </nav>
          <header className="mt-5 border-b border-bread-900/10 pb-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span className="rounded-md px-2.5 py-1 font-mono text-[9px] font-bold text-white" style={{ backgroundColor: course?.color }}>{course?.number}</span><span className="text-[11px] font-bold text-bread-900/55">{course?.name} · 第 {(article.chapter ?? 0) + 1} 章</span></div>
              <span className="font-mono text-[9px] text-bread-900/35">总进度 {index + 1} / {all.length}</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-bread-900/8"><span className="block h-full rounded-full bg-bread-500" style={{ width: `${progress}%` }} /></div>
            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-bread-900 md:text-[42px]">{cleanTitle(article.title)}</h1>
            <p className="mt-5 text-base leading-8 text-bread-900/58">{article.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-bread-900/40"><span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{article.date}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />约 {article.readMin} 分钟</span><span className="inline-flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" />{article.codeLines} 行代码</span><span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" />难度 {"★".repeat(article.difficulty ?? 1)}</span></div>
            <div className="mt-6"><SeriesMobileMenu articles={all} activeSlug={article.slug} /></div>
          </header>

          <div className="py-8 md:py-10"><ArticleBody content={article.content} /></div>

          <div className="border-t border-bread-900/10 pt-7">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-bread-900/45"><CheckCircle2 className="h-4 w-4 text-bread-700" />本章完成后，继续装下一块能力</div>
            <div className="grid gap-3 md:grid-cols-2">
              {previous ? <Link href={breadChapterPath(previous.slug)} prefetch className="group rounded-xl border border-bread-900/10 bg-white p-4 hover:border-bread-400"><span className="flex items-center gap-1 text-[10px] font-bold text-bread-700"><ArrowLeft className="h-3 w-3" /> 上一章</span><span className="mt-2 block line-clamp-2 text-sm font-bold text-bread-900 group-hover:text-bread-700">{cleanTitle(previous.title)}</span></Link> : <Link href={BREAD_SERIES_PATH} className="group rounded-xl border border-bread-900/10 bg-white p-4"><span className="flex items-center gap-1 text-[10px] font-bold text-bread-700"><ArrowLeft className="h-3 w-3" /> 课程主页</span><span className="mt-2 block text-sm font-bold text-bread-900">查看完整学习地图</span></Link>}
              {next ? <Link href={breadChapterPath(next.slug)} prefetch className="group rounded-xl border border-bread-900/10 bg-white p-4 text-right hover:border-bread-400"><span className="flex items-center justify-end gap-1 text-[10px] font-bold text-bread-700">下一章 <ArrowRight className="h-3 w-3" /></span><span className="mt-2 block line-clamp-2 text-sm font-bold text-bread-900 group-hover:text-bread-700">{cleanTitle(next.title)}</span></Link> : <Link href={BREAD_SERIES_PATH} className="group rounded-xl border border-bread-900/10 bg-bread-100/60 p-4 text-right"><span className="flex items-center justify-end gap-1 text-[10px] font-bold text-bread-700">完成 <ArrowRight className="h-3 w-3" /></span><span className="mt-2 block text-sm font-bold text-bread-900">回到课程主页</span></Link>}
            </div>
          </div>
        </div>
      </article>

      <aside className="hidden h-[calc(100vh-64px)] min-w-0 overflow-x-hidden border-l border-bread-900/10 bg-[#FFFDF7]/80 px-5 py-7 xl:sticky xl:top-16 xl:block xl:overflow-y-auto"><TocSidebar items={toc} /></aside>
    </div>
  );
}

function cleanTitle(title: string) {
  return title.replace(/^第\s*\d+\s*章\s*[·—-]?\s*/, "");
}
