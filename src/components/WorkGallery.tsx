"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Gamepad2, Hammer, Terminal } from "lucide-react";
import type { Project } from "@/lib/projects";

const accentClasses: Record<string, string> = { yellow: "bg-bread-500", gold: "bg-bread-300", dark: "bg-bread-900", cream: "bg-bread-100" };

function ProjectButton({ project }: { project: Project }) {
  if (!project.href) return <span className="inline-flex cursor-not-allowed rounded-full bg-bread-100 px-3 py-1.5 text-[11px] font-bold text-bread-900/40">还没做好</span>;
  const className = "inline-flex items-center gap-1 rounded-full bg-bread-900 px-3 py-1.5 text-[11px] font-bold text-white hover:-translate-y-0.5";
  return project.isExternal ? <a href={project.href} target="_blank" rel="noreferrer" className={className}>打开作品 <ArrowUpRight className="h-3 w-3" /></a> : <Link href={project.href} className={className}>现在体验 <ArrowRight className="h-3 w-3" /></Link>;
}

function iconFor(project: Project) {
  if (project.href === "/cc") return Terminal;
  if (project.category === "工具") return Compass;
  if (project.category === "小游戏") return Hammer;
  return Gamepad2;
}

export function WorkGallery({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ["全部", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const [active, setActive] = useState("全部");
  const filtered = active === "全部" ? projects : projects.filter((project) => project.category === active);

  return (
    <div className="grid gap-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-9">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bread-900/40">作品分类</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">{categories.map((category) => <button key={category} type="button" onClick={() => setActive(category)} aria-pressed={active === category} className={`flex shrink-0 items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors lg:w-full ${active === category ? "bg-bread-900 font-bold text-white" : "text-bread-900/60 hover:bg-white hover:text-bread-900"}`}><span>{category}</span><span className={`ml-5 font-mono text-[10px] ${active === category ? "text-white/45" : "text-bread-900/30"}`}>{category === "全部" ? projects.length : projects.filter((project) => project.category === category).length}</span></button>)}</div>
        <p className="mt-5 hidden text-[11px] leading-5 text-bread-900/45 lg:block">可以直接体验，也可以从相关笔记了解制作思路。</p>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex items-end justify-between border-b border-bread-900/10 pb-4"><div><h2 className="text-xl font-bold text-bread-900">{active === "全部" ? "全部作品" : active}</h2><p className="mt-1 text-xs text-bread-900/40">共 {filtered.length} 项</p></div></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const Icon = iconFor(project);
            return <article key={project.id} className="overflow-hidden rounded-xl border border-bread-900/10 bg-white transition-all hover:-translate-y-0.5 hover:border-bread-400 hover:shadow-soft">
              <div className={`relative flex h-20 items-start justify-between overflow-hidden p-4 ${accentClasses[project.accent] || accentClasses.yellow}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-bread-900"><Icon className="h-4 w-4" /></span><span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-bread-900">{project.status}</span><div className="absolute -bottom-14 -right-8 h-28 w-28 rounded-full border-[18px] border-white/10" /></div>
              <div className="p-4"><div><p className="text-[9px] font-bold text-bread-700">{project.category}</p><h3 className="mt-1 font-display text-lg text-bread-900">{project.title}</h3></div><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-bread-900/55">{project.description}</p><div className="mt-3"><ProjectButton project={project} /></div>
                {project.notes.length > 0 && <div className="mt-3 border-t border-bread-900/8 pt-3"><p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-bread-900/35"><BookOpen className="h-3 w-3" /> 相关笔记</p><div className="mt-1.5 space-y-1">{project.notes.slice(0, 2).map((note) => <Link key={note.href} href={note.href} className="block truncate text-[11px] text-bread-900/55 hover:text-bread-700">{note.title} <span aria-hidden="true">→</span></Link>)}</div></div>}
              </div>
            </article>;
          })}
        </div>
      </div>
    </div>
  );
}
