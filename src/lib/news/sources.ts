import type { NewsSource } from "./types";

export const newsSources: NewsSource[] = [
  {
    id: "anthropic",
    name: "Anthropic 官方",
    url: "https://www.anthropic.com/news/rss.xml",
    category: "official",
    lang: "en",
  },
  {
    id: "openai",
    name: "OpenAI 博客",
    url: "https://openai.com/blog/rss.xml",
    category: "official",
    lang: "en",
  },
  {
    id: "huggingface",
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "official",
    lang: "en",
  },
  {
    id: "hn-ai",
    name: "Hacker News (AI)",
    url: "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT&count=20",
    category: "community",
    lang: "en",
  },
  {
    id: "mit-tr-ai",
    name: "MIT Tech Review · AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    category: "media",
    lang: "en",
  },
  {
    id: "jiqizhixin",
    name: "机器之心",
    url: "https://rsshub.app/jiqizhixin/news",
    category: "domestic",
    lang: "zh",
  },
  {
    id: "qbitai",
    name: "量子位",
    url: "https://rsshub.app/qbitai/news",
    category: "domestic",
    lang: "zh",
  },
];
