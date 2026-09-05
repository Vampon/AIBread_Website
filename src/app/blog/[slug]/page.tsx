import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { getAllArticles, getArticleBySlug, extractToc } from "@/lib/articles";
import { ArticleBody } from "@/components/ArticleBody";
import { BlogReaderSidebar } from "@/components/BlogReaderSidebar";
import { TocSidebar } from "@/components/TocSidebar";

export function generateStaticParams() { return getAllArticles().map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "找不到这篇文章" };
  return { title: article.title, description: article.excerpt, openGraph: { title: article.title, description: article.excerpt, type: "article", publishedTime: article.date, images: [article.cover] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const all = getAllArticles();
  const toc = extractToc(article.content);
  const index = all.findIndex((item) => item.slug === article.slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const sidebarArticles = all.map(({ slug: articleSlug, title, tag, date }) => ({ slug: articleSlug, title, tag, date }));

  return (
    <div className="mx-auto grid w-full max-w-[1720px] xl:grid-cols-[270px_minmax(0,1fr)_220px]">
      <BlogReaderSidebar articles={sidebarArticles} activeSlug={article.slug} activeTag={article.tag} />

      <article className="min-w-0 border-bread-900/10 bg-white/45 px-5 py-7 md:px-10 md:py-10 xl:px-12">
        <div className="mx-auto max-w-[850px]">
          <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-bread-700 hover:text-bread-900"><ArrowLeft className="h-3.5 w-3.5" /> 全部文章</Link>
          <header className="mt-6 border-b border-bread-900/10 pb-7">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-bread-100 px-3 py-1 text-[11px] font-bold text-bread-700">{article.tag}</span><span className="text-[11px] text-bread-900/35">AI面包君</span></div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-bread-900 md:text-[42px]">{article.title}</h1>
            <p className="mt-5 text-base leading-8 text-bread-900/58">{article.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-bread-900/40"><span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{article.date}</span><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />约 {article.readMin} 分钟</span></div>
          </header>

          <div className="py-8 md:py-10"><ArticleBody content={article.content} /></div>

          <div className="grid gap-3 border-t border-bread-900/10 pt-7 md:grid-cols-2">
            {previous ? <Link href={`/blog/${previous.slug}`} className="group rounded-xl border border-bread-900/10 bg-white p-4 hover:border-bread-400"><span className="flex items-center gap-1 text-[10px] font-bold text-bread-700"><ArrowLeft className="h-3 w-3" /> 上一篇</span><span className="mt-2 block line-clamp-2 text-sm font-bold text-bread-900 group-hover:text-bread-700">{previous.title}</span></Link> : <div />}
            {next ? <Link href={`/blog/${next.slug}`} className="group rounded-xl border border-bread-900/10 bg-white p-4 text-right hover:border-bread-400"><span className="flex items-center justify-end gap-1 text-[10px] font-bold text-bread-700">下一篇 <ArrowRight className="h-3 w-3" /></span><span className="mt-2 block line-clamp-2 text-sm font-bold text-bread-900 group-hover:text-bread-700">{next.title}</span></Link> : <div />}
          </div>
        </div>
      </article>

      <aside className="hidden h-[calc(100vh-64px)] border-l border-bread-900/10 bg-white/55 px-5 py-7 xl:sticky xl:top-16 xl:block xl:overflow-y-auto"><TocSidebar items={toc} /></aside>
    </div>
  );
}
