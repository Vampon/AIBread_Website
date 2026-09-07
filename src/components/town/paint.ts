import { Actor, breadSpots, fountain, Place, places, Point, WORLD_H, WORLD_W } from "./world";

type Ctx = CanvasRenderingContext2D;
const ink = "#252435";
function rect(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h);
}
function poly(c: Ctx, points: number[][], color: string) {
  c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
}
function text(c: Ctx, value: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "center") {
  c.font = `bold ${size}px "Microsoft YaHei", monospace`; c.fillStyle = color; c.textAlign = align; c.fillText(value, Math.round(x), Math.round(y));
}
function rand(seed: number) { const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }
export function bread(c: Ctx, x: number, y: number, scale = 1) {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(scale, scale);
  rect(c, -9, -7, 18, 12, "#9d593f"); rect(c, -7, -10, 14, 16, "#d49358"); rect(c, -5, -12, 10, 17, "#ffd699");
  rect(c, -7, -8, 14, 10, "#efb971"); rect(c, -4, -9, 2, 5, "#fff0bf"); rect(c, 2, -8, 2, 5, "#fff0bf"); c.restore();
}
function tree(c: Ctx, x: number, y: number, s = 1, pink = false) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rect(c, -21, 1, 44, 9, "#293441"); rect(c, -4, -22, 9, 30, "#655061"); rect(c, 1, -22, 4, 29, "#3b354b");
  const dark = pink ? "#734f78" : "#304c4e", mid = pink ? "#a96c9d" : "#476b60", light = pink ? "#d594b5" : "#68937a";
  rect(c, -28, -51, 56, 29, dark); rect(c, -20, -65, 40, 52, dark); rect(c, -13, -74, 26, 12, dark);
  rect(c, -25, -52, 47, 23, mid); rect(c, -17, -64, 34, 39, mid); rect(c, -10, -72, 20, 17, mid);
  rect(c, -20, -50, 13, 5, light); rect(c, -13, -62, 13, 5, light); rect(c, -7, -70, 13, 4, light); rect(c, 9, -42, 9, 4, light);
  c.restore();
}
function planter(c: Ctx, x: number, y: number, color = "#d8a1b7") {
  rect(c, x - 9, y, 21, 13, "#393044"); rect(c, x - 11, y, 23, 4, "#bd937b");
  rect(c, x - 6, y - 8, 4, 10, "#76a984"); rect(c, x + 3, y - 12, 4, 15, "#76a984");
  rect(c, x - 8, y - 12, 7, 7, color); rect(c, x + 1, y - 15, 8, 7, color);
}
function window(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  rect(c, x, y, w, h, ink); rect(c, x + 4, y + 4, w - 8, h - 8, color);
  rect(c, x + w / 2 - 2, y + 3, 3, h - 6, "#514658"); rect(c, x + 4, y + h / 2, w - 8, 3, "#514658");
  rect(c, x - 2, y + h, w + 4, 4, "#b59582");
}

function building(c: Ctx, p: Place) {
  const { x, y, w, h, color } = p;
  rect(c, x + 10, y + 29, w + 4, h - 20, "#282534");
  rect(c, x, y + 25, w, h - 25, ink);
  rect(c, x + 4, y + 35, w - 8, h - 40, p.id === "about" ? "#967366" : "#666477");
  rect(c, x + w - 22, y + 35, 18, h - 40, "#4d485e");
  for (let by = y + 45; by < y + h - 7; by += 13) {
    for (let bx = x + 8; bx < x + w - 26; bx += 29) rect(c, bx + (by % 2) * 8, by, 18, 2, "#ffffff0c");
  }
  if (p.id === "resources") {
    poly(c, [[x - 8, y + 45], [x + 36, y], [x + w - 32, y], [x + w + 8, y + 45]], ink);
    poly(c, [[x, y + 39], [x + 39, y + 6], [x + w - 35, y + 6], [x + w, y + 39]], "#558f84");
    for (let i = 0; i < 5; i++) poly(c, [[x + 9 + i * 30, y + 35], [x + 41 + i * 17, y + 9], [x + 50 + i * 17, y + 9], [x + 26 + i * 30, y + 35]], "#8ec5af");
    rect(c, x - 6, y + 41, w + 12, 5, "#b3c8a1");
  } else {
    const roof = p.id === "about" ? "#996873" : p.id === "blog" ? "#71618a" : "#496377";
    poly(c, [[x - 8, y + 47], [x + 13, y + 1], [x + w - 12, y + 1], [x + w + 8, y + 47]], ink);
    poly(c, [[x - 1, y + 40], [x + 17, y + 6], [x + w - 17, y + 6], [x + w + 1, y + 40]], roof);
    for (let r = 0; r < 5; r++) {
      rect(c, x + 15 - r * 3, y + 9 + r * 7, w - 30 + r * 6, 2, "#ffffff18");
      for (let n = 0; n < 7; n++) rect(c, x + 19 + n * 18 + (r % 2) * 5, y + 10 + r * 7, 2, 5, "#151b352c");
    }
    rect(c, x - 7, y + 43, w + 14, 7, "#37354d"); rect(c, x - 7, y + 43, w + 14, 2, color);
  }
  const signY = y + 53;
  rect(c, x + 16, signY, w - 32, 22, ink); rect(c, x + 19, signY + 3, w - 38, 1, color);
  text(c, p.sign, x + w / 2, signY + 16, p.id === "navigation" ? 10 : 12, color);
  window(c, x + 13, y + h - 49, 35, 31, p.id === "blog" ? "#d0a1c7" : p.id === "resources" ? "#aad29b" : "#efc28c");
  window(c, x + w - 53, y + h - 49, 35, 31, p.id === "work" ? "#82c8c6" : "#efc28c");
  rect(c, x + w / 2 - 15, y + h - 48, 30, 48, "#292a3e"); rect(c, x + w / 2 - 10, y + h - 43, 20, 38, "#6e6976");
  rect(c, x + w / 2 - 7, y + h - 39, 14, 18, color); rect(c, x + w / 2 + 5, y + h - 17, 3, 3, "#ffd699");
  rect(c, x + w / 2 - 21, y + h - 1, 42, 5, "#9e959c"); rect(c, x + w / 2 - 25, y + h + 4, 50, 5, "#6d697a");
  planter(c, x + 6, y + h - 10, color); planter(c, x + w - 4, y + h - 10, color);
  if (p.id === "about") {
    rect(c, x + 8, y + 76, w - 16, 13, "#e7ba92");
    for (let i = 0; i < 8; i++) rect(c, x + 8 + i * 20, y + 76, 10, 17, "#b3747c");
    bread(c, x + w / 2, y + 17, 1.6);
    rect(c, x + w - 41, y - 17, 18, 27, "#584859"); rect(c, x + w - 45, y - 19, 26, 6, "#a98687");
  }
  if (p.id === "work") {
    rect(c, x + 27, y - 14, 57, 20, ink); rect(c, x + 31, y - 11, 49, 13, "#729fbc");
    for (let i = 0; i < 5; i++) rect(c, x + 36 + i * 9, y - 10, 2, 13, "#3e5c7b");
    rect(c, x + w + 6, y + 65, 15, 39, ink); text(c, "+", x + w + 13, y + 88, 15, color);
  }
  if (p.id === "news") {
    rect(c, x + 28, y - 51, 4, 55, "#868099"); rect(c, x + 18, y - 40, 26, 3, "#b4a9be"); rect(c, x + 11, y - 28, 40, 3, "#b4a9be");
    rect(c, x + 26, y - 55, 8, 6, "#ffbdb5");
  }
  if (p.id === "blog") {
    for (let i = 0; i < 5; i++) rect(c, x + 19 + i * 5, y + h - 34, 3, 11 + i % 3, ["#ac6c8c", "#87aaaa", "#d5aa7a"][i % 3]);
  }
  if (p.id === "navigation") {
    rect(c, x + 24, y + h + 24, 131, 4, "#a18a91"); rect(c, x + 24, y + h + 35, 131, 4, "#a18a91");
    for (let i = 0; i < 10; i++) rect(c, x + 27 + i * 13, y + h + 22, 4, 21, "#524651");
  }
}

export function createTerrain(): HTMLCanvasElement {
  const canvas = document.createElement("canvas"); canvas.width = WORLD_W; canvas.height = WORLD_H;
  const c = canvas.getContext("2d")!; c.imageSmoothingEnabled = false;
  rect(c, 0, 0, WORLD_W, WORLD_H, "#30403f");
  for (let i = 0; i < 3700; i++) {
    const x = Math.floor(rand(i) * WORLD_W / 3) * 3, y = Math.floor(rand(i + 5100) * WORLD_H / 3) * 3;
    rect(c, x, y, 3 + Math.floor(rand(i + 300) * 3), 2, ["#41544b", "#364941", "#263b3b", "#4d5d4d"][i % 4]);
  }
  // Walkways connect every doorway, with tiled gutters and small embedded lights.
  const paths = [{ x: 132, y: 310, w: 920, h: 127 }, { x: 399, y: 252, w: 57, h: 418 }, { x: 727, y: 257, w: 62, h: 411 }, ...places.map(p => ({ x: p.x + p.w / 2 - 27, y: p.y < 300 ? p.y + p.h : 410, w: 54, h: p.y < 300 ? 365 - p.y - p.h : p.y - 398 }))];
  for (const p of paths) { rect(c, p.x - 5, p.y - 5, p.w + 10, p.h + 10, "#232e38"); rect(c, p.x, p.y, p.w, p.h, "#767078"); }
  for (const p of paths) {
    for (let y = p.y + 3; y < p.y + p.h - 4; y += 12) for (let x = p.x + 3; x < p.x + p.w - 5; x += 19) {
      rect(c, x, y, 16, 9, rand(x + y) > .5 ? "#837e84" : "#6d6a76"); rect(c, x, y + 9, 16, 1, "#555264");
    }
  }
  for (let x = 154; x < 1040; x += 50) { rect(c, x, 312, 14, 3, "#a7a69c"); rect(c, x, 430, 14, 3, "#a7a69c"); }
  // Canal and its stepped stone banks.
  poly(c, [[0, 447], [55, 447], [55, 470], [98, 470], [98, 496], [132, 496], [132, 720], [0, 720]], "#777c82");
  poly(c, [[0, 458], [46, 458], [46, 482], [87, 482], [87, 507], [119, 507], [119, 720], [0, 720]], "#2d5467");
  for (let i = 0; i < 100; i++) rect(c, rand(i + 400) * 112, 516 + rand(i + 90) * 203, 12, 2, "#416879");
  rect(c, 2, 575, 151, 50, "#322e40");
  for (let x = 2; x < 150; x += 11) rect(c, x, 580, 9, 40, "#ad8e79");
  rect(c, 0, 573, 153, 4, "#d3b39a"); rect(c, 0, 622, 153, 4, "#d3b39a");
  for (let x = 160; x < 1040; x += 28) {
    rect(c, x, 82, 4, 17, "#8e7777"); rect(c, x, 659, 4, 17, "#8e7777");
  }
  rect(c, 160, 87, 880, 3, "#b29b87"); rect(c, 160, 665, 880, 3, "#b29b87");
  // Borders form a wooded clearing, with a few cherry trees near the shops.
  for (let i = 0; i < 22; i++) tree(c, 24 + i * 53, 82 + rand(i + 20) * 14, .8 + rand(i + 66) * .35, i % 7 === 0);
  for (let i = 0; i < 8; i++) { tree(c, 43 + rand(i + 900) * 36, 136 + i * 38, .85, i === 3); tree(c, 1061 + rand(i + 81) * 32, 159 + i * 63, 1.05, i === 5); }
  [[162, 194], [693, 173], [723, 275], [152, 282], [982, 352], [162, 481], [486, 532], [747, 630], [1013, 493], [202, 651], [979, 651]].forEach(([x, y], i) => tree(c, x, y, .7 + i % 3 * .14, i % 3 === 0));
  for (let i = 0; i < 90; i++) {
    const x = 155 + rand(i + 24) * 850, y = i < 45 ? 106 + rand(i) * 160 : 612 + rand(i) * 35;
    if (places.some(p => x > p.x - 10 && x < p.x + p.w + 10 && y > p.y - 12 && y < p.y + p.h)) continue;
    rect(c, x, y, 2, 7, "#649d77"); rect(c, x - 2, y - 1, 6, 3, ["#dbaaab", "#dac295", "#91c6b2"][i % 3]);
  }
  // Benches, market crates, a tiny vegetable garden, and the central bread monument.
  for (const [x, y] of [[469, 409], [671, 335], [707, 594], [152, 345]]) {
    rect(c, x, y, 35, 5, "#b48e77"); rect(c, x, y + 7, 35, 5, "#d0a68a"); rect(c, x + 3, y + 12, 4, 6, ink); rect(c, x + 28, y + 12, 4, 6, ink);
  }
  for (let i = 0; i < 4; i++) {
    rect(c, 249 + i * 30, 620, 23, 18, "#6e5254"); rect(c, 252 + i * 30, 622, 17, 2, "#aa7d65"); planter(c, 260 + i * 30, 615, "#d7b272");
  }
  const f = fountain;
  rect(c, f.x - 10, f.y + 8, f.w + 20, f.h - 8, ink); rect(c, f.x - 6, f.y + 4, f.w + 12, f.h - 8, "#a0a0a9");
  rect(c, f.x, f.y + 9, f.w, f.h - 18, "#619a9f"); rect(c, f.x + 27, f.y - 10, 25, 45, "#9a8690");
  rect(c, f.x + 23, f.y - 12, 33, 6, "#bba6a0"); bread(c, f.x + 39, f.y - 26, 1.9);
  text(c, "面 包 广 场", 593, 451, 10, "#c9baa6");
  // A ramen cart and delivery bike.
  rect(c, 947, 363, 40, 23, "#ad7786"); rect(c, 943, 356, 48, 7, "#ddb993"); rect(c, 949, 382, 7, 7, ink); rect(c, 979, 382, 7, 7, ink);
  rect(c, 943, 343, 48, 6, "#de9f9c"); rect(c, 947, 347, 3, 14, "#d1b8a2"); rect(c, 984, 347, 3, 14, "#d1b8a2");
  for (const p of places) building(c, p);
  // Utility cables cross the street; little colored pennants break up the skyline.
  c.strokeStyle = "#2b2939"; c.lineWidth = 2; c.beginPath(); c.moveTo(367, 172); c.quadraticCurveTo(423, 206, 464, 163); c.stroke();
  for (let i = 0; i < 5; i++) poly(c, [[378 + i * 16, 180], [389 + i * 16, 182], [383 + i * 16, 191]], ["#cda9b7", "#a7c6ae", "#d7b18f"][i % 3]);
  return canvas;
}

export type Frame = { time: number; night: number; rain: boolean; player: Actor; npcs: Actor[]; images: HTMLImageElement[]; backdrop?: HTMLImageElement; found: number[]; near: string | null; destination: Point | null; reduced: boolean };
export function drawWorld(c: Ctx, terrain: HTMLCanvasElement, frame: Frame) {
  const { time: t, player, npcs, images, night, reduced } = frame;
  c.imageSmoothingEnabled = false;
  const hasMap = !!frame.backdrop?.complete && !!frame.backdrop.naturalWidth;
  c.drawImage(hasMap ? frame.backdrop! : terrain, 0, 0, WORLD_W, WORLD_H);
  if (night > 0) rect(c, 0, 0, WORLD_W, WORLD_H, `rgba(16,17,50,${night * .24})`);
  // Local light pools stay on the ground, beneath characters.
  for (const p of places) {
    c.save(); const glow = c.createRadialGradient(p.x + p.w / 2, p.y + p.h, 3, p.x + p.w / 2, p.y + p.h, 75);
    glow.addColorStop(0, `rgba(255,199,133,${.06 + night * .19})`); glow.addColorStop(1, "transparent"); c.fillStyle = glow; c.fillRect(p.x - 15, p.y + p.h - 45, p.w + 30, 110); c.restore();
    if (frame.near === p.id) {
      c.strokeStyle = p.color; c.lineWidth = 2; c.strokeRect(p.x - 6, p.y - 5, p.w + 12, p.h + 16);
    }
  }
  for (const [x, y] of (hasMap ? [] : [[181, 308], [427, 274], [754, 287], [1008, 313], [449, 454], [765, 456], [177, 621], [1009, 622]])) {
    rect(c, x - 5, y + 9, 13, 5, "#232434"); rect(c, x - 1, y - 28, 4, 41, "#4a485a"); rect(c, x - 7, y - 31, 16, 10, "#e8cd9e"); rect(c, x - 10, y - 34, 22, 4, ink);
    if (night > .1) { c.fillStyle = `rgba(255,213,146,${night * .13})`; c.beginPath(); c.arc(x, y, 34, 0, Math.PI * 2); c.fill(); }
  }
  for (let i = 0; i < 7; i++) {
    const x = 32 + i * 11, y = 523 + (i * 31 + (reduced ? 0 : t * 4)) % 162;
    rect(c, x, y, 11 + i % 3 * 4, 2, "#86b8bd88");
  }
  // Bakery steam, radio signal, and a cat dozing in the square.
  for (let i = 0; i < 3; i++) {
    const progress = reduced ? i / 3 : (t * .13 + i / 3) % 1;
    rect(c, 604 + Math.sin(progress * 5) * 8, 95 - progress * 48, 7 + progress * 8, 6, `rgba(226,206,198,${(1 - progress) * .48})`);
  }
  rect(c, 652, 380, 19, 9, "#d7b58b"); rect(c, 652, 376, 7, 7, "#d7b58b"); rect(c, 652, 373, 3, 5, "#d7b58b"); rect(c, 658, 374, 3, 5, "#d7b58b"); rect(c, 653, 381, 2, 1, ink);
  text(c, "z", 676, 373 - (reduced ? 0 : Math.sin(t) * 2), 9, "#cbbdc7");
  breadSpots.forEach((p, i) => {
    if (frame.found.includes(i)) return;
    const bob = reduced ? 0 : Math.sin(t * 2.5 + i) * 3;
    rect(c, p.x - 7, p.y + 6, 15, 3, "#2e2b3b66"); bread(c, p.x, p.y + bob, .7);
    rect(c, p.x + 11, p.y - 10 + bob, 2, 5, "#ffe6a5"); rect(c, p.x + 10, p.y - 9 + bob, 4, 2, "#ffe6a5");
  });
  if (frame.destination) {
    const d = frame.destination; c.strokeStyle = "#b8e8d6"; c.lineWidth = 2; c.strokeRect(d.x - 5, d.y - 3, 10, 6);
  }
  const actors = [...npcs, player].sort((a, b) => a.y - b.y);
  actors.forEach(actor => {
    rect(c, actor.x - 10, actor.y - 1, 21, 5, "#20202e66");
    const image = images[actor.sprite];
    const moving = actor.moving && !reduced;
    const row = moving
      ? actor.direction === "up" ? 9 : actor.direction === "down" ? 7 : 8
      : actor.direction === "up" ? 12 : actor.direction === "down" ? 10 : 11;
    const f = moving ? Math.floor(t * 9) % 6 : 0;
    if (image?.complete && image.naturalWidth) {
      c.save(); c.translate(Math.round(actor.x), Math.round(actor.y)); if (actor.direction === "right") c.scale(-1, 1);
      c.drawImage(image, f * 64, row * 64, 64, 64, -40, -69, 80, 80); c.restore();
    } else { rect(c, actor.x - 6, actor.y - 26, 12, 20, actor === player ? "#d6b5e8" : "#a3d2c5"); rect(c, actor.x - 5, actor.y - 34, 10, 9, "#dfb4a4"); }
    if (actor === player) {
      poly(c, [[actor.x - 4, actor.y - 59], [actor.x + 4, actor.y - 59], [actor.x, actor.y - 54]], "#fff0bb");
      text(c, "你", actor.x, actor.y + 17, 10, "#fff1cc");
    } else text(c, actor.name, actor.x, actor.y + 16, 9, "#d0d0cb");
  });
  // DOM-independent labels remain crisp at the same map zoom as their buildings.
  for (const p of places) {
    const width = p.name.length * 13 + 24, x = p.x + p.w / 2, y = p.y > 350 ? p.y + p.h - 30 : p.y + 55;
    rect(c, x - width / 2, y, width, 24, "#252638ee"); rect(c, x - width / 2, y, 3, 24, p.color);
    text(c, p.name, x + 1, y + 16, 12, "#e6ded5");
  }
  npcs.forEach(actor => {
    if (actor.bubbleUntil < t) return;
    c.font = '10px "Microsoft YaHei", monospace'; const w = c.measureText(actor.bubble).width + 18;
    rect(c, actor.x - w / 2, actor.y - 83, w, 24, "#e9dfca"); rect(c, actor.x - 2, actor.y - 59, 5, 4, "#e9dfca");
    text(c, actor.bubble, actor.x, actor.y - 67, 10, "#494252");
  });
  if (!reduced) {
    for (let i = 0; i < 18; i++) {
      const x = (rand(i + 221) * WORLD_W + Math.sin(t * .3 + i) * 15), y = rand(i + 622) * WORLD_H + Math.cos(t * .5 + i) * 7;
      rect(c, x, y, 2, 2, `rgba(244,215,155,${.18 + (Math.sin(t * 1.5 + i) + 1) * .22})`);
    }
    if (frame.rain) for (let i = 0; i < 180; i++) {
      const x = (rand(i + 644) * WORLD_W - t * 29 % WORLD_W + WORLD_W) % WORLD_W, y = (rand(i + 32) * WORLD_H + t * 200) % WORLD_H;
      rect(c, x, y, 1, 7, "#b6c4df55");
    }
  }
}
