import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { newsSources } from "./sources";
import type { NewsItem, NewsSource } from "./types";

const parser = new Parser({
  timeout: 12_000,
  headers: { "User-Agent": "AIBread-Daily/1.0 (+https://aibread.site)" },
});

const stripHtml = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n).trimEnd() + "…";

const hashId = (url: string) =>
  createHash("sha1").update(url).digest("hex").slice(0, 12);

async function fetchOne(source: NewsSource): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url);
  const out: NewsItem[] = [];
  for (const it of feed.items.slice(0, 15)) {
    if (!it.link || !it.title) continue;
    const date = it.isoDate ?? it.pubDate ?? new Date().toISOString();
    const raw = it.contentSnippet ?? it.content ?? it.summary ?? "";
    out.push({
      id: hashId(it.link),
      title: stripHtml(it.title),
      url: it.link,
      source: source.name,
      sourceId: source.id,
      date,
      excerpt: truncate(stripHtml(raw), 160),
      lang: source.lang,
    });
  }
  return out;
}

export async function fetchAllNews(): Promise<{
  items: NewsItem[];
  failedSources: string[];
}> {
  const results = await Promise.allSettled(newsSources.map(fetchOne));
  const items: NewsItem[] = [];
  const failedSources: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else failedSources.push(newsSources[i].id);
  });
  return { items, failedSources };
}
