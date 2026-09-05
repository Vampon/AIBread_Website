import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Compass,
  FileText,
  FolderOpen,
  Gamepad2,
  Newspaper,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { ArticleListItem } from "@/components/ArticleListItem";
import { getAllArticles } from "@/lib/articles";
import { matrixStats } from "@/data/matrix";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 3);
  const projects = await getProjects();
  const workItems = projects.slice(0, 4).map((project) => ({
    ...project,
    icon: project.href === "/cc" ? Terminal : project.category === "工具" ? Compass : Gamepad2,
  }));

  const quickLinks = [
    { href: "/work", icon: FolderOpen, label: "作品", value: `${projects.length} 项`, hint: "工具、网站与互动内容" },
    { href: "/blog", icon: FileText, label: "博客", value: `${articles.length} 篇`, hint: "实践记录与方法整理" },
    { href: "/resources", icon: BookOpen, label: "学习资源", value: `${matrixStats.totalNodes} 关`, hint: "课程、练习与资料" },
    { href: "/news", icon: Newspaper, label: "AI 消息站", value: "每日", hint: "筛过一遍的行业动态" },
  ];

  return (
    <>
      <Hero />

      <section className="border-b border-bread-900/10 bg-white/45">
        <div className="container-page grid divide-y divide-bread-900/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group flex items-center gap-3 px-1 py-4 sm:px-5 lg:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bread-100 text-bread-700 transition-colors group-hover:bg-bread-500 group-hover:text-bread-900"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><strong className="text-sm text-bread-900">{item.label}</strong><b className="font-mono text-[10px] font-medium text-bread-700">{item.value}</b></span><small className="mt-0.5 block truncate text-[11px] text-bread-900/45">{item.hint}</small></span>
                <ArrowRight className="h-3.5 w-3.5 text-bread-900/25 transition-transform group-hover:translate-x-1 group-hover:text-bread-700" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-16 md:mt-20">
        <div className="flex flex-col gap-4 border-b border-bread-900/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div><p className="eyebrow">Selected work</p><h2 className="display-title mt-3 text-3xl md:text-4xl">最近做好的东西</h2></div>
          <div className="flex items-center gap-5"><p className="hidden max-w-md text-sm leading-6 text-bread-900/55 md:block">能直接体验，也能顺着卡片查看制作笔记。</p><Link href="/work" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-bread-900 hover:text-bread-600">全部作品 <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workItems.map((item, index) => {
            const Icon = item.icon;
            const dark = index === 0;
            return (
              <Link key={item.id} href="/work" className={`group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-soft ${dark ? "border-bread-900 bg-bread-900 text-white" : "border-bread-900/10 bg-white/90"}`}>
                <div className="flex items-start justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-bread-300" : "bg-bread-100 text-bread-700"}`}><Icon className="h-4 w-4" /></span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${dark ? "bg-white/10 text-white/65" : "bg-bread-50 text-bread-900/45"}`}>{item.status}</span></div>
                <div className="mt-auto pt-8"><p className={`text-[10px] font-bold ${dark ? "text-bread-300" : "text-bread-700"}`}>{item.category}</p><h3 className={`mt-1.5 font-display text-xl ${dark ? "text-white" : "text-bread-900"}`}>{item.title}</h3><p className={`mt-2 line-clamp-2 pr-5 text-xs leading-5 ${dark ? "text-white/55" : "text-bread-900/52"}`}>{item.description}</p></div>
                <ArrowRight className={`absolute bottom-5 right-5 h-4 w-4 transition-transform group-hover:translate-x-1 ${dark ? "text-white/55" : "text-bread-700"}`} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-16 md:mt-20">
        <div className="grid gap-5 lg:grid-cols-[1.04fr_.96fr]">
          <div className="dense-panel overflow-hidden">
            <div className="flex items-end justify-between border-b border-bread-900/10 bg-bread-100/55 px-6 py-5">
              <div><p className="page-kicker">Learning shelf</p><h2 className="mt-2 text-2xl font-bold text-bread-900">学习资源</h2></div>
              <Link href="/resources" className="inline-flex items-center gap-1 text-xs font-bold text-bread-900">查看全部 <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="divide-y divide-bread-900/10">
              <Link href="/learn" className="group grid gap-4 p-6 transition-colors hover:bg-bread-50 sm:grid-cols-[44px_1fr_auto] sm:items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bread-500 text-bread-900"><BookOpen className="h-5 w-5" /></span>
                <span><span className="flex items-center gap-2"><strong className="text-base text-bread-900">AI 闯关地图</strong><b className="rounded-full bg-bread-100 px-2 py-0.5 text-[9px] text-bread-700">推荐起点</b></span><small className="mt-1 block text-xs leading-5 text-bread-900/50">{matrixStats.totalNodes} 个互动关卡，每次学一个小概念。</small></span>
                <span className="hidden items-center gap-1 text-xs font-bold text-bread-900 sm:inline-flex">开始闯关 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <Link href="/cc" className="group grid gap-4 p-6 transition-colors hover:bg-bread-50 sm:grid-cols-[44px_1fr_auto] sm:items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bread-900 text-bread-300"><Terminal className="h-5 w-5" /></span>
                <span><strong className="text-base text-bread-900">Claude Code 实验室</strong><small className="mt-1 block text-xs leading-5 text-bread-900/50">在仿真终端里边操作，边看懂工具调用。</small></span>
                <span className="hidden items-center gap-1 text-xs font-bold text-bread-900 sm:inline-flex">进入实验室 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </div>
            <div className="grid gap-px border-t border-bread-900/10 bg-bread-900/10 sm:grid-cols-3">
              {["AI 工具实战", "提示词案例", "工作流小课"].map((item) => <div key={item} className="flex items-center justify-between bg-white px-5 py-4"><span className="text-xs font-bold text-bread-900/70">{item}</span><span className="text-[9px] text-bread-900/35">准备中</span></div>)}
            </div>
          </div>

          <div className="dense-panel p-5 md:p-6">
            <div className="flex items-end justify-between border-b border-bread-900/10 pb-4"><div><p className="page-kicker">Fresh notes</p><h2 className="mt-2 text-2xl font-bold text-bread-900">最近更新</h2></div><Link href="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-bread-900">更多文章 <ArrowRight className="h-3.5 w-3.5" /></Link></div>
            <div className="mt-4 space-y-2">{latest.map((article) => <ArticleListItem key={article.slug} article={article} compact />)}</div>
          </div>
        </div>
      </section>

      <section className="container-page mb-6 mt-16 md:mt-20">
        <div className="relative overflow-hidden rounded-2xl bg-bread-900 px-6 py-8 text-white md:px-9 md:py-9">
          <Sparkles className="absolute -right-8 -top-12 h-48 w-48 rotate-12 text-bread-500/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bread-300">What I can help with</p><h2 className="mt-3 font-display text-3xl leading-tight">把一个想法，做成能用的东西。</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">这里先展示我的实践。有具体问题，也可以一起聊聊。</p></div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[{ icon: Compass, title: "整理思路", text: "把需求和信息排清楚" }, { icon: Terminal, title: "做成产品", text: "网站、工具与交互内容" }, { icon: BookOpen, title: "讲明白", text: "课程、教程与案例拆解" }].map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-xl border border-white/10 bg-white/[.06] p-4"><Icon className="h-4 w-4 text-bread-300" /><p className="mt-5 text-sm font-bold">{item.title}</p><p className="mt-1 text-[11px] leading-5 text-white/45">{item.text}</p></div>; })}
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5"><Link href="/about#contact" className="inline-flex items-center gap-2 rounded-full bg-bread-500 px-5 py-2.5 text-xs font-bold text-bread-900">和我聊聊 <ArrowRight className="h-3.5 w-3.5" /></Link><span className="inline-flex items-center gap-1.5 text-[11px] text-white/40"><Clock3 className="h-3.5 w-3.5" /> 网站和内容都在持续更新</span></div>
        </div>
      </section>
    </>
  );
}
