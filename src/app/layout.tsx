import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWechat } from "@/components/FloatingWechat";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aibread.site"),
  title: {
    default: "AI面包君 — 把 AI 做成人人会用的工具",
    template: "%s · AI面包君",
  },
  description:
    "AI面包君是一个面向非从业者的 AI 知识分享站。AI 工具评测、提示词技巧、真实使用案例，每篇看完都能上手。",
  openGraph: {
    title: "AI面包君 — 把 AI 做成人人会用的工具",
    description: "AI 学习笔记、实用工具与真实创作实验。",
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
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWechat />
      </body>
    </html>
  );
}
