import { getNewsBundle } from "@/lib/news/curate";
import { NewsBoard } from "@/components/NewsBoard";

export const metadata = {
  title: "AI 消息站",
  description: "每天更新的中文 AI 行业消息，保留来源，一键直达原文。",
};

export const revalidate = 86_400;

export default async function NewsPage() {
  const bundle = await getNewsBundle();

  return (
    <>
      <section className="container-page">
        <div className="page-intro items-end">
          <div><p className="eyebrow">AI signal station · 中文频道</p><h1 className="display-title mt-4 text-4xl md:text-6xl">AI 消息站</h1></div>
          <div><p className="max-w-xl text-sm leading-7 text-bread-900/62">从机器之心、量子位等中文媒体开始，把一天里真正值得点开的 AI 动态集中到一处。重要厂商的英文原始发布仍会保留在“官方原声”频道。</p></div>
        </div>
      </section>

      <section className="container-page mt-7 pb-16">
        <NewsBoard items={bundle.items} failedSources={bundle.failedSources} generatedAt={bundle.generatedAt} />
      </section>
    </>
  );
}
