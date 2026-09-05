import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createProject, getProjects, isDatabaseConfigured, type ProjectInput } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalize(body: Partial<ProjectInput>): ProjectInput {
  return {
    title: String(body.title || "").trim(), description: String(body.description || "").trim(), category: String(body.category || "工具").trim(), status: String(body.status || "正在做").trim(), href: String(body.href || "").trim(), isExternal: Boolean(body.isExternal), accent: String(body.accent || "yellow"), notes: Array.isArray(body.notes) ? body.notes.filter((note) => note?.title && note?.href).map((note) => ({ title: String(note.title), href: String(note.href) })) : [], sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json({ projects: await getProjects(), databaseConfigured: isDatabaseConfigured() });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const input = normalize(await request.json().catch(() => ({})));
  if (!input.title) return NextResponse.json({ error: "请填写作品名称" }, { status: 400 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "请先配置 POSTGRES_URL" }, { status: 503 });
  return NextResponse.json({ project: await createProject(input) }, { status: 201 });
}
