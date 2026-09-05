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
      className="group flex flex-col gap-2 rounded-xl border border-bread-900/10 bg-white/85 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-bread-400 hover:bg-white hover:shadow-soft"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-bread-900/60">
        <span className="rounded-full bg-bread-100 px-2.5 py-0.5 font-medium text-bread-700">
          {item.source}
        </span>
        <span>{formatDate(item.date)}</span>
        {item.lang === "en" && (
          <span className="rounded-full border border-bread-200 px-1.5 text-[10px] text-bread-900/50">
            EN
          </span>
        )}
      </div>
      <h3 className="font-display text-base font-bold leading-snug text-bread-900 transition-colors group-hover:text-bread-600">
        {item.title}
      </h3>
      {item.summary ? (
        <div className="mt-1 rounded-lg bg-bread-50 px-3 py-2 text-xs leading-6 text-bread-900/75">
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-bread-700">
            <Sparkles className="h-3 w-3" /> AI 导读
          </span>
          <p>{item.summary}</p>
        </div>
      ) : (
        item.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-bread-900/70">
            {item.excerpt}
          </p>
        )
      )}
      <span className="mt-1 inline-flex items-center gap-0.5 text-xs text-bread-900/50 transition-colors group-hover:text-bread-600">
        阅读原文 <ArrowUpRight className="h-3 w-3" />
      </span>
    </a>
  );
}
