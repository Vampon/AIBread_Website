"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Search, X } from "lucide-react";

export type ReaderArticle = { slug: string; title: string; tag: string; date: string };

export function BlogReaderSidebar({ articles, activeSlug, activeTag }: { articles: ReaderArticle[]; activeSlug: string; activeTag: string }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const filtered = lowered ? articles.filter((article) => article.title.toLowerCase().includes(lowered) || article.tag.toLowerCase().includes(lowered)) : articles;
    return Array.from(new Set(filtered.map((article) => article.tag))).map((tag) => ({ tag, articles: filtered.filter((article) => article.tag === tag) }));
  }, [articles, query]);

  return (
    <aside className="hidden h-[calc(100vh-64px)] min-w-0 border-r border-bread-900/10 bg-white/70 xl:sticky xl:top-16 xl:block xl:overflow-y-auto">
      <div className="border-b border-bread-900/10 p-5"><Link href="/blog" className="flex items-center gap-2 font-bold text-bread-900"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bread-500"><FileText className="h-4 w-4" /></span>文章目录</Link><label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-bread-900/30" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" className="w-full rounded-lg border border-bread-900/10 bg-white py-2 pl-9 pr-8 text-xs outline-none focus:border-bread-500" />{query && <button onClick={() => setQuery("")} type="button" aria-label="清空搜索" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bread-900/35"><X className="h-3.5 w-3.5" /></button>}</label></div>
      <nav aria-label="博客文章" className="p-3">
        {groups.length === 0 && <p className="px-3 py-10 text-center text-xs text-bread-900/40">没有找到相关文章</p>}
        {groups.map((group) => <details key={group.tag} open={Boolean(query) || group.tag === activeTag} className="group mb-1"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-xs font-bold text-bread-900/65 hover:bg-bread-50"><span>{group.tag}</span><span className="flex items-center gap-1.5 font-mono text-[9px] font-normal text-bread-900/30">{group.articles.length}<ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" /></span></summary><div className="ml-3 border-l border-bread-900/8 pl-2">{group.articles.map((article) => <Link key={article.slug} href={`/blog/${article.slug}`} title={article.title} className={`my-0.5 block truncate rounded-lg px-3 py-2 text-xs transition-colors ${article.slug === activeSlug ? "bg-bread-100 font-bold text-bread-900" : "text-bread-900/55 hover:bg-bread-50 hover:text-bread-900"}`}>{article.title}</Link>)}</div></details>)}
      </nav>
    </aside>
  );
}
