import { ArrowUpRight, Sparkles } from "lucide-react";
import type { NewsItem } from "@/lib/news/types";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diffH = (now - d.getTime()) / 3_600_000;
  if (diffH < 1) return "刚刚";
  if (diffH < 24) return `${Math.floor(diffH)} 小时前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

export function NewsItemCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group grid gap-2 px-4 py-4 transition-colors hover:bg-bread-50/80 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-4 sm:px-5"
    >
      <div className="flex flex-wrap items-center gap-2 self-start text-xs text-bread-900/60 sm:block">
        <span className="inline-flex rounded-full bg-bread-100 px-2.5 py-1 font-medium text-bread-700">
          {item.source}
        </span>
        <span className="sm:mt-2 sm:block">{formatDate(item.date)}</span>
        {item.lang === "en" && (
          <span className="rounded-full border border-bread-200 px-1.5 text-[10px] text-bread-900/50 sm:mt-1 sm:inline-flex">
            EN
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-bold leading-snug text-bread-900 transition-colors group-hover:text-bread-600 sm:text-lg">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-bread-900/68">
            <Sparkles className="mr-1 inline h-3 w-3 text-bread-600" />{item.summary}
          </p>
        ) : item.excerpt ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-bread-900/62">{item.excerpt}</p>
        ) : null}
      </div>
      <span className="inline-flex items-center gap-0.5 self-center text-xs text-bread-900/45 transition-colors group-hover:text-bread-600">
        原文 <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
