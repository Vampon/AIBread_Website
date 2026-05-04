"use client";

import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { Search, X, LayoutGrid, List } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleListItem } from "@/components/ArticleListItem";
import type { Article } from "@/lib/articles";

type ViewMode = "card" | "list";
const VIEW_STORAGE_KEY = "aibread.blog.view";

export function BlogList({
  articles,
  tags,
}: {
  articles: Article[];
  tags: string[];
}) {
  const [activeTag, setActiveTag] = useState<string>("全部");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("card");
  const deferred = useDeferredValue(query);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "card" || saved === "list") setView(saved);
  }, []);

  const updateView = (next: ViewMode) => {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const filtered = useMemo(() => {
    let list = articles;
    if (activeTag !== "全部") {
      list = list.filter((a) => a.tag === activeTag);
    }
    const q = deferred.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeTag, deferred]);

  return (
    <>
      <div className="container-page">
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "border-bread-500 bg-bread-500 text-white shadow-sm"
                      : "border-bread-200 bg-white text-bread-900/70 hover:border-bread-400 hover:text-bread-900"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bread-900/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜文章标题、摘要、标签…"
                className="w-full rounded-full border border-bread-200 bg-white py-2 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-bread-900/40 focus:border-bread-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-bread-900/40 hover:bg-bread-50 hover:text-bread-700"
                  aria-label="清空搜索"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div
              role="group"
              aria-label="切换视图"
              className="flex shrink-0 items-center rounded-full border border-bread-200 bg-white p-0.5"
            >
              <button
                type="button"
                onClick={() => updateView("card")}
                aria-pressed={view === "card"}
                aria-label="卡片视图"
                title="卡片视图"
                className={`flex h-8 w-9 items-center justify-center rounded-full transition-colors ${
                  view === "card"
                    ? "bg-bread-500 text-white shadow-sm"
                    : "text-bread-900/60 hover:text-bread-900"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => updateView("list")}
                aria-pressed={view === "list"}
                aria-label="列表视图"
                title="列表视图"
                className={`flex h-8 w-9 items-center justify-center rounded-full transition-colors ${
                  view === "list"
                    ? "bg-bread-500 text-white shadow-sm"
                    : "text-bread-900/60 hover:text-bread-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {query && (
          <p className="mt-3 text-xs text-bread-900/60">
            搜索 <span className="font-mono text-bread-700">"{query}"</span>，
            找到 {filtered.length} 篇
          </p>
        )}
      </div>

      <section className="container-page mt-8 pb-16">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-bread-900/50">
            没有匹配的文章。换个关键词或分类试试?
          </p>
        ) : view === "card" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {filtered.map((article) => (
              <ArticleListItem key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
