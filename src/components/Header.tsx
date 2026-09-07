"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";

const mainNav = [
  { href: "/work", label: "作品" },
  { href: "/ai-learn", label: "AI 学习" },
  { href: "/blog", label: "博客" },
  { href: "/news", label: "AI 消息站" },
];

const resourceNav = [
  { href: "/resources", label: "资源总览", hint: "从这里选择适合你的内容" },
  { href: "/learn", label: "AI 闯关地图", hint: "零基础、游戏式学习" },
  { href: "/cc", label: "Claude Code 实验室", hint: "边操作边理解原理" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const resourcesActive = ["/resources", "/learn", "/cc"].some((path) => pathname.startsWith(path));
  const activeClass = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href)) ? "text-bread-900" : "text-bread-900/62 hover:text-bread-900";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ["/work", "/ai-learn", "/blog", "/news", "/resources", "/about"].forEach((href) => router.prefetch(href));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-bread-900/10 bg-bread-50/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label="AI面包君首页" className="group flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-bread-900/10 bg-white shadow-sm transition-transform group-hover:-rotate-6">
            <Image src="/logo.svg" alt="" width={31} height={31} priority />
          </span>
          <span>
            <span className="block text-[15px] font-bold leading-none tracking-tight text-bread-900">AI面包君</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-bread-700/75">Learn · Build · Share</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="主导航">
          {mainNav.map((item) => <Link key={item.href} href={item.href} prefetch className={`transition-colors ${activeClass(item.href)}`}>{item.label}</Link>)}
          <div className="group relative py-6">
            <Link href="/resources" className={`flex items-center gap-1 transition-colors ${resourcesActive ? "text-bread-900" : "text-bread-900/62 group-hover:text-bread-900"}`}>
              学习资源 <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </Link>
            <div className="pointer-events-none absolute left-1/2 top-[58px] w-72 -translate-x-1/2 translate-y-2 rounded-2xl border border-bread-900/10 bg-white p-2 opacity-0 shadow-soft transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {resourceNav.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-3 hover:bg-bread-50">
                  <span className="block text-sm font-bold text-bread-900">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-bread-900/50">{item.hint}</span>
                </Link>
              ))}
            </div>
          </div>
          <a href="https://navigation.aibread.site/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-bread-900/62 transition-colors hover:text-bread-900">AI 导航 <ArrowUpRight className="h-3.5 w-3.5" /></a>
          <Link href="/about" className={`transition-colors ${activeClass("/about")}`}>关于我</Link>
        </nav>

        <Link href="/about#contact" className="hidden rounded-full bg-bread-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-bread-800 lg:inline-flex">和我聊聊</Link>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-bread-900/10 bg-white text-bread-900 lg:hidden" aria-label={mobileOpen ? "关闭菜单" : "打开菜单"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-bread-900/10 bg-bread-50 px-4 pb-5 pt-3 lg:hidden" aria-label="移动端导航">
          <div className="mx-auto grid max-w-page gap-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-white">首页</Link>
            {mainNav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-white">{item.label}</Link>)}
            <div className="my-1 border-t border-bread-900/10 pt-2">
              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bread-700">学习资源</p>
              {resourceNav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm text-bread-900/75 hover:bg-white">{item.label}</Link>)}
            </div>
            <a href="https://navigation.aibread.site/" target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-xl px-4 py-3 text-sm font-bold hover:bg-white">AI 导航 <ArrowUpRight className="h-3.5 w-3.5" /></a>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-white">关于我</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
