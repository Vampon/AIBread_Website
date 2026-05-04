import { getNewsBundle } from "@/lib/news/curate";
import { NewsItemCard } from "@/components/NewsItemCard";
import type { NewsItem } from "@/lib/news/types";

export const metadata = {
  title: "AI 日刊 — AI面包君",
  description: "每日聚合各大 AI 信息源的热点。一键直达原文。",
};

export const revalidate = 86_400;

const groupByDay = (items: NewsItem[]) => {
  const map = new Map<string, NewsItem[]>();
  for (const it of items) {
    const d = new Date(it.date);
    const key = Number.isNaN(d.getTime())
      ? "未知日期"
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(it);
    map.set(key, arr);
  }
  return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
};

const friendlyDay = (key: string) => {
  if (key === "未知日期") return key;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const yestKey = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  if (key === todayKey) return "今天";
  if (key === yestKey) return "昨天";
  const [, m, d] = key.split("-");
  return `${parseInt(m, 10)}月${parseInt(d, 10)}日`;
};

export default async function NewsPage() {
  const bundle = await getNewsBundle();
  const groups = groupByDay(bundle.items);
  const updated = new Date(bundle.generatedAt);

  return (
    <>
      <section className="container-page pt-16 pb-2 md:pt-20">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
            AI 日刊 · DAILY
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-bread-900 md:text-5xl">
            今日 AI 热点
          </h1>
          <p className="mt-4 text-base leading-relaxed text-bread-900/70 md:text-lg">
            自动聚合 Anthropic / OpenAI / Hugging Face / 机器之心 / 量子位等信息源，每日一更。点标题直达原文。
          </p>
          <p className="mt-3 text-xs text-bread-900/50">
            更新于 {updated.toLocaleString("zh-CN", { hour12: false })}
            {bundle.failedSources.length > 0 && (
              <span className="ml-2 text-bread-700/70">
                · 部分源暂不可达：{bundle.failedSources.join("、")}
              </span>
            )}
          </p>
        </div>
      </section>

      <section className="container-page mt-10 pb-20">
        {groups.length === 0 ? (
          <p className="py-20 text-center text-bread-900/50">
            还没拉到内容——刚部署的话稍等几分钟，cron 跑过一轮就会有了。
          </p>
        ) : (
          <div className="space-y-12">
            {groups.map(([day, items]) => (
              <div key={day}>
                <h2 className="mb-4 flex items-baseline gap-3 text-xl font-bold text-bread-900">
                  <span>{friendlyDay(day)}</span>
                  <span className="text-sm font-normal text-bread-900/50">
                    {items.length} 条
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <NewsItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
