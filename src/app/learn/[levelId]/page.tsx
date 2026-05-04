import { notFound } from "next/navigation";
import { LevelPlayer } from "@/components/level/LevelPlayer";
import { getLevel, getLevelIds } from "@/data/levels";

export function generateStaticParams() {
  return getLevelIds().map((levelId) => ({ levelId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level) return { title: "找不到这一关 — AI面包君" };
  return {
    title: `${level.emoji} ${level.title} — AI面包君`,
    description: `学习路径 · ${level.id} · 约 ${level.estimatedMin} 分钟`,
  };
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level) notFound();
  return <LevelPlayer level={level} />;
}
