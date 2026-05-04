import { MatrixNode } from "@/components/MatrixNode";
import { PlayerCard } from "@/components/PlayerCard";
import { DailyQuest } from "@/components/DailyQuest";
import { AchievementStrip } from "@/components/AchievementStrip";
import { chapters, matrixStats, accentClasses } from "@/data/matrix";

export default function LearnPage() {
  return (
    <>
      <section className="container-page pt-12 pb-6 md:pt-16">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
            学习地图 · LEARN
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-bread-900 md:text-5xl">
            像玩游戏一样学 AI
          </h1>
          <p className="mt-4 text-base leading-relaxed text-bread-900/70 md:text-lg">
            {matrixStats.totalNodes} 个小关卡分布在 {matrixStats.chapters} 个面包房分店里。
            每关 5–10 分钟，从「认识 AI」一路打到「把 AI 用进工作」。每过一关变成更高级的面包君形态。
          </p>
        </div>
      </section>

      <section className="container-page space-y-6">
        <PlayerCard totalNodes={matrixStats.totalNodes} />
        <DailyQuest />
      </section>

      <section className="container-page mt-12 space-y-12">
        {chapters.map((chapter) => {
          const accent = accentClasses[chapter.accent];
          return (
            <div key={chapter.id} className="relative">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-10 items-center rounded-full border px-3 text-xs font-semibold ${accent.border} ${accent.chip}`}
                  >
                    {chapter.theme}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-bread-900 md:text-2xl">
                      {chapter.title}
                    </h2>
                    <p className="text-xs text-bread-900/55 md:text-sm">
                      {chapter.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-bread-900/50">
                  {chapter.nodes.length} 关 ·{" "}
                  {chapter.nodes.reduce((a, n) => a + n.xp, 0)} XP
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {chapter.nodes.map((node) => (
                  <MatrixNode key={node.id} node={node} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="container-page mt-16 mb-12">
        <AchievementStrip />
      </section>
    </>
  );
}
