"use client";

import { useSimulator } from "./SimulatorContext";

const VERSION = "v2.1.132";

const TIPS = [
  "敲点什么开始体验，或点下方快速命令",
  "右边「为什么」面板会同步告诉你这一步的原理",
];

const WHATS_NEW = [
  "仿真权限对话框 —— 看清 Claude 何时征求许可",
  "工具调用同步显示 —— Read/Bash/Edit 一目了然",
  "上下文压缩 / 注入记忆 / 子代理 等机制可玩",
  "/release-notes for more",
];

// ---- Logo: 把 Unicode quadrant 字符拆成 2×2 子像素，再用 CSS grid 渲染 ----
// 这样不依赖字体, 相邻方块零间距, 不会再有缝隙

const LOGO_LINES = [
  " ▐▛███▜▌ ",
  "▝▜█████▛▘",
  "  ▘▘ ▝▝  ",
];

/** [TL, TR, BL, BR] 4 个子像素是否填充 */
const QUAD: Record<string, readonly [number, number, number, number]> = {
  " ": [0, 0, 0, 0],
  "█": [1, 1, 1, 1],
  "▌": [1, 0, 1, 0],
  "▐": [0, 1, 0, 1],
  "▀": [1, 1, 0, 0],
  "▄": [0, 0, 1, 1],
  "▖": [0, 0, 1, 0],
  "▗": [0, 0, 0, 1],
  "▘": [1, 0, 0, 0],
  "▝": [0, 1, 0, 0],
  "▙": [1, 0, 1, 1],
  "▚": [1, 0, 0, 1],
  "▛": [1, 1, 1, 0],
  "▜": [1, 1, 0, 1],
  "▞": [0, 1, 1, 0],
  "▟": [0, 1, 1, 1],
};

const LOGO_GRID: number[][] = (() => {
  const cols = Math.max(...LOGO_LINES.map((l) => l.length)) * 2;
  const out: number[][] = [];
  for (const line of LOGO_LINES) {
    const top: number[] = [];
    const bot: number[] = [];
    for (const ch of line) {
      const q = QUAD[ch] ?? [0, 0, 0, 0];
      top.push(q[0], q[1]);
      bot.push(q[2], q[3]);
    }
    while (top.length < cols) top.push(0);
    while (bot.length < cols) bot.push(0);
    out.push(top, bot);
  }
  return out;
})();

function ClaudeLogo({ cellPx = 6 }: { cellPx?: number }) {
  const cols = LOGO_GRID[0].length;
  const rows = LOGO_GRID.length;
  return (
    <div
      role="img"
      aria-label="Claude Code"
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
        gap: 0,
        lineHeight: 0,
      }}
    >
      {LOGO_GRID.flatMap((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r}-${c}`}
            style={{ background: v ? "#D97757" : "transparent" }}
          />
        ))
      )}
    </div>
  );
}

// ---- Banner ----------------------------------------------------------------

/**
 * 启动欢迎框 —— 仿真 Claude Code v2.x 启动时打印的双列框：
 *   ╭── Claude Code v2.x ──────────────────────╮
 *   │  Welcome back!         │ Tips...         │
 *   │      [logo]            │  · ...          │
 *   │  Opus 4.7 · ...        │ What's new ...  │
 *   ╰────────────────────────────────────────────╯
 *
 * 标题用绝对定位嵌在顶部 border 上，bg 与 Terminal 同色 (bg-slate-950) 来盖住后面的 border 线段。
 */
export function Banner() {
  const state = useSimulator();
  return (
    <div className="relative my-1">
      <div className="pointer-events-none absolute -top-[8px] left-4 z-10 bg-slate-950 px-2 font-mono text-[11px] text-[#D97757]/80">
        ─── Claude Code {VERSION} ───
      </div>

      <div className="rounded-md border border-[#D97757]/40 bg-slate-950 px-4 pb-4 pt-5 font-mono text-[11.5px] leading-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-0 md:divide-x md:divide-[#D97757]/20">
          <div className="text-center md:pr-4">
            <div className="text-slate-100">
              Welcome back, <span className="text-amber-200">面包君</span>!
            </div>
            <div className="my-3 flex justify-center">
              <ClaudeLogo cellPx={6} />
            </div>
            <div className="space-y-0.5">
              <div className="text-slate-300">
                Opus 4.7 (1M context) · Claude Max ·
              </div>
              <div className="text-slate-300">AI面包君的 Organization</div>
              <div className="truncate text-slate-400">{state.cwd}</div>
            </div>
          </div>

          <div className="md:pl-4">
            <div className="text-slate-100">Tips for getting started</div>
            <ul className="mt-1 space-y-0.5 text-slate-400">
              {TIPS.map((tip, i) => (
                <li key={i} className="truncate">
                  {tip}
                </li>
              ))}
            </ul>

            <div className="my-2 border-t border-slate-700/40" />

            <div className="text-slate-100">What&apos;s new</div>
            <ul className="mt-1 space-y-0.5 text-slate-400">
              {WHATS_NEW.map((w, i) => (
                <li key={i} className="truncate">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
