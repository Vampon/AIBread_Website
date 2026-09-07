import "server-only";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

export type ProjectNote = { title: string; href: string };

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  href: string;
  isExternal: boolean;
  accent: string;
  notes: ProjectNote[];
  sortOrder: number;
};

export type ProjectInput = Omit<Project, "id"> & { id?: string };

export const defaultProjects: Project[] = [
  { id: "ai-navigation", title: "AI 导航站", description: "把常用 AI 工具按写作、设计、编程等用途重新整理。想做什么，就从对应分类里找。", category: "工具", status: "可以使用", href: "https://navigation.aibread.site/", isExternal: true, accent: "yellow", notes: [{ title: "每天都值得用的 AI 工具", href: "/blog/daily-ai-tools" }], sortOrder: 10 },
  { id: "image-compressor", title: "图片压缩", description: "调整尺寸和质量，直接在浏览器里把图片变小。处理前后大小会清楚列出来。", category: "工具", status: "可以使用", href: "/tools/image-compressor", isExternal: false, accent: "gold", notes: [], sortOrder: 11 },
  { id: "image-converter", title: "图片格式转换", description: "在 PNG、JPG 和 WebP 之间转换。文件只在当前浏览器处理，不会上传。", category: "工具", status: "可以使用", href: "/tools/image-converter", isExternal: false, accent: "cream", notes: [], sortOrder: 12 },
  { id: "json-formatter", title: "JSON 格式化", description: "格式化、压缩并检查 JSON，错误会定位到具体位置，也可以一键复制结果。", category: "工具", status: "可以使用", href: "/tools/json-formatter", isExternal: false, accent: "dark", notes: [], sortOrder: 13 },
  { id: "data-converter", title: "CSV / JSON 转换", description: "把表格数据转成 JSON，也能把对象数组还原成 CSV，适合临时整理接口和表格数据。", category: "工具", status: "可以使用", href: "/tools/data-converter", isExternal: false, accent: "yellow", notes: [], sortOrder: 14 },
  { id: "claude-code-lab", title: "Claude Code 实验室", description: "一个不会真的改动电脑的仿真终端。输入命令后，右边会解释 Claude Code 正在做什么。", category: "互动学习", status: "可以使用", href: "/cc", isExternal: false, accent: "dark", notes: [{ title: "Claude Code 完整入门", href: "/blog/claude-code-guide" }, { title: "Tool Use 循环讲透", href: "/blog/how-claude-uses-tools" }], sortOrder: 20 },
  { id: "ai-level-map", title: "AI 闯关地图", description: "43 个互动关卡，从“AI 是什么”开始。每关 5—10 分钟，答完题就能继续。", category: "互动学习", status: "可以使用", href: "/learn", isExternal: false, accent: "gold", notes: [{ title: "大语言模型是什么", href: "/blog/what-is-llm" }, { title: "提示词万能公式", href: "/blog/prompt-formula" }], sortOrder: 30 },
  { id: "next-ai-tool", title: "新的 AI 小工具", description: "这里先留一个位置。下一件作品做完后，会直接在这里开放使用。", category: "小游戏", status: "正在做", href: "", isExternal: false, accent: "cream", notes: [], sortOrder: 40 },
];

let sqlClient: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

export function isDatabaseConfigured() { return Boolean(process.env.POSTGRES_URL); }

function getSql() {
  if (!process.env.POSTGRES_URL) return null;
  if (!sqlClient) sqlClient = postgres(process.env.POSTGRES_URL, { max: 1, prepare: false, idle_timeout: 20, connect_timeout: 5 });
  return sqlClient;
}

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '工具',
        status TEXT NOT NULL DEFAULT '正在做',
        href TEXT NOT NULL DEFAULT '',
        is_external BOOLEAN NOT NULL DEFAULT FALSE,
        accent TEXT NOT NULL DEFAULT 'yellow',
        related_articles JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    const [{ count }] = await sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM projects`;
    if (count === 0) {
      for (const project of defaultProjects) await sql`INSERT INTO projects (id,title,description,category,status,href,is_external,accent,related_articles,sort_order) VALUES (${project.id},${project.title},${project.description},${project.category},${project.status},${project.href},${project.isExternal},${project.accent},${sql.json(project.notes)},${project.sortOrder}) ON CONFLICT (id) DO NOTHING`;
    }
    for (const project of defaultProjects.filter((item) => item.href.startsWith("/tools/"))) {
      await sql`INSERT INTO projects (id,title,description,category,status,href,is_external,accent,related_articles,sort_order) VALUES (${project.id},${project.title},${project.description},${project.category},${project.status},${project.href},${project.isExternal},${project.accent},${sql.json(project.notes)},${project.sortOrder}) ON CONFLICT (id) DO NOTHING`;
    }
  })();
  await schemaReady;
}

type ProjectRow = Omit<Project, "notes"> & { notes: ProjectNote[] | null };
function normalize(row: ProjectRow): Project { return { ...row, notes: Array.isArray(row.notes) ? row.notes : [] }; }

export async function getProjects(): Promise<Project[]> {
  const sql = getSql();
  if (!sql) return defaultProjects;
  try {
    await ensureSchema();
    const rows = await sql<ProjectRow[]>`SELECT id,title,description,category,status,href,is_external AS "isExternal",accent,related_articles AS notes,sort_order AS "sortOrder" FROM projects ORDER BY sort_order ASC, created_at ASC`;
    return rows.map(normalize);
  } catch {
    schemaReady = null;
    console.warn("Projects database is unavailable; using the built-in project list.");
    return defaultProjects;
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const sql = getSql(); if (!sql) return defaultProjects.find((project) => project.id === id) || null;
  await ensureSchema();
  const rows = await sql<ProjectRow[]>`SELECT id,title,description,category,status,href,is_external AS "isExternal",accent,related_articles AS notes,sort_order AS "sortOrder" FROM projects WHERE id=${id}`;
  return rows[0] ? normalize(rows[0]) : null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const sql = getSql(); if (!sql) throw new Error("DATABASE_NOT_CONFIGURED");
  await ensureSchema(); const id = input.id?.trim() || randomUUID();
  await sql`INSERT INTO projects (id,title,description,category,status,href,is_external,accent,related_articles,sort_order) VALUES (${id},${input.title},${input.description},${input.category},${input.status},${input.href},${input.isExternal},${input.accent},${sql.json(input.notes)},${input.sortOrder})`;
  return (await getProject(id))!;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project | null> {
  const sql = getSql(); if (!sql) throw new Error("DATABASE_NOT_CONFIGURED");
  await ensureSchema();
  await sql`UPDATE projects SET title=${input.title},description=${input.description},category=${input.category},status=${input.status},href=${input.href},is_external=${input.isExternal},accent=${input.accent},related_articles=${sql.json(input.notes)},sort_order=${input.sortOrder},updated_at=NOW() WHERE id=${id}`;
  return getProject(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const sql = getSql(); if (!sql) throw new Error("DATABASE_NOT_CONFIGURED");
  await ensureSchema(); const rows = await sql`DELETE FROM projects WHERE id=${id} RETURNING id`;
  return rows.length > 0;
}
