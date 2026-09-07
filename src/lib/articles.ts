import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  tag: string;
  date: string;
  cover: string;
  readMin: number;
  kind?: "article" | "tutorial";
  series?: string;
  seriesSlug?: string;
  course?: string;
  courseSlug?: string;
  courseOrder?: number;
  chapter?: number;
  seriesOrder?: number;
  difficulty?: number;
  codeLines?: number;
};

export type Article = ArticleFrontmatter & {
  content: string; // raw markdown body
};

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

let cached: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (cached) return cached;
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"));

  const articles: Article[] = files.map((f) => {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as Partial<ArticleFrontmatter>;
    if (!fm.slug) throw new Error(`Article ${f} missing slug in frontmatter`);
    if (!fm.title) throw new Error(`Article ${f} missing title in frontmatter`);
    return {
      title: fm.title,
      slug: fm.slug,
      excerpt: fm.excerpt ?? "",
      tag: fm.tag ?? "未分类",
      date: fm.date ?? "1970-01-01",
      cover: fm.cover ?? "/placeholders/cover-1.svg",
      readMin: fm.readMin ?? Math.max(2, Math.round(parsed.content.length / 700)),
      kind: fm.kind ?? "article",
      series: fm.series,
      seriesSlug: fm.seriesSlug,
      course: fm.course,
      courseSlug: fm.courseSlug,
      courseOrder: fm.courseOrder,
      chapter: fm.chapter,
      seriesOrder: fm.seriesOrder,
      difficulty: fm.difficulty,
      codeLines: fm.codeLines,
      content: parsed.content,
    };
  });

  articles.sort((a, b) => (a.date < b.date ? 1 : -1));
  cached = articles;
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getRegularArticles(): Article[] {
  return getAllArticles().filter((article) => article.kind !== "tutorial");
}

export function getSeriesArticles(seriesSlug: string): Article[] {
  return getAllArticles()
    .filter((article) => article.seriesSlug === seriesSlug)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  getRegularArticles().forEach((a) => set.add(a.tag));
  return ["全部", ...Array.from(set)];
}

/** 从 markdown 内容里提取 h2/h3 作为 TOC（slug 用 rehype-slug 同样的算法） */
export function extractToc(markdown: string): Array<{
  level: 2 | 3;
  text: string;
  id: string;
}> {
  const lines = markdown.split(/\r?\n/);
  const toc: Array<{ level: 2 | 3; text: string; id: string }> = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length === 2 ? 2 : 3;
    const text = m[2].trim();
    toc.push({ level: level as 2 | 3, text, id: slugify(text) });
  }
  return toc;
}

/** 与 github-slugger / rehype-slug 默认行为兼容的简化版 slug 生成 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
