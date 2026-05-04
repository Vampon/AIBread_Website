import { BlogList } from "@/components/BlogList";
import { getAllArticles, getAllTags } from "@/lib/articles";

export const metadata = {
  title: "博客 — AI面包君",
  description: "AI 工具评测、提示词技巧、真实使用案例。每周更新 1–2 篇，不水文，不刷屏。",
};

export default function BlogPage() {
  const articles = getAllArticles();
  const tags = getAllTags();

  return (
    <>
      <section className="container-page pt-16 pb-2 md:pt-20">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
            博客 · BLOG
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-bread-900 md:text-5xl">
            新鲜出炉的 AI 笔记
          </h1>
          <p className="mt-4 text-base leading-relaxed text-bread-900/70 md:text-lg">
            工具评测、提示词技巧、真实使用案例。每周更新 1–2 篇，不水文，不刷屏。
          </p>
        </div>
      </section>

      <BlogList articles={articles} tags={tags} />
    </>
  );
}
