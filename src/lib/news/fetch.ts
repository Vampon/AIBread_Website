import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { setDefaultResultOrder } from "node:dns";
import { newsSources } from "./sources";
import type { NewsItem, NewsSource } from "./types";

// Several Chinese media CDNs still behave inconsistently on IPv6 from serverless
// runtimes. Prefer IPv4 so one slow DNS route does not empty the Chinese channel.
setDefaultResultOrder("ipv4first");

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

const matchesKeywords = (source: NewsSource, text: string) =>
  !source.keywords?.length ||
  source.keywords.some((keyword) =>
    text.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
  );

const toIsoDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const normalized = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(value)
    ? `${value.replaceAll("/", "-").replace(" ", "T")}:00+08:00`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

async function fetchRss(source: NewsSource): Promise<NewsItem[]> {
  const xml = await fetchText(source.url);
  const feed = await parser.parseString(xml);
  const out: NewsItem[] = [];
  for (const it of feed.items.slice(0, source.maxItems ?? 15)) {
    if (!it.link || !it.title) continue;
    const raw = it.contentSnippet ?? it.content ?? it.summary ?? "";
    const title = stripHtml(it.title);
    const excerpt = truncate(stripHtml(raw), 160);
    if (!matchesKeywords(source, `${title} ${excerpt}`)) continue;
    out.push({
      id: hashId(it.link),
      title,
      url: it.link,
      source: source.name,
      sourceId: source.id,
      date: toIsoDate(it.isoDate ?? it.pubDate),
      excerpt,
      lang: source.lang,
    });
  }
  return out;
}

type JiqizhixinResponse = {
  articles?: Array<{
    title?: string;
    slug?: string;
    publishedAt?: string;
    content?: string;
  }>;
};

type WordpressPost = {
  link?: string;
  date?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
};

const fetchText = async (url: string) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/rss+xml, application/xml, text/xml, */*",
          "User-Agent": "Mozilla/5.0 (compatible; AIBread-Daily/1.0; +https://aibread.site)",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
};

const fetchJson = async <T>(url: string) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; AIBread-Daily/1.0; +https://aibread.site)",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
};

async function fetchJiqizhixin(source: NewsSource): Promise<NewsItem[]> {
  const payload = await fetchJson<JiqizhixinResponse>(source.url);
  return (payload.articles ?? [])
    .slice(0, source.maxItems ?? 20)
    .filter((item) => item.slug && item.title)
    .map((item) => {
      const url = `https://www.jiqizhixin.com/articles/${item.slug}`;
      return {
        id: hashId(url),
        title: stripHtml(item.title ?? ""),
        url,
        source: source.name,
        sourceId: source.id,
        date: toIsoDate(item.publishedAt),
        excerpt: truncate(stripHtml(item.content ?? ""), 160),
        lang: source.lang,
      };
    });
}

async function fetchWordpress(source: NewsSource): Promise<NewsItem[]> {
  const posts = await fetchJson<WordpressPost[]>(source.url);
  return posts
    .slice(0, source.maxItems ?? 20)
    .filter((post) => post.link && post.title?.rendered)
    .map((post) => ({
      id: hashId(post.link ?? ""),
      title: stripHtml(post.title?.rendered ?? ""),
      url: post.link ?? "",
      source: source.name,
      sourceId: source.id,
      date: toIsoDate(post.date ? `${post.date}+08:00` : undefined),
      excerpt: truncate(stripHtml(post.excerpt?.rendered ?? ""), 160),
      lang: source.lang,
    }));
}

async function fetchOne(source: NewsSource): Promise<NewsItem[]> {
  if (source.kind === "jiqizhixin-api") return fetchJiqizhixin(source);
  if (source.kind === "wordpress-api") return fetchWordpress(source);
  return fetchRss(source);
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
    else failedSources.push(newsSources[i].name);
  });
  return { items, failedSources };
}
