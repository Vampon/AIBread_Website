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

async function buildBundle(): Promise<NewsBundle> {
  const { items, failedSources } = await fetchAllNews();
  let curated = sortByDateDesc(dedupe(items)).slice(0, 40);
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
