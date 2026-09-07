export type NewsSource = {
  id: string;
  name: string;
  url: string;
  category: "official" | "media" | "community" | "domestic";
  lang: "zh" | "en";
  kind?: "rss" | "jiqizhixin-api" | "wordpress-api";
  keywords?: string[];
  maxItems?: number;
};

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceId: string;
  date: string;
  excerpt: string;
  summary?: string;
  lang: "zh" | "en";
};

export type NewsBundle = {
  generatedAt: string;
  items: NewsItem[];
  failedSources: string[];
};
