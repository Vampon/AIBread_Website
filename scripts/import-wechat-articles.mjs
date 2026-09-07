import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SOURCE_ROOT = path.resolve(process.argv[2] || "D:/商业/自媒体板块/公众号文章");
const PROJECT_ROOT = process.cwd();
const ARTICLE_DIR = path.join(PROJECT_ROOT, "content", "articles");
const ASSET_ROOT = path.join(PROJECT_ROOT, "public", "blog", "wechat");
const REPORT_DIR = path.join(PROJECT_ROOT, "content", "imports");
const WRITE = process.argv.includes("--write");

const curatedArticles = new Map([
  ["1-AI认知/AI为什么会胡说八道/AI为什么会胡说八道.md", ["AI 基础", "ai-basics"]],
  ["1-AI认知/为什么AI必须跑在显卡上/为什么AI必须跑在显卡上.md", ["AI 基础", "ai-basics"]],
  ["1-AI认知/AI学会思考了推理模型是怎么回事/AI学会思考了推理模型是怎么回事.md", ["AI 基础", "ai-basics"]],
  ["1-AI认知/什么是上下文窗口/什么是上下文窗口.md", ["AI 基础", "ai-basics"]],
  ["1-AI认知/什么是Embedding/什么是Embedding.md", ["AI 基础", "ai-basics"]],
  ["3-Claude code系列/重写/AI编程三年变了三次，Claude Code凭什么不一样？.md", ["Claude Code", "claude-code"]],
  ["3-Claude code系列/重写/02_10分钟装好Claude Code，说第一句话.md", ["Claude Code", "claude-code"]],
  ["3-Claude code系列/文章/03_做你的第一个项目.md", ["Claude Code", "claude-code"]],
  ["3-Claude code系列/最佳实现/文章/02-CLAUDE-md完全指南.md", ["Claude Code", "claude-code"]],
  ["3-Claude code系列/最佳实现/文章/05-Skills揭秘.md", ["Claude Code", "claude-code"]],
  ["5-Agent/01-AI Agent是什么.md", ["AI Agent", "agent"]],
  ["5-Agent/05-Function Calling.md", ["AI Agent", "agent"]],
  ["5-Agent/06-MCP是什么.md", ["AI Agent", "agent"]],
  ["8-VibeCoding指南/01-Vibe Coding到底是个啥.md", ["Vibe Coding", "vibe-coding"]],
  ["8-VibeCoding指南/03-规划就是一切.md", ["Vibe Coding", "vibe-coding"]],
  ["8-VibeCoding指南/08-从玩具到上线.md", ["Vibe Coding", "vibe-coding"]],
  ["6-AI产品思维/01-一个人加AI等于一个团队.md", ["AI 产品", "product"]],
  ["6-AI产品思维/02-AI产品核心是工作流.md", ["AI 产品", "product"]],
  ["6-AI产品思维/05-从想法到上线.md", ["AI 产品", "product"]],
  ["7-AI编程实战项目/01-用AI搭个人博客.md", ["AI 编程", "coding"]],
  ["7-AI编程实战项目/04-用AI做Chrome插件.md", ["AI 编程", "coding"]],
  ["9-OpenClaw教程/08-内容创作者工作流.md", ["OpenClaw", "openclaw"]],
  ["15-AI变现/03-AI时代MVP.md", ["AI 商业", "ai-business"]],
  ["4-技术栈认知/42-Vercel是什么.md", ["技术词典", "tech"]],
]);

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const slash = (value) => value.split(path.sep).join("/");
const hash = (value, length = 8) => crypto.createHash("sha1").update(value).digest("hex").slice(0, length);

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(full);
  }
  return files;
}

function classify(relativePath) {
  return curatedArticles.get(relativePath) ?? null;
}

function cleanTitle(value) {
  return value
    .replace(/^#+\s*/, "")
    .replace(/^\d+[._-]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

function plainText(value) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`>#~|]/g, "")
    .replace(/&(?:nbsp|amp|quot|#34);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFrom(frontmatter, body) {
  if (typeof frontmatter.excerpt === "string" && frontmatter.excerpt.trim()) return plainText(frontmatter.excerpt).slice(0, 180);
  const summary = body.match(/^>\s*(?:\*\*)?摘要[：:]?(?:\*\*)?\s*(.+)$/m);
  if (summary) return plainText(summary[1]).slice(0, 180);
  const paragraphs = body.split(/\n\s*\n/).map(plainText).filter((text) => text.length >= 35 && !/^(?:系列|适合人群|核对时间|配图建议)/.test(text));
  return (paragraphs[0] || "这篇文章来自 AI面包君积累的公众号文章，现已整理到个人网站。").slice(0, 180);
}

function cleanBody(rawBody, title) {
  let body = rawBody.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = body.split("\n");
  const h1 = lines.findIndex((line) => /^#\s+/.test(line));
  if (h1 >= 0 && normalizeTitle(cleanTitle(lines[h1])) === normalizeTitle(title)) lines.splice(h1, 1);
  body = lines
    .filter((line) => !/^\s*(?:\*\*)?(?:[📷🖼️]\s*)?配图建议[①②③④⑤⑥⑦⑧⑨0-9]*(?:\*\*)?\s*[：:]/u.test(line))
    .join("\n")
    .replace(/\\?&\\?#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/^\s*---\s*\n+/, "")
    .replace(/(?:^|\n)(?:---\s*\n\s*){2,}/g, "\n---\n\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  return `${body}\n`;
}

function asciiSlug(title, prefix, relativePath) {
  const words = title.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 1).slice(0, 6) ?? [];
  const readable = words.join("-").slice(0, 54) || "article";
  return `${prefix}-${readable}-${hash(relativePath, 7)}`;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function rewriteImages(body, sourceFile, slug, missingImages, copiedImages) {
  return body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, rawTarget) => {
    const target = rawTarget.trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|data:|\/|#)/i.test(target)) return full;
    const withoutTitle = target.replace(/\s+["'][^"']*["']$/, "");
    let decoded = withoutTitle;
    try { decoded = decodeURIComponent(withoutTitle); } catch { /* Keep the original path. */ }
    const sourceImage = path.resolve(path.dirname(sourceFile), decoded.replaceAll("/", path.sep));
    const extension = path.extname(sourceImage).toLowerCase();
    if (!imageExtensions.has(extension) || !fs.existsSync(sourceImage)) {
      missingImages.push({ article: slash(path.relative(SOURCE_ROOT, sourceFile)), target });
      return full;
    }
    const assetName = `${hash(sourceImage, 10)}${extension}`;
    const assetDirectory = path.join(ASSET_ROOT, slug);
    if (WRITE) {
      fs.mkdirSync(assetDirectory, { recursive: true });
      fs.copyFileSync(sourceImage, path.join(assetDirectory, assetName));
    }
    copiedImages.push(`${slug}/${assetName}`);
    return `![${alt}](/blog/wechat/${slug}/${assetName})`;
  });
}

if (!fs.existsSync(SOURCE_ROOT)) throw new Error(`Source directory does not exist: ${SOURCE_ROOT}`);

const existingFiles = fs.existsSync(ARTICLE_DIR) ? fs.readdirSync(ARTICLE_DIR).filter((name) => name.endsWith(".md")) : [];
const existingTitles = new Set();
const existingSlugs = new Set();
const existingImports = new Map();
for (const name of existingFiles) {
  const parsed = matter(fs.readFileSync(path.join(ARTICLE_DIR, name), "utf8"));
  if (parsed.data.importedFrom) existingImports.set(String(parsed.data.importedFrom), { file: path.join(ARTICLE_DIR, name), slug: String(parsed.data.slug || path.basename(name, ".md")) });
  else if (parsed.data.title) existingTitles.add(normalizeTitle(String(parsed.data.title)));
  if (parsed.data.slug) existingSlugs.add(String(parsed.data.slug));
}

const scanned = [];
const excluded = [];
for (const sourceFile of walk(SOURCE_ROOT)) {
  const relativePath = slash(path.relative(SOURCE_ROOT, sourceFile));
  const classification = classify(relativePath);
  if (!classification) { excluded.push(relativePath); continue; }
  const raw = fs.readFileSync(sourceFile, "utf8");
  const parsed = matter(raw);
  const firstHeading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
  const title = cleanTitle(String(parsed.data.title || firstHeading || path.basename(sourceFile, path.extname(sourceFile))));
  const body = cleanBody(parsed.content, title);
  if (body.length < 500) { excluded.push(relativePath); continue; }
  scanned.push({ sourceFile, relativePath, tag: classification[0], prefix: classification[1], title, body, frontmatter: parsed.data, bytes: Buffer.byteLength(body) });
}

// When the archive contains several revisions with the same title, publish the most complete one.
const byTitle = new Map();
for (const article of scanned) {
  const key = normalizeTitle(article.title);
  const current = byTitle.get(key);
  if (!current || article.bytes > current.bytes) byTitle.set(key, article);
}

const imported = [];
const skippedExisting = [];
const missingImages = [];
const copiedImages = [];
const sorted = [...byTitle.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath, "zh-CN"));
for (let index = 0; index < sorted.length; index++) {
  const article = sorted[index];
  const titleKey = normalizeTitle(article.title);
  if (existingTitles.has(titleKey)) { skippedExisting.push(article.relativePath); continue; }
  const previousImport = existingImports.get(article.relativePath);
  let slug = previousImport?.slug ?? asciiSlug(article.title, article.prefix, article.relativePath);
  if (!previousImport && existingSlugs.has(slug)) slug = `${slug}-${hash(article.relativePath, 4)}`;
  existingSlugs.add(slug);
  const stat = fs.statSync(article.sourceFile);
  const date = stat.mtime.toISOString().slice(0, 10);
  const excerpt = excerptFrom(article.frontmatter, article.body);
  const content = rewriteImages(article.body, article.sourceFile, slug, missingImages, copiedImages);
  const readMin = Math.max(2, Math.round(plainText(content).length / 650));
  const cover = `/placeholders/cover-${index % 3 + 1}.svg`;
  const frontmatter = [
    "---",
    `title: ${yamlString(article.title)}`,
    `slug: ${slug}`,
    `excerpt: ${yamlString(excerpt)}`,
    `tag: ${yamlString(article.tag)}`,
    `date: ${yamlString(date)}`,
    `cover: ${yamlString(cover)}`,
    `readMin: ${readMin}`,
    `importedFrom: ${yamlString(article.relativePath)}`,
    "---",
    "",
  ].join("\n");
  const targetFile = previousImport?.file ?? path.join(ARTICLE_DIR, `${slug}.md`);
  if (WRITE) {
    fs.mkdirSync(ARTICLE_DIR, { recursive: true });
    fs.writeFileSync(targetFile, `${frontmatter}${content}`, "utf8");
  }
  imported.push({ title: article.title, slug, tag: article.tag, date, readMin, source: article.relativePath, target: slash(path.relative(PROJECT_ROOT, targetFile)) });
}

const duplicateRevisions = scanned.length - byTitle.size;
const report = {
  generatedAt: new Date().toISOString(), mode: WRITE ? "write" : "dry-run", sourceRoot: SOURCE_ROOT,
  counts: { markdownFound: walk(SOURCE_ROOT).length, selectedRevisions: scanned.length, duplicateRevisions, imported: imported.length, skippedExisting: skippedExisting.length, excluded: excluded.length, copiedImages: copiedImages.length, missingImages: missingImages.length },
  imported, skippedExisting, missingImages,
};

if (WRITE) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, "wechat-import-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report.counts, null, 2));
console.log(`Mode: ${report.mode}`);
console.log(`Source: ${SOURCE_ROOT}`);
console.log(`Articles ready: ${imported.length}`);
