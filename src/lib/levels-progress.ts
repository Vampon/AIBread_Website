import { chapters, type LevelNode } from "@/data/matrix";
import { getLevel } from "@/data/levels";

/**
 * 一个关卡是否可玩。规则：
 *   1. 节点 unlocked: true（作者已开放）
 *   2. 已注册 level 文件（有可玩内容）
 *   3. 在本章节里，它前面"unlocked + 有文件"的最近节点必须已通关；
 *      若它是本章节第一个 unlocked+有文件 的节点，无前置要求。
 *
 * 这条规则保证：c2-2 必须 c2-1 通关；c5-3 必须 c5-1 通关（c5-2 没文件，
 * 会被跳过当作不存在）；新章节第一关永远可玩。
 */
export function isLevelPlayable(
  nodeId: string,
  completedLevels: string[]
): {
  playable: boolean;
  reason?: "no-content" | "needs-prev";
  prevNodeId?: string;
  prevNodeTitle?: string;
} {
  const chapter = chapters.find((c) => c.nodes.some((n) => n.id === nodeId));
  if (!chapter) return { playable: false, reason: "no-content" };

  const idx = chapter.nodes.findIndex((n) => n.id === nodeId);
  const node = chapter.nodes[idx];
  if (!node.unlocked) return { playable: false, reason: "no-content" };
  if (!getLevel(nodeId)) return { playable: false, reason: "no-content" };

  const prevPlayables = chapter.nodes
    .slice(0, idx)
    .filter((n) => n.unlocked && getLevel(n.id));

  if (prevPlayables.length === 0) return { playable: true };

  const lastPrev = prevPlayables[prevPlayables.length - 1];
  if (completedLevels.includes(lastPrev.id)) return { playable: true };
  return {
    playable: false,
    reason: "needs-prev",
    prevNodeId: lastPrev.id,
    prevNodeTitle: lastPrev.title,
  };
}

/** 取本章节里"下一个节点"（不论是否解锁、是否有文件）。 */
export function getNextNode(currentNodeId: string): LevelNode | undefined {
  const chapter = chapters.find((c) =>
    c.nodes.some((n) => n.id === currentNodeId)
  );
  if (!chapter) return undefined;
  const idx = chapter.nodes.findIndex((n) => n.id === currentNodeId);
  return chapter.nodes[idx + 1];
}
