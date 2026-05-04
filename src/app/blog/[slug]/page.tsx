import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import {
  getAllArticles,
  getArticleBySlug,
  extractToc,
} from "@/lib/articles";
import { ArticleBody } from "@/components/ArticleBody";
import { TocSidebar } from "@/components/TocSidebar";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "找不到这篇文章 — AI面包君" };
  return {
    title: `${article.title} — AI面包君`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      images: [article.cover],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const toc = extractToc(article.content);

  // 同标签下的相邻文章
  const all = getAllArticles();
  const sameTag = all.filter((a) => a.tag === article.tag && a.slug !== article.slug).slice(0, 3);

  // 上一篇 / 下一篇（按发布顺序）
  const idx = all.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="container-page py-10 md:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm font-medium text-bread-700 transition-colors hover:text-bread-500"
      >
        <ArrowLeft className="h-4 w-4" />
        回到博客
      </Link>

      <header className="mt-6">
        <span className="inline-block rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
          {article.tag}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-bread-900 md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-bread-900/70">
          {article.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-bread-900/55">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {article.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            约 {article.readMin} 分钟
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
        <div className="min-w-0">
          <ArticleBody content={article.content} />

          <div className="mt-16 grid gap-3 border-t border-bread-100 pt-8 md:grid-cols-2">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="group rounded-2xl border border-bread-100 bg-white p-4 transition-all hover:-translate-y-1 hover:border-bread-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-1 text-xs text-bread-700/70">
                  <ArrowLeft className="h-3 w-3" />
                  上一篇
                </div>
                <div className="mt-1.5 text-sm font-semibold text-bread-900 group-hover:text-bread-700">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="group rounded-2xl border border-bread-100 bg-white p-4 text-right transition-all hover:-translate-y-1 hover:border-bread-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-end gap-1 text-xs text-bread-700/70">
                  下一篇
                  <ArrowRight className="h-3 w-3" />
                </div>
                <div className="mt-1.5 text-sm font-semibold text-bread-900 group-hover:text-bread-700">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {sameTag.length > 0 && (
            <div className="mt-12">
              <h3 className="text-base font-bold text-bread-900">
                同标签下还有这些
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {sameTag.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-bread-100 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-bread-300"
                    >
                      <span className="truncate font-medium text-bread-900 group-hover:text-bread-700">
                        {a.title}
                      </span>
                      <span className="shrink-0 text-xs text-bread-900/50">
                        {a.date}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TocSidebar items={toc} />
          </div>
        </aside>
      </div>
    </article>
  );
}
