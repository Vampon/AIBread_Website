import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";

export function ArticleListItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-bread-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bread-300 hover:shadow-lg sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-48 md:h-36 md:w-56">
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
          <span className="rounded-full bg-bread-100 px-2.5 py-0.5 font-medium text-bread-700">
            {article.tag}
          </span>
          <span>{article.date}</span>
          <span>· 约 {article.readMin} 分钟</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-bread-900 transition-colors group-hover:text-bread-600 md:text-xl">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bread-900/70 sm:line-clamp-3">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}
