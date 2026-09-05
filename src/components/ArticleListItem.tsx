import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";

export function ArticleListItem({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className={`group flex flex-col border border-bread-900/10 bg-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-bread-400 hover:bg-white hover:shadow-soft sm:flex-row sm:items-stretch ${compact ? "gap-3 rounded-xl p-3 sm:gap-4" : "gap-4 rounded-2xl p-4 sm:gap-5"}`}
    >
      <div className={`relative w-full shrink-0 overflow-hidden rounded-xl ${compact ? "h-28 sm:h-24 sm:w-32" : "h-40 sm:h-28 sm:w-40 md:w-44"}`}>
        <Image
          src={article.cover}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 224px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs text-bread-900/50">
          <span className="font-bold text-bread-700">
            {article.tag}
          </span>
          <span>{article.date}</span>
          <span>· 约 {article.readMin} 分钟</span>
        </div>
        <h3 className={`line-clamp-2 font-display font-bold leading-snug text-bread-900 transition-colors group-hover:text-bread-600 ${compact ? "mt-1.5 text-[15px]" : "mt-2 text-lg md:text-xl"}`}>
          {article.title}
        </h3>
        {!compact && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bread-900/70 sm:line-clamp-3">{article.excerpt}</p>}
      </div>
    </Link>
  );
}
