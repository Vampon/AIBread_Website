"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Project, ProjectNote } from "@/lib/projects";

const emptyProject: Omit<Project, "id"> = { title: "", description: "", category: "工具", status: "正在做", href: "", isExternal: false, accent: "yellow", notes: [], sortOrder: 0 };

function notesToText(notes: ProjectNote[]) { return notes.map((note) => `${note.title} | ${note.href}`).join("\n"); }
function textToNotes(text: string) { return text.split("\n").map((line) => { const [title, ...href] = line.split("|"); return { title: title?.trim(), href: href.join("|").trim() }; }).filter((note) => note.title && note.href) as ProjectNote[]; }

export function AdminProjectManager({ initialProjects, databaseConfigured }: { initialProjects: Project[]; databaseConfigured: boolean }) {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [draft, setDraft] = useState<Omit<Project, "id">>(emptyProject);
  const [notesText, setNotesText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function openCreate() { setEditing(null); setDraft(emptyProject); setNotesText(""); setMessage(""); }
  function openEdit(project: Project) { setEditing(project); setDraft({ title: project.title, description: project.description, category: project.category, status: project.status, href: project.href, isExternal: project.isExternal, accent: project.accent, notes: project.notes, sortOrder: project.sortOrder }); setNotesText(notesToText(project.notes)); setMessage(""); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    const payload = { ...draft, notes: textToNotes(notesText) };
    const url = editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects";
    const response = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({})); setSaving(false);
    if (!response.ok) { setMessage(result.error || "保存失败"); return; }
    if (editing) setProjects((list) => list.map((item) => item.id === editing.id ? result.project : item).sort((a, b) => a.sortOrder - b.sortOrder));
    else setProjects((list) => [...list, result.project].sort((a, b) => a.sortOrder - b.sortOrder));
    setEditing(result.project); setDraft({ ...result.project }); setNotesText(notesToText(result.project.notes)); setMessage("已保存");
  }

  async function remove(project: Project) {
    if (!window.confirm(`删除“${project.title}”？`)) return;
    const response = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    if (response.ok) { setProjects((list) => list.filter((item) => item.id !== project.id)); if (editing?.id === project.id) openCreate(); }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-4 border-b border-bread-900/10 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-bread-700"><ArrowLeft className="h-3.5 w-3.5" /> 后台首页</Link><h1 className="mt-3 font-display text-4xl text-bread-900">作品管理</h1><p className="mt-2 text-sm text-bread-900/50">这里的修改会直接显示在作品页。</p></div><button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-full bg-bread-900 px-5 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> 新增作品</button></div>
      {!databaseConfigured && <div className="mt-6 rounded-2xl border border-bread-300 bg-bread-100 p-4 text-sm text-bread-900">当前展示的是内置示例数据。连接 Vercel Marketplace 的 Postgres 后，将 <code>POSTGRES_URL</code> 加入环境变量即可保存修改。</div>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-2">{projects.map((project) => <article key={project.id} className={`flex items-start gap-4 rounded-2xl border bg-white p-4 transition-colors ${editing?.id === project.id ? "border-bread-500" : "border-bread-900/10"}`}><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-bread-900">{project.title}</h2><span className="rounded-full bg-bread-100 px-2 py-0.5 text-[10px] font-bold text-bread-700">{project.category}</span><span className="text-[10px] text-bread-900/40">{project.status}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-bread-900/50">{project.description}</p></div><div className="flex gap-1"><button type="button" onClick={() => openEdit(project)} aria-label={`编辑 ${project.title}`} className="rounded-lg p-2 text-bread-900/45 hover:bg-bread-50 hover:text-bread-900"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => remove(project)} aria-label={`删除 ${project.title}`} className="rounded-lg p-2 text-bread-900/45 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
        <form onSubmit={save} className="surface-card h-fit p-6 xl:sticky xl:top-24"><div className="flex items-center justify-between"><h2 className="font-bold text-bread-900">{editing ? "编辑作品" : "新增作品"}</h2>{editing && <button type="button" onClick={openCreate} className="rounded-lg p-1.5 text-bread-900/40 hover:bg-bread-50" aria-label="关闭编辑"><X className="h-4 w-4" /></button>}</div>
          <div className="mt-5 space-y-4"><label className="block text-xs font-bold">作品名称<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label><label className="block text-xs font-bold">简介<textarea required rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1.5 w-full resize-none rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold">分类<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label><label className="block text-xs font-bold">状态<input value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label></div>
            <label className="block text-xs font-bold">作品链接<input value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} placeholder="/cc 或 https://…" className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={draft.isExternal} onChange={(event) => setDraft({ ...draft, isExternal: event.target.checked })} /> 外部链接</label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold">配色<select value={draft.accent} onChange={(event) => setDraft({ ...draft, accent: event.target.value })} className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm"><option value="yellow">亮黄</option><option value="gold">金黄</option><option value="dark">深色</option><option value="cream">浅色</option></select></label><label className="block text-xs font-bold">排序<input type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-bread-900/10 px-3 py-2.5 text-sm" /></label></div>
            <label className="block text-xs font-bold">相关文章<span className="ml-1 font-normal text-bread-900/40">每行：标题 | 链接</span><textarea rows={4} value={notesText} onChange={(event) => setNotesText(event.target.value)} placeholder="文章标题 | /blog/article-slug" className="mt-1.5 w-full resize-none rounded-xl border border-bread-900/10 px-3 py-2.5 font-mono text-xs" /></label>
          </div>{message && <p className={`mt-4 text-xs ${message === "已保存" ? "text-emerald-700" : "text-red-700"}`}>{message}</p>}<button type="submit" disabled={saving || !databaseConfigured} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bread-500 px-4 py-3 text-sm font-bold text-bread-900 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "保存中…" : "保存作品"}<ExternalLink className="h-4 w-4" /></button></form>
      </div>
    </div>
  );
}
