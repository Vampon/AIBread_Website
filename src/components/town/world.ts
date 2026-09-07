export const WORLD_W = 1120;
export const WORLD_H = 720;
export const CELL = 16;
export type Point = { x: number; y: number };
export type Place = Point & { id: string; name: string; label: string; description: string; href: string; w: number; h: number; color: string; sign: string; entry?: Point };
export const places: Place[] = [
  { id: "work", name: "作品工坊", label: "WORKSHOP", description: "我用 AI 做的网站、工具和小游戏。推开门，看看最近做了什么。", href: "/work", x: 200, y: 147, w: 158, h: 139, color: "#8de3cf", sign: "BUILD / PLAY" },
  { id: "about", name: "面包屋", label: "BREAD & FRIENDS", description: "你好，我是 AI面包君。这里是我的个人小镇，欢迎随便逛逛，也欢迎来聊聊你的想法。", href: "/about", x: 468, y: 112, w: 173, h: 160, color: "#ffc58b", sign: "BAKERY" },
  { id: "blog", name: "博客书店", label: "LATE NIGHT BOOKS", description: "工具体验、开发笔记，还有那些终于想明白的事。找一本，慢慢读。", href: "/blog", x: 792, y: 157, w: 166, h: 135, color: "#d4adf3", sign: "BOOKS" },
  { id: "resources", name: "学习温室", label: "GROW SOMETHING", description: "系统课程、互动练习和学习资料都种在这里。选一条路线，慢慢把它做出来。", href: "/ai-learn", x: 220, y: 460, w: 169, h: 134, color: "#bcdf95", sign: "LEARN" },
  { id: "news", name: "消息电台", label: "RADIO 98.6", description: "接收来自 AI 世界的新消息。看看今天发生了什么，再回到自己的节奏。", href: "/news", x: 549, y: 484, w: 143, h: 122, color: "#f0a3bd", sign: "ON AIR" },
  { id: "navigation", name: "导航车站", label: "NEXT STOP: AI", description: "写作、画图、编程……选择你的目的地，去找一个用得上的 AI 工具。", href: "https://navigation.aibread.site/", x: 826, y: 454, w: 157, h: 136, color: "#8ac9e1", sign: "AI STATION" },
];
// Door and collision positions calibrated against the generated map, in world pixels.
const mapBounds = [
  { x: 205, y: 71, w: 179, h: 184, entry: { x: 292, y: 275 } },
  { x: 453, y: 51, w: 237, h: 206, entry: { x: 580, y: 278 } },
  { x: 778, y: 75, w: 190, h: 182, entry: { x: 871, y: 278 } },
  { x: 207, y: 401, w: 181, h: 209, entry: { x: 297, y: 638 } },
  { x: 454, y: 416, w: 236, h: 203, entry: { x: 578, y: 649 } },
  { x: 773, y: 402, w: 237, h: 220, entry: { x: 828, y: 648 } },
];
places.forEach((place, i) => Object.assign(place, mapBounds[i]));
export const spriteFiles = ["031-1787634993269-frames64.png", "065-1787639284716-frames64.png", "068-1787639591644-frames64.png", "074-1787640509520-frames64.png", "095-1787646339965-frames64.png", "127-1787656917483-frames64.png"];
export const door = (p: Place): Point => p.entry ?? ({ x: p.x + p.w / 2, y: p.y + p.h + 23 });
export const breadSpots: Point[] = [{ x: 392, y: 316 }, { x: 726, y: 319 }, { x: 745, y: 481 }, { x: 405, y: 624 }, { x: 154, y: 388 }];
export const fountain = { x: 524, y: 317, w: 99, h: 75 };
export function blocked(p: Point): boolean {
  if (p.x < 24 || p.x > WORLD_W - 24 || p.y < 75 || p.y > WORLD_H - 38) return true;
  if (p.x < 145) return true;
  return [...places, fountain].some(b => p.x > b.x - 9 && p.x < b.x + b.w + 9 && p.y > b.y - 5 && p.y < b.y + b.h + 8);
}

/** Grid search keeps click-to-walk and resident schedules out of buildings. */
export function findPath(start: Point, target: Point): Point[] {
  const cols = WORLD_W / CELL;
  const rows = WORLD_H / CELL;
  const cell = (p: Point) => ({ x: Math.floor(p.x / CELL), y: Math.floor(p.y / CELL) });
  const center = (x: number, y: number) => ({ x: x * CELL + 8, y: y * CELL + 8 });
  const s = cell(start);
  const t = cell(target);
  if (blocked(center(t.x, t.y))) return [];
  const key = (x: number, y: number) => y * cols + x;
  const origin = key(s.x, s.y), goal = key(t.x, t.y);
  const queue = [origin], prev = new Map<number, number>([[origin, -1]]);
  for (let head = 0; head < queue.length && !prev.has(goal); head++) {
    const current = queue[head], x = current % cols, y = Math.floor(current / cols);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, next = key(nx, ny);
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || prev.has(next) || blocked(center(nx, ny))) continue;
      prev.set(next, current); queue.push(next);
    }
  }
  if (!prev.has(goal)) return [];
  const result: Point[] = [];
  for (let cursor = goal; cursor !== origin; cursor = prev.get(cursor)!) result.push(center(cursor % cols, Math.floor(cursor / cols)));
  return result.reverse();
}

export type Actor = Point & { name: string; sprite: number; direction: "down" | "up" | "left" | "right"; moving: boolean; path: Point[]; activity: string; bubble: string; bubbleUntil: number; wait: number; visit: number; meeting?: number };
export const residents = [
  { name: "阿焙", sprite: 1, x: 556, y: 298, activity: "在等面包出炉", line: "刚出炉的，拿一个？", route: [1, 0, 1, 3, 1] },
  { name: "小零", sprite: 2, x: 289, y: 338, activity: "去工坊修东西", line: "那个小工具终于能跑了！", route: [0, 4, 2, 0, 1] },
  { name: "柚子", sprite: 3, x: 760, y: 411, activity: "在广场散步", line: "今天想学点不一样的。", route: [3, 2, 1, 5, 3] },
  { name: "波波", sprite: 4, x: 882, y: 330, activity: "给书店送信", line: "书店又多了几篇新笔记。", route: [2, 5, 4, 1, 2] },
  { name: "M-07", sprite: 5, x: 627, y: 437, activity: "收集电台信号", line: "滴。今天的好奇心充满了。", route: [4, 0, 5, 3, 4] },
];
export function makeResidents(): Actor[] {
  return residents.map((r, i) => ({ ...r, direction: "down", moving: false, path: [], bubble: r.line, bubbleUntil: 5 + i * 2, wait: 2 + i * 3, visit: 0 }));
}
export function stepActor(actor: Actor, dt: number, speed: number) {
  const next = actor.path[0];
  actor.moving = !!next;
  if (!next) return;
  const dx = next.x - actor.x, dy = next.y - actor.y, distance = Math.hypot(dx, dy);
  actor.direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up";
  if (distance < speed * dt) { actor.x = next.x; actor.y = next.y; actor.path.shift(); }
  else { actor.x += dx / distance * speed * dt; actor.y += dy / distance * speed * dt; }
}
