"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const links = [
  { label: "作品", href: "/work" },
  { label: "博客", href: "/blog" },
  { label: "AI 消息站", href: "/news" },
  { label: "学习资源", href: "/resources" },
  { label: "关于我", href: "/about" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/learn/") && pathname !== "/learn") return null;
  if (pathname?.startsWith("/blog/")) return null;

  return (
    <footer className="mt-20 border-t border-bread-900/10 bg-bread-900 text-white">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white"><Image src="/logo.svg" alt="" width={33} height={33} /></span>
              <span className="text-lg font-bold">AI面包君</span>
            </div>
            <p className="mt-6 max-w-xl font-display text-2xl leading-relaxed text-white md:text-3xl">把复杂的 AI 烤得松软一点，<br />让每个人都能咬下第一口。</p>
          </div>
          <div className="lg:text-right">
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65 lg:justify-end">
              {links.map((link) => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}
              <a href="https://navigation.aibread.site/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">AI 导航 <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </nav>
            <p className="mt-6 text-xs leading-relaxed text-white/45">个人探索、真实实践与持续更新。本站内容仅代表个人观点。</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AI面包君 · Built with curiosity</p>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-white">豫ICP备2026009346号-1</a>
        </div>
      </div>
    </footer>
  );
}
