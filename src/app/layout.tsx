import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWechat } from "@/components/FloatingWechat";
import "./globals.css";

const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  title: "AI面包君 — 给普通人的 AI 课",
  description:
    "AI面包君是一个面向非从业者的 AI 知识分享站。AI 工具评测、提示词技巧、真实使用案例，每篇看完都能上手。",
  openGraph: {
    title: "AI面包君 — 给普通人的 AI 课",
    description: "给普通人讲明白 AI。",
    type: "website",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={notoSC.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWechat />
      </body>
    </html>
  );
}
