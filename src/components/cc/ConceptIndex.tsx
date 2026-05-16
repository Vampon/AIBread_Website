import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { conceptOrder, concepts } from "@/data/cc/concepts";
import { getAllArticles } from "@/lib/articles";

/**
 * 概念索引网格（server component）。
 * 已收录 + v2 占位卡，每张卡链向相关博文（不存在则显示"草稿中"）。
 */
export function ConceptIndex() {
  const articleMap: Record<string, string> = {};
  for (const a of getAllArticles()) articleMap[a.slug] = a.title;

  return (
    <section className="container-page py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold text-bread-900">
          仿真器覆盖的 9 个核心概念
        </h2>
        <p className="mt-3 text-bread-900/70">
          打 ✓ 的概念在上面终端里能直接演示；灰色锁的是 v2 才解锁，先看博文了解原理。每张卡都挂着对应的延伸阅读。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {conceptOrder.map((id) => {
          const c = concepts[id];
          if (!c) return null;
          const cardCls = c.implemented
            ? "rounded-2xl border border-bread-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            : "rounded-2xl border border-slate-200 bg-slate-50/60";
          return (
            <article key={id} className={`${cardCls} p-5`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-3xl">{c.emoji}</span>
                {c.implemented ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700">
                    <Check className="h-2.5 w-2.5" />
                    已收录
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
                    <Lock className="h-2.5 w-2.5" />
                    v2 解锁
                  </span>
                )}
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-bread-900">
                {c.title}
              </h3>
              <p className="mb-4 line-clamp-2 text-sm text-bread-900/70">
                {c.tagline}
              </p>
              {c.relatedSlugs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.relatedSlugs.map((slug) => {
                    const title = articleMap[slug];
                    if (!title) {
                      return (
                        <span
                          key={slug}
                          className="rounded-full bg-bread-50 px-2 py-0.5 text-[11px] text-bread-700/60"
                          title={slug}
                        >
                          博文草稿中
                        </span>
                      );
                    }
                    return (
                      <Link
                        key={slug}
                        href={`/blog/${slug}`}
                        className="rounded-full bg-bread-100 px-2 py-0.5 text-[11px] font-medium text-bread-700 transition-colors hover:bg-bread-200"
                      >
                        {title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
