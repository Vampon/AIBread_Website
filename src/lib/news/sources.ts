import type { NewsSource } from "./types";

export const newsSources: NewsSource[] = [
  {
    id: "jiqizhixin",
    name: "机器之心",
    url: "https://www.jiqizhixin.com/api/article_library/articles.json?sort=time&page=1&per=20",
    category: "domestic",
    lang: "zh",
    kind: "jiqizhixin-api",
    maxItems: 20,
  },
  {
    id: "qbitai",
    name: "量子位",
    url: "https://www.qbitai.com/wp-json/wp/v2/posts?per_page=20&_fields=link,date,title,excerpt",
    category: "domestic",
    lang: "zh",
    kind: "wordpress-api",
    maxItems: 20,
  },
  {
    id: "leiphone",
    name: "雷峰网",
    url: "https://www.leiphone.com/feed",
    category: "domestic",
    lang: "zh",
    maxItems: 20,
    keywords: [
      "AI", "人工智能", "大模型", "智能体", "Agent", "机器学习", "机器人",
      "OpenAI", "Claude", "Gemini", "DeepSeek", "AIGC", "生成式", "算力",
    ],
  },
  {
    id: "oschina-ai",
    name: "开源中国 · AI",
    url: "https://www.oschina.net/news/rss",
    category: "domestic",
    lang: "zh",
    maxItems: 30,
    keywords: [
      "AI", "人工智能", "大模型", "智能体", "Agent", "机器学习", "机器人",
      "OpenAI", "Claude", "Gemini", "DeepSeek", "AIGC", "生成式", "LLM",
      "通义", "豆包", "智谱", "文心", "Kimi",
    ],
  },
  {
    id: "openai",
    name: "OpenAI 博客",
    url: "https://openai.com/news/rss.xml",
    category: "official",
    lang: "en",
    maxItems: 8,
  },
];
