"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type NavItem = { href: string; label: string; external?: boolean };

const navItems: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/news", label: "AI 日刊" },
  { href: "/blog", label: "博客" },
  { href: "/learn", label: "学习路径" },
  { href: "/cc", label: "Claude Code" },
  { href: "https://navigation.aibread.site/", label: "AI 导航", external: true },
  { href: "/about", label: "关于我" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-bread-100 bg-bread-50/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-bread-900 transition-colors hover:text-bread-600"
        >
          <Image src="/logo.svg" alt="AI面包君" width={36} height={36} priority />
          <span>AI面包君</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {navItems.map((item) => {
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex items-center gap-0.5 text-bread-900/80 transition-colors hover:text-bread-900"
                >
                  {item.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-bread-900/50 transition-colors group-hover:text-bread-600" />
                </a>
              );
            }
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative text-bread-900/80 transition-colors hover:text-bread-900"
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-bread-500 transition-opacity ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <Link
          href="/about"
          className="hidden rounded-full bg-bread-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-bread-600 hover:shadow-bread md:inline-flex"
        >
          关注我
        </Link>

        <Link
          href="/about"
          className="rounded-full bg-bread-500 px-3 py-1.5 text-xs font-medium text-white md:hidden"
        >
          关注
        </Link>
      </div>
    </header>
  );
}
