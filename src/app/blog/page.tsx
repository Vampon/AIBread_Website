import { BlogList } from "@/components/BlogList";
import { getAllArticles, getAllTags } from "@/lib/articles";

export const metadata = {
  title: "博客",
  description: "AI 工具评测、提示词技巧、真实使用案例。每周更新 1–2 篇，不水文，不刷屏。",
};

export default function BlogPage() {
  const articles = getAllArticles();
  const tags = getAllTags();

  return (
    <>
      <section className="container-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Notes & stories</p>
            <h1 className="display-title mt-4 text-4xl md:text-6xl">文章与笔记</h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-bread-900/62">
            AI 工具、提示词、Claude Code 和实际使用记录。可以按分类找，也可以直接搜关键词。
          </p>
        </div>
      </section>

      <BlogList articles={articles} tags={tags} />
    </>
  );
}
