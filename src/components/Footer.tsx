"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterCol = { title: string; links: FooterLink[] };

const cols: FooterCol[] = [
  {
    title: "内容",
    links: [
      { label: "首页", href: "/" },
      { label: "AI 日刊", href: "/news" },
      { label: "博客文章", href: "/blog" },
      { label: "学习路径", href: "/learn" },
      { label: "关于我", href: "/about" },
    ],
  },
  {
    title: "找到我",
    links: [
      { label: "B 站", href: "https://space.bilibili.com/3546609602267766", external: true },
      { label: "抖音", href: "https://www.douyin.com/user/MS4wLjABAAAA4XP2qKiH8LOaG5jjuincgnenQisFQHlya2mnl_vjIx8", external: true },
      { label: "小红书", href: "https://www.xiaohongshu.com/user/profile/6953b65a0000000037009210", external: true },
      { label: "公众号", href: "/about#wechat-qr" },
    ],
  },
  {
    title: "相关产品",
    links: [
      { label: "AI 导航站", href: "https://navigation.aibread.site/", external: true },
      { label: "RSS 订阅", href: "/feed.xml" },
      { label: "关于我", href: "/about" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  // 关卡页有自己的底部进度栏，全站 Footer 在那儿会与之打架，所以隐藏
  if (pathname?.startsWith("/learn/") && pathname !== "/learn") {
    return null;
  }
  return (
    <footer className="mt-24 border-t border-bread-100 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-bread-900">
              <span>🍞</span>
              <span>AI面包君</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-bread-900/70">
              给普通人讲明白 AI。每周更新工具评测、提示词技巧、真实使用案例。
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-bread-900">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-bread-900/70">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-bread-600"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-bread-600"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-bread-100 pt-6 text-xs text-bread-900/60">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} AI面包君 · 用 AI 烤出新鲜知识</p>
            <p>本站内容仅代表个人观点，欢迎转发交流。</p>
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="text-center transition-colors hover:text-bread-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bread-400 focus-visible:ring-offset-2"
            >
              豫ICP备2026009346号-1
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
