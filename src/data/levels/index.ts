/**
 * 关卡注册表
 *
 * 加新关卡的步骤：
 * 1. 在 src/data/levels/ 下建一个新文件，比如 `c1-2.ts`
 * 2. 文件 export default 一个 Level 对象（参考 c1-1.ts）
 * 3. 回到这个文件，加一行 import + 加进 levels 数组
 * 4. 把对应的节点在 src/data/matrix.ts 里设为 `unlocked: true`
 *
 * 仅此而已。
 */

import type { Level } from "@/lib/levels";
import c1_1 from "./c1-1";
import c1_2 from "./c1-2";
import c1_3 from "./c1-3";
import c1_4 from "./c1-4";
import c1_5 from "./c1-5";
import c2_1 from "./c2-1";
import c2_2 from "./c2-2";
import c2_3 from "./c2-3";
import c2_4 from "./c2-4";
import c2_5 from "./c2-5";
import c3_1 from "./c3-1";
import c3_2 from "./c3-2";
import c3_3 from "./c3-3";
import c3_4 from "./c3-4";
import c3_5 from "./c3-5";
import c3_6 from "./c3-6";
import c4_1 from "./c4-1";
import c4_2 from "./c4-2";
import c4_3 from "./c4-3";
import c4_4 from "./c4-4";
import c4_5 from "./c4-5";
import c4_6 from "./c4-6";
import c5_1 from "./c5-1";
import c5_2 from "./c5-2";
import c5_3 from "./c5-3";
import c5_4 from "./c5-4";
import c5_5 from "./c5-5";
import c5_6 from "./c5-6";
import c6_1 from "./c6-1";
import c6_2 from "./c6-2";
import c6_3 from "./c6-3";
import c6_4 from "./c6-4";
import c6_5 from "./c6-5";
import c7_1 from "./c7-1";
import c7_2 from "./c7-2";
import c7_3 from "./c7-3";
import c7_4 from "./c7-4";
import c7_5 from "./c7-5";
import c8_1 from "./c8-1";
import c8_2 from "./c8-2";
import c8_3 from "./c8-3";
import c8_4 from "./c8-4";
import c8_5 from "./c8-5";

const levels: Level[] = [
  c1_1, c1_2, c1_3, c1_4, c1_5,
  c2_1, c2_2, c2_3, c2_4, c2_5,
  c3_1, c3_2, c3_3, c3_4, c3_5, c3_6,
  c4_1, c4_2, c4_3, c4_4, c4_5, c4_6,
  c5_1, c5_2, c5_3, c5_4, c5_5, c5_6,
  c6_1, c6_2, c6_3, c6_4, c6_5,
  c7_1, c7_2, c7_3, c7_4, c7_5,
  c8_1, c8_2, c8_3, c8_4, c8_5,
];

const map: Record<string, Level> = Object.fromEntries(
  levels.map((l) => [l.id, l])
);

export function getLevel(id: string): Level | undefined {
  return map[id];
}

export function getAllLevels(): Level[] {
  return levels;
}

export function getLevelIds(): string[] {
  return levels.map((l) => l.id);
}
