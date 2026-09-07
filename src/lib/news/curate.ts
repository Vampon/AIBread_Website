import { unstable_cache } from "next/cache";
import { fetchAllNews } from "./fetch";
import { aiCurator } from "./ai";
import type { NewsBundle, NewsItem } from "./types";

export const NEWS_CACHE_TAG = "aibread-news";

const dedupe = (items: NewsItem[]) => {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of items) {
    const key = it.url || it.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
};

const sortByDateDesc = (items: NewsItem[]) =>
  [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date));

const capPerSource = (items: NewsItem[], cap: number) => {
  const counts = new Map<string, number>();
  return items.filter((item) => {
    const count = counts.get(item.sourceId) ?? 0;
    if (count >= cap) return false;
    counts.set(item.sourceId, count + 1);
    return true;
  });
};

async function buildBundle(): Promise<NewsBundle> {
  const { items, failedSources } = await fetchAllNews();
  const sorted = sortByDateDesc(dedupe(items));
  const chinese = capPerSource(sorted.filter((item) => item.lang === "zh"), 12).slice(0, 36);
  const officialOriginals = capPerSource(
    sorted.filter((item) => item.lang === "en"),
    4,
  ).slice(0, 12);
  let curated = [...chinese, ...officialOriginals];
  curated = await aiCurator(curated);
  return {
    generatedAt: new Date().toISOString(),
    items: curated,
    failedSources,
  };
}

export const getNewsBundle = unstable_cache(buildBundle, ["aibread-news"], {
  tags: [NEWS_CACHE_TAG],
  revalidate: 86_400,
});
