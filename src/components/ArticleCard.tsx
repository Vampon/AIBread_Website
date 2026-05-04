import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-bread-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden md:h-56">
        <Image
          src={article.cover}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full bg-bread-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
          {article.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-bread-900 transition-colors group-hover:text-bread-600">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-bread-900/70">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-bread-900/50">
          <span>{article.date}</span>
          <span>约 {article.readMin} 分钟</span>
        </div>
      </div>
    </Link>
  );
}
