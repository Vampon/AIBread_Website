"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Radio, ShieldCheck } from "lucide-react";
import type { NewsItem } from "@/lib/news/types";
import { NewsItemCard } from "./NewsItemCard";

type View = "zh" | "official" | "all";

const chinaDayKey = (value: string | Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const friendlyDay = (key: string) => {
  const today = chinaDayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = chinaDayKey(yesterdayDate);
  if (key === today) return "今天";
  if (key === yesterday) return "昨天";
  const [, month, day] = key.split("-");
  return `${Number(month)}月${Number(day)}日`;
};

const views: Array<{ id: View; label: string; note: string }> = [
  { id: "zh", label: "中文精选", note: "默认" },
  { id: "official", label: "官方原声", note: "英文" },
  { id: "all", label: "全部信号", note: "汇总" },
];

export function NewsBoard({
  items,
  failedSources,
  generatedAt,
}: {
  items: NewsItem[];
  failedSources: string[];
  generatedAt: string;
}) {
  const [view, setView] = useState<View>("zh");
  const [sourceId, setSourceId] = useState("all");

  const languageItems = useMemo(
    () => items.filter((item) => {
      if (view === "zh") return item.lang === "zh";
      if (view === "official") return item.lang === "en";
      return true;
    }),
    [items, view],
  );

  const viewItems = useMemo(() => {
    return sourceId === "all"
      ? languageItems
      : languageItems.filter((item) => item.sourceId === sourceId);
  }, [languageItems, sourceId]);

  const sources = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; lang: "zh" | "en" }>();
    for (const item of items) {
      const current = map.get(item.sourceId);
      map.set(item.sourceId, {
        id: item.sourceId,
        name: item.source,
        count: (current?.count ?? 0) + 1,
        lang: item.lang,
      });
    }
    return Array.from(map.values()).filter((source) => {
      if (view === "zh") return source.lang === "zh";
      if (view === "official") return source.lang === "en";
      return true;
    });
  }, [items, view]);

  const groups = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    for (const item of viewItems) {
      const key = chinaDayKey(item.date);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [viewItems]);

  const updated = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(generatedAt));

  const changeView = (next: View) => {
    setView(next);
    setSourceId("all");
  };

  return (
    <div className="grid gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-bread-900/10 bg-white/80 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-xs font-semibold tracking-[0.14em] text-bread-900/50">
            <Radio className="h-3.5 w-3.5 text-bread-600" /> 接收频道
          </div>
          <div className="space-y-1">
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeView(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  view === item.id
                    ? "bg-bread-900 font-semibold text-bread-50"
                    : "text-bread-900/68 hover:bg-bread-100"
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] ${view === item.id ? "text-bread-200" : "text-bread-900/35"}`}>
                  {item.note}
                </span>
              </button>
            ))}
          </div>

          <div className="my-3 h-px bg-bread-900/10" />
          <button
            type="button"
            onClick={() => setSourceId("all")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
              sourceId === "all" ? "bg-bread-100 font-semibold text-bread-800" : "text-bread-900/60 hover:bg-bread-50"
            }`}
          >
            <span>全部来源</span><span>{languageItems.length}</span>
          </button>
          {sources.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => setSourceId(source.id)}
              className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                sourceId === source.id ? "bg-bread-100 font-semibold text-bread-800" : "text-bread-900/60 hover:bg-bread-50"
              }`}
            >
              <span className="truncate pr-2">{source.name}</span><span>{source.count}</span>
            </button>
          ))}

          <div className="mt-4 rounded-xl bg-bread-50 p-3 text-xs leading-5 text-bread-900/55">
            <p className="flex items-center gap-1.5 font-medium text-bread-800">
              <ShieldCheck className="h-3.5 w-3.5" /> 只展示标题、短摘与原文链接
            </p>
            <p className="mt-1">每天北京时间 08:00 自动更新。</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bread-900/10 bg-bread-50/70 px-4 py-3 text-xs text-bread-900/55">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            本轮收录 {viewItems.length} 条 · 北京时间 {updated} 更新
          </span>
          {failedSources.length > 0 && <span>暂不可达：{failedSources.join("、")}</span>}
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bread-900/20 py-20 text-center text-sm text-bread-900/50">
            这个频道暂时没有新消息，稍后再来看看。
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(([day, group]) => (
              <section key={day}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="font-display text-xl font-bold text-bread-900">{friendlyDay(day)}</h2>
                  <span className="rounded-full bg-bread-100 px-2 py-0.5 text-xs text-bread-900/50">{group.length} 条</span>
                  <div className="h-px flex-1 bg-bread-900/10" />
                </div>
                <div className="divide-y divide-bread-900/10 overflow-hidden rounded-2xl border border-bread-900/10 bg-white/85 shadow-sm">
                  {group.map((item) => <NewsItemCard key={item.id} item={item} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
