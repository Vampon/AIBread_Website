"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ArticleListItem } from "@/components/ArticleListItem";
import type { Article } from "@/lib/articles";

export function BlogList({ articles, tags }: { articles: Article[]; tags: string[] }) {
  const [activeTag, setActiveTag] = useState("全部");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const counts = useMemo(() => Object.fromEntries(tags.map((tag) => [tag, tag === "全部" ? articles.length : articles.filter((article) => article.tag === tag).length])), [articles, tags]);
  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return articles.filter((article) => (activeTag === "全部" || article.tag === activeTag) && (!q || article.title.toLowerCase().includes(q) || article.excerpt.toLowerCase().includes(q) || article.tag.toLowerCase().includes(q)));
  }, [articles, activeTag, deferred]);

  return (
    <section className="container-page mt-8 pb-10" aria-labelledby="article-library-title">
      <h2 id="article-library-title" className="sr-only">文章列表</h2>
      <div className="grid gap-7 lg:grid-cols-[210px_1fr] lg:gap-9">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bread-900/40">Browse by topic</p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
            {tags.map((tag) => (
              <button key={tag} type="button" onClick={() => setActiveTag(tag)} aria-pressed={activeTag === tag} className={`flex shrink-0 items-center justify-between gap-5 rounded-xl px-4 py-2.5 text-left text-sm transition-all lg:w-full ${activeTag === tag ? "bg-bread-900 font-bold text-white" : "text-bread-900/60 hover:bg-white hover:text-bread-900"}`}>
                <span>{tag}</span><span className={`font-mono text-[10px] ${activeTag === tag ? "text-white/45" : "text-bread-900/35"}`}>{String(counts[tag]).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 hidden rounded-xl border border-bread-900/10 bg-bread-100/55 p-4 lg:block"><p className="text-xs font-bold text-bread-900">公众号文章归档</p><p className="mt-2 text-[11px] leading-5 text-bread-900/55">先整理了一批值得长期保留的内容，之后还会继续补充。</p></div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-bread-900/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-bold text-bread-900">{activeTag === "全部" ? "全部文章" : activeTag}</h2><p className="mt-1 text-xs text-bread-900/45">共 {filtered.length} 篇，按发布时间排序</p></div>
            <label className="relative block w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bread-900/35" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或关键词" className="w-full rounded-full border border-bread-900/10 bg-white py-2.5 pl-10 pr-10 text-sm text-bread-900 outline-none placeholder:text-bread-900/35 focus:border-bread-500" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="absolute right-3 top-1/2 -translate-y-1/2 text-bread-900/35 hover:text-bread-900"><X className="h-4 w-4" /></button>}
            </label>
          </div>
          {filtered.length > 0 ? <div className="mt-5 grid gap-3 xl:grid-cols-2">{filtered.map((article) => <ArticleListItem key={article.slug} article={article} compact />)}</div> : <div className="surface-card mt-6 py-20 text-center"><p className="font-display text-2xl text-bread-900">这里还没有内容</p><p className="mt-2 text-sm text-bread-900/45">换个分类或关键词再试试。</p></div>}
        </div>
      </div>
    </section>
  );
}
