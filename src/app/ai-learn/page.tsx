import { CourseCatalog } from "@/components/CourseCatalog";
import { getSeriesArticles } from "@/lib/articles";
import { BREAD_SERIES_SLUG } from "@/lib/bread-series";

export const metadata = {
  title: "AI 学习",
  description: "从真实项目出发的 AI 系列课程：Agent、MCP、RAG、浏览器操作与多智能体协作。",
};

export default function AiLearnPage() {
  const chapters = getSeriesArticles(BREAD_SERIES_SLUG);

  return (
    <main>
      <section className="container-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">AI learning</p>
            <h1 className="display-title mt-4 text-4xl md:text-6xl">AI 学习</h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-bread-900/62">这里放成体系的课程。一套课解决一类问题，按顺序学完，最后能留下一个真正跑得起来的项目。</p>
        </div>
      </section>
      <CourseCatalog chapterCount={chapters.length} />
    </main>
  );
}
