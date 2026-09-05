import Link from "next/link";
import { BookOpen, Database, ExternalLink, FolderKanban } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllArticles } from "@/lib/articles";
import { getProjects, isDatabaseConfigured } from "@/lib/projects";

export const metadata = { title: "网站后台" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const projects = await getProjects();
  const articles = getAllArticles();
  return <section className="container-page py-12"><div className="flex flex-col gap-4 border-b border-bread-900/10 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Admin</p><h1 className="display-title mt-4 text-4xl md:text-5xl">网站后台</h1><p className="mt-3 text-sm text-bread-900/50">管理作品和网站内容。</p></div><form action="/api/admin/logout" method="post"><button className="rounded-full border border-bread-900/10 bg-white px-4 py-2 text-xs font-bold">退出登录</button></form></div>
    {!isDatabaseConfigured() && <div className="mt-7 flex items-start gap-3 rounded-2xl border border-bread-300 bg-bread-100 p-5"><Database className="mt-0.5 h-5 w-5 text-bread-700" /><div><p className="text-sm font-bold">数据库尚未连接</p><p className="mt-1 text-xs leading-6 text-bread-900/60">网站仍可读取内置作品数据，但后台保存功能会关闭。请从 Vercel Marketplace 连接 Neon 或 Supabase，并设置 POSTGRES_URL。</p></div></div>}
    <div className="mt-8 grid gap-5 md:grid-cols-2"><Link href="/admin/projects" className="surface-card group p-7 transition-transform hover:-translate-y-1"><FolderKanban className="h-6 w-6 text-bread-600" /><p className="mt-8 text-3xl font-bold text-bread-900">{projects.length}</p><h2 className="mt-2 font-bold text-bread-900">作品管理</h2><p className="mt-2 text-sm text-bread-900/50">新增、编辑、排序作品及相关文章。</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-bread-700">进入管理 <ExternalLink className="h-3.5 w-3.5" /></span></Link><Link href="/blog" className="surface-card group p-7 transition-transform hover:-translate-y-1"><BookOpen className="h-6 w-6 text-bread-600" /><p className="mt-8 text-3xl font-bold text-bread-900">{articles.length}</p><h2 className="mt-2 font-bold text-bread-900">文章内容</h2><p className="mt-2 text-sm text-bread-900/50">文章目前继续使用 Markdown 文件管理。</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-bread-700">打开博客 <ExternalLink className="h-3.5 w-3.5" /></span></Link></div></section>;
}
