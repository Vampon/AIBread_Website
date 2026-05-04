import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { StatCard } from "@/components/StatCard";
import { ArticleCard } from "@/components/ArticleCard";
import { TopicCard } from "@/components/TopicCard";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllArticles } from "@/lib/articles";
import { topics } from "@/data/topics";
import { matrixStats } from "@/data/matrix";

export default function HomePage() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 4);

  return (
    <>
      <Hero />

      <section className="container-page -mt-6 md:-mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            value="每周"
            label="更新节奏"
            hint="1–2 篇新内容，不刷屏"
          />
          <StatCard
            value={`${articles.length}`}
            label="原创文章"
            hint="每周持续更新"
          />
          <StatCard
            value={`${matrixStats.totalNodes}`}
            label="学习关卡"
            hint={`横跨 ${matrixStats.chapters} 个章节`}
          />
        </div>
      </section>

      <section className="container-page mt-24">
        <SectionTitle
          eyebrow="最新文章"
          title="新鲜出炉"
          description="每周更新。看完就能上手用，不讲玄学，不堆术语。"
          moreHref="/blog"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <section className="container-page mt-24">
        <SectionTitle
          eyebrow="精选专题"
          title="按主题深度啃"
          description="不知道从哪开始？挑一个主题，跟着系列学。"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      <section className="container-page mt-24">
        <Link
          href="/learn"
          className="group relative block overflow-hidden rounded-3xl border border-bread-200 bg-gradient-to-br from-bread-100 via-bread-50 to-white p-10 transition-all hover:-translate-y-1 hover:shadow-bread md:p-14"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-block rounded-full bg-bread-500 px-3 py-1 text-xs font-medium text-white">
                闯关学习
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-bread-900 md:text-4xl">
                AI 学习路径
                <br />
                像玩游戏一样升级
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-bread-900/70">
                把 AI 知识切成 {matrixStats.totalNodes} 个小关卡，从「认识 AI」到「把 AI
                用进工作」。每关 5–10 分钟，一步一个脚印。
              </p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-bread-700">
                进入学习地图
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg border ${
                    i < 5
                      ? "border-bread-300 bg-white"
                      : "border-dashed border-bread-200 bg-bread-50/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </Link>
      </section>

      <section className="container-page mt-24 mb-12">
        <div className="grid gap-8 rounded-3xl border border-bread-100 bg-white p-10 md:grid-cols-[auto_1fr] md:items-center md:p-14">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-bread-300 to-bread-500 text-6xl shadow-bread">
            🍞
          </div>
          <div>
            <h2 className="text-2xl font-bold text-bread-900 md:text-3xl">
              你好，我是面包君
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-bread-900/70">
              一个把 AI 嚼碎了、烤香了再喂给你的内容创作者。
              在 AI 行业摸爬滚打多年，相信好的知识应该像面包一样：松软、好嚼、人人吃得起。
              如果这里的内容帮到你，记得在评论区告诉我下一篇想看什么。
            </p>
            <Link
              href="/about"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-bread-700 transition-colors hover:text-bread-500"
            >
              更多关于我
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
