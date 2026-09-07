"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Gamepad2, Hammer, Terminal, Wrench } from "lucide-react";
import type { Project } from "@/lib/projects";

const generatedIcons: Record<string, string> = {
  "image-compressor": "/tools/icons/image-compressor.png",
  "image-converter": "/tools/icons/image-converter.png",
  "json-formatter": "/tools/icons/json-formatter.png",
  "data-converter": "/tools/icons/data-converter.png",
};

function projectLabel(project: Project) {
  if (!project.href) return "制作中";
  if (project.isExternal) return "站外作品";
  return "原创开发";
}

function iconFor(project: Project) {
  if (project.href === "/cc") return Terminal;
  if (project.category === "工具") return Compass;
  if (project.category === "小游戏") return Hammer;
  return Gamepad2;
}

function ProjectArt({ project }: { project: Project }) {
  const src = generatedIcons[project.id];
  if (src) return <Image src={src} alt="" width={112} height={112} className="h-24 w-24 object-contain [image-rendering:pixelated]" unoptimized />;
  const Icon = iconFor(project);
  return <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-bread-900 bg-bread-100 text-bread-900 shadow-[3px_3px_0_#e6b34e]"><Icon className="h-8 w-8" /></span>;
}

function ProjectAction({ project }: { project: Project }) {
  const content = <><span>{project.href ? "立即使用" : "还在制作"}</span>{project.isExternal ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</>;
  const className = `flex w-full items-center justify-between px-5 py-4 text-sm font-bold ${project.href ? "text-white hover:text-bread-300" : "cursor-not-allowed text-white/38"}`;
  if (!project.href) return <span className={className}>{content}</span>;
  return project.isExternal ? <a href={project.href} target="_blank" rel="noreferrer" className={className}>{content}</a> : <Link href={project.href} prefetch className={className}>{content}</Link>;
}

export function WorkGallery({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ["全部", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const [active, setActive] = useState("全部");
  const filtered = active === "全部" ? projects : projects.filter((project) => project.category === active);

  return (
    <div className="grid gap-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-9">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bread-900/40">作品分类</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setActive(category)} aria-pressed={active === category} className={`flex shrink-0 items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors lg:w-full ${active === category ? "bg-bread-900 font-bold text-white" : "text-bread-900/60 hover:bg-white hover:text-bread-900"}`}>
              <span>{category}</span><span className={`ml-5 font-mono text-[10px] ${active === category ? "text-white/45" : "text-bread-900/30"}`}>{category === "全部" ? projects.length : projects.filter((project) => project.category === category).length}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 hidden border-l-2 border-bread-500 pl-4 lg:block"><p className="flex items-center gap-2 text-xs font-bold text-bread-900"><Wrench className="h-3.5 w-3.5" />能点开的，都能直接用</p><p className="mt-2 text-[11px] leading-5 text-bread-900/45">图片和数据工具都在浏览器本地处理，不上传文件。</p></div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex items-end justify-between border-b border-bread-900/10 pb-4"><div><h2 className="text-xl font-bold text-bread-900">{active === "全部" ? "全部作品" : active}</h2><p className="mt-1 text-xs text-bread-900/40">共 {filtered.length} 项</p></div></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <article key={project.id} className="flex min-h-[390px] flex-col overflow-hidden rounded-[22px] border-2 border-bread-900 bg-white shadow-[5px_6px_0_rgba(31,22,17,.14)] transition-transform hover:-translate-y-1">
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <span className={`self-start rounded-full border-2 border-bread-900 px-3 py-1 text-[10px] font-bold ${project.href && !project.isExternal ? "bg-bread-300" : "bg-white"}`}>{projectLabel(project)}</span>
                <div className="mt-4"><ProjectArt project={project} /></div>
                <h3 className="mt-4 text-xl font-black tracking-tight text-bread-900">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-bread-900/55">{project.description}</p>
                {project.notes.length > 0 && <div className="mt-auto pt-4"><p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-bread-900/35"><BookOpen className="h-3 w-3" />相关笔记</p><div className="mt-2 space-y-1">{project.notes.slice(0, 2).map((note) => <Link key={note.href} href={note.href} className="block truncate text-[11px] text-bread-900/55 hover:text-bread-700">{note.title} <span aria-hidden="true">→</span></Link>)}</div></div>}
              </div>
              <div className="bg-bread-900"><ProjectAction project={project} /></div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
