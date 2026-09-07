import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.env.BREAD_SERIES_SOURCE ?? "D:\\Project\\bread agent";
const outputRoot = path.join(process.cwd(), "content", "articles");
const imageOutputRoot = path.join(process.cwd(), "public", "tutorials", "bread-ai-from-scratch");

const courses = [
  {
    dir: "bread-agent",
    slug: "agent",
    name: "Bread Agent",
    label: "让模型开始动手",
    chapters: ["ch00_hello", "ch01_one_tool", "ch02_loop", "ch03_repl", "ch04_stream", "ch05_promptpl", "ch06_hooks", "ch07_session", "ch08_subagent"],
  },
  {
    dir: "bread-mcp",
    slug: "mcp",
    name: "Bread MCP",
    label: "让工具即插即用",
    chapters: ["ch00_jsonrpc", "ch01_min_server", "ch02_min_client", "ch03_real_tools", "ch04_with_agent", "ch05_sqlite_server"],
  },
  {
    dir: "bread-rag",
    slug: "rag",
    name: "Bread RAG",
    label: "让模型找到资料",
    chapters: ["ch00_baseline", "ch01_bow", "ch02_embeddings", "ch03_persist", "ch04_hybrid", "ch05_with_agent"],
  },
  {
    dir: "bread-browser",
    slug: "browser",
    name: "Bread Browser",
    label: "让模型操作网页",
    chapters: ["ch00_hello", "ch01_dom_snapshot", "ch02_one_action", "ch03_agent_loop", "ch04_full_task", "ch05_with_agent"],
  },
  {
    dir: "bread-multi-agent",
    slug: "multi-agent",
    name: "Bread Multi-Agent",
    label: "让多个角色协作",
    chapters: ["ch00_dialogue", "ch01_planner_executor", "ch02_critic", "ch03_router", "ch04_pipeline", "ch05_with_browser"],
  },
];

function quote(value) {
  return JSON.stringify(value);
}

function stripLead(markdown) {
  return markdown
    .replace(/^#\s+.+?\r?\n/, "")
    .replace(/^\s*>\s*预计学习时间[^\n]*\r?\n(?:>[^\n]*\r?\n)*/m, "")
    .replace(/^\s*---\s*\r?\n/, "")
    .trimStart();
}

function localizeImages(markdown) {
  fs.mkdirSync(imageOutputRoot, { recursive: true });
  return markdown.replace(/!\[([^\]]*)\]\(([A-Za-z]:\\[^)]+)\)/g, (match, alt, sourcePath) => {
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Missing tutorial image: ${sourcePath}`);
      return `> 截图暂未迁移：${alt || path.basename(sourcePath)}`;
    }
    const fileName = path.basename(sourcePath);
    fs.copyFileSync(sourcePath, path.join(imageOutputRoot, fileName));
    return `![${alt}](/tutorials/bread-ai-from-scratch/${fileName})`;
  });
}

function metadata(markdown) {
  const title = (markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "未命名章节").replace(/\s*★+\s*$/, "");
  const info = markdown.match(/预计学习时间\s*(\d+)\s*分钟\s*·\s*代码量\s*(\d+)\s*行\s*·\s*难度\s*(★+)/);
  return {
    title,
    minutes: Number(info?.[1] ?? 30),
    lines: Number(info?.[2] ?? 0),
    difficulty: info?.[3]?.length ?? 1,
  };
}

fs.mkdirSync(outputRoot, { recursive: true });

let globalOrder = 0;
for (const [courseIndex, course] of courses.entries()) {
  for (const [chapterIndex, chapterDir] of course.chapters.entries()) {
    globalOrder += 1;
    const sourceFile = path.join(sourceRoot, course.dir, chapterDir, "README.md");
    if (!fs.existsSync(sourceFile)) throw new Error(`Missing tutorial: ${sourceFile}`);
    const markdown = fs.readFileSync(sourceFile, "utf8").replace(/\r\n/g, "\n");
    const info = metadata(markdown);
    const slug = `bread-${course.slug}-${String(chapterIndex).padStart(2, "0")}-${chapterDir.replace(/^ch\d+_/, "")}`;
    const excerpt = `${course.label}。${info.title.replace(/^第\s*\d+\s*章\s*[·—-]?\s*/, "")}，边读边运行配套 Python 代码。`;
    const frontmatter = [
      "---",
      `title: ${quote(info.title)}`,
      `slug: ${quote(slug)}`,
      `excerpt: ${quote(excerpt)}`,
      `tag: ${quote("Bread 教程")}`,
      `date: ${quote("2026-09-07")}`,
      `cover: ${quote("/placeholders/cover-2.svg")}`,
      `readMin: ${info.minutes}`,
      `kind: ${quote("tutorial")}`,
      `series: ${quote("从零手写 AI 助手")}`,
      `seriesSlug: ${quote("bread-ai-from-scratch")}`,
      `course: ${quote(course.name)}`,
      `courseSlug: ${quote(course.slug)}`,
      `courseOrder: ${courseIndex + 1}`,
      `chapter: ${chapterIndex}`,
      `seriesOrder: ${globalOrder}`,
      `difficulty: ${info.difficulty}`,
      `codeLines: ${info.lines}`,
      "---",
      "",
    ].join("\n");
    const body = `${frontmatter}${stripLead(localizeImages(markdown))}\n`;
    fs.writeFileSync(path.join(outputRoot, `${slug}.md`), body, "utf8");
  }
}

console.log(`Imported ${globalOrder} tutorial chapters into ${outputRoot}`);
