"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Backpack, BookOpen, Check, ClipboardCheck, Compass, Cookie, Gamepad2, Gift, Heart, Home, Radio, Sparkles, UsersRound, X } from "lucide-react";
import { Actor, blocked, breadSpots, door, findPath, makeResidents, Place, places, Point, residents, spriteFiles, stepActor, WORLD_H, WORLD_W } from "./world";
import { createTerrain, drawWorld } from "./paint";
import styles from "./town.module.css";

type Article = { title: string; slug: string; tag: string };
type Project = { id: string; title: string; href: string; isExternal: boolean };
type Log = { id: number; time: string; text: string };
type Panel = { kind: "place"; id: string } | { kind: "resident"; id: number } | { kind: "guide" } | { kind: "directory" } | { kind: "quests" } | { kind: "bag" } | { kind: "neighbors" } | { kind: "fortune" } | null;
type View = { scale: number; x: number; y: number; width: number; height: number };
type Simulation = {
  player: Actor; npcs: Actor[]; keys: Set<string>; time: number; minute: number; paused: boolean; rain: boolean;
  light: "auto" | "day" | "night"; reduced: boolean; found: number[]; near: string | null; destination: Point | null;
  panel: boolean; camera: View; lastChat: number;
};
const icons = [Gamepad2, Home, BookOpen, Sparkles, Radio, Compass];
const chinaClock = () => {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value ?? 0);
  const month = value("month"), day = value("day"), hour = value("hour"), minute = value("minute");
  return {
    minute: hour * 60 + minute,
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    date: `${month}月${day}日`,
    period: hour < 6 ? "深夜" : hour < 9 ? "清晨" : hour < 12 ? "上午" : hour < 14 ? "午后" : hour < 18 ? "下午" : hour < 22 ? "夜晚" : "深夜",
  };
};
const fortunes = [
  { title: "焦糖脆边", text: "今天适合把一个小想法做成能点开的东西。", place: "work" },
  { title: "黄油灵感", text: "别急着学完，先去做一个会动的小实验。", place: "resources" },
  { title: "书页麦香", text: "一篇旧文章里，藏着今天需要的新答案。", place: "blog" },
  { title: "天线来信", text: "留意远处的新信号，但只带走真正有用的。", place: "news" },
  { title: "旅行吐司", text: "换条路逛逛，工具地图会给你一点意外发现。", place: "navigation" },
  { title: "炉火正暖", text: "今天很适合认识一个人，也让别人认识你。", place: "about" },
];
const clock = (minute: number) => `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(Math.floor(minute % 60)).padStart(2, "0")}`;
const initial = (): Simulation => ({
  player: { x: 472, y: 371, name: "你", sprite: 0, direction: "down", moving: false, path: [], activity: "逛逛小镇", bubble: "", bubbleUntil: 0, wait: 0, visit: 0 },
  npcs: makeResidents(), keys: new Set(), time: 0, minute: 17 * 60 + 40, paused: false, rain: false, light: "auto", reduced: false, found: [], near: null,
  destination: null, panel: false, camera: { scale: 1, x: 0, y: 0, width: WORLD_W, height: WORLD_H }, lastChat: 0,
});

export function PixelTown({ articles, projects }: { articles: Article[]; projects: Project[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sim = useRef<Simulation>(initial());
  const logId = useRef(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rain, setRain] = useState(false);
  const [light, setLight] = useState<"auto" | "day" | "night">("auto");
  const [time, setTime] = useState("17:40");
  const [dateLabel, setDateLabel] = useState("面包镇");
  const [period, setPeriod] = useState("黄昏");
  const [near, setNear] = useState<string | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [people, setPeople] = useState(residents.map(r => ({ name: r.name, activity: r.activity })));
  const [greeted, setGreeted] = useState<string[]>([]);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [fortune, setFortune] = useState<number | null>(null);
  const [logs, setLogs] = useState<Log[]>([{ id: 0, time: "17:40", text: "面包屋的灯亮了。欢迎来到小镇。" }]);
  const [toast, setToast] = useState("");

  const addLog = useCallback((message: string) => {
    setLogs(previous => [{ id: logId.current++, time: clock(sim.current.minute), text: message }, ...previous].slice(0, 8));
  }, []);
  const openPanel = useCallback((next: Panel) => {
    sim.current.keys.clear(); sim.current.player.path = []; sim.current.player.moving = false; sim.current.destination = null;
    sim.current.panel = !!next;
    setPanel(next);
    if (next?.kind === "place") {
      setVisited(previous => {
        const value = previous.includes(next.id) ? previous : [...previous, next.id];
        try { localStorage.setItem("bread-town-visits-v1", JSON.stringify(value)); } catch { /* Progress is optional in private browsing. */ }
        return value;
      });
    }
  }, []);
  const closePanel = useCallback(() => { openPanel(null); canvasRef.current?.focus({ preventScroll: true }); }, [openPanel]);
  const interact = useCallback(() => {
    const s = sim.current;
    const npc = s.npcs.findIndex(r => Math.hypot(r.x - s.player.x, r.y - s.player.y) < 55);
    if (s.near) openPanel({ kind: "place", id: s.near });
    else if (npc !== -1) openPanel({ kind: "resident", id: npc });
    else { setToast("走近居民按 E 聊天，或直接点击一栋建筑。"); }
  }, [openPanel]);

  useEffect(() => {
    if (panel) dialogRef.current?.showModal();
    else if (dialogRef.current?.open) {
      dialogRef.current.close();
      canvasRef.current?.focus({ preventScroll: true });
    }
  }, [panel]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const canvas = canvasRef.current, stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setLoaded(true); return; }
    const s = sim.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.reduced = media.matches; s.paused = media.matches; setPaused(s.paused);
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("bread-town-visits-v1") || "[]");
      if (Array.isArray(saved)) setVisited(saved.filter((id): id is string => typeof id === "string" && places.some(p => p.id === id)));
      const crumbs: unknown = JSON.parse(localStorage.getItem("bread-town-crumbs-v1") || "[]");
      if (Array.isArray(crumbs)) { s.found = [...new Set(crumbs.filter((id): id is number => Number.isInteger(id) && id >= 0 && id < breadSpots.length))]; setFound([...s.found]); }
      const friends: unknown = JSON.parse(localStorage.getItem("bread-town-friends-v1") || "[]");
      if (Array.isArray(friends)) setGreeted(friends.filter((name): name is string => typeof name === "string" && residents.some(r => r.name === name)));
      setRewardClaimed(localStorage.getItem("bread-town-reward-v1") === "claimed");
      const savedFortune = Number(localStorage.getItem("bread-town-fortune-v1"));
      if (Number.isInteger(savedFortune) && savedFortune >= 0 && savedFortune < fortunes.length) setFortune(savedFortune);
    } catch { /* A malformed save never prevents exploring. */ }
    let alive = true, request = 0, previous = 0, lastUi = 0, lastDraw = 0;
    const terrain = createTerrain();
    const images = spriteFiles.map(file => { const image = new window.Image(); image.src = `/town/characters/${file}`; return image; });
    const backdrop = new window.Image();
    backdrop.onload = () => { if (alive) setLoaded(true); };
    backdrop.onerror = () => { if (alive) setLoaded(true); };
    backdrop.src = "/town/bread-town.webp";
    const resize = () => {
      const r = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      s.camera.width = r.width; s.camera.height = r.height;
    };
    const observer = new ResizeObserver(resize); observer.observe(stage); resize();
    const release = () => { s.keys.clear(); previous = 0; };
    const visibility = () => { release(); };
    window.addEventListener("blur", release); document.addEventListener("visibilitychange", visibility);
    const motion = () => { s.reduced = media.matches; if (media.matches) { s.paused = true; setPaused(true); } };
    media.addEventListener("change", motion);
    const moveKeys = new Set(["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"]);
    const keydown = (e: KeyboardEvent) => {
      if (s.panel || document.activeElement !== canvas || !moveKeys.has(e.key.toLowerCase())) return;
      e.preventDefault(); s.keys.add(e.key.toLowerCase()); s.player.path = []; s.destination = null;
    };
    const keyup = (e: KeyboardEvent) => { s.keys.delete(e.key.toLowerCase()); };
    window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup);

    const frame = (now: number) => {
      if (!alive) return;
      request = requestAnimationFrame(frame);
      if (document.hidden) { previous = 0; return; }
      if (now - lastDraw < 1000 / 30) return;
      lastDraw = now;
      const dt = previous ? Math.min((now - previous) / 1000, .06) : 0; previous = now;
      if (!s.paused) s.time += dt;
      if (!s.panel) {
        let dx = Number(s.keys.has("d") || s.keys.has("arrowright")) - Number(s.keys.has("a") || s.keys.has("arrowleft"));
        let dy = Number(s.keys.has("s") || s.keys.has("arrowdown")) - Number(s.keys.has("w") || s.keys.has("arrowup"));
        if (dx || dy) {
          const len = Math.hypot(dx, dy); dx /= len; dy /= len;
          s.player.direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up";
          const x = s.player.x + dx * 108 * dt, y = s.player.y + dy * 108 * dt;
          if (!blocked({ x, y: s.player.y })) s.player.x = x;
          if (!blocked({ x: s.player.x, y })) s.player.y = y;
          s.player.moving = true;
        } else stepActor(s.player, dt, 108);
        if (!s.player.path.length) s.destination = null;
      }
      if (!s.paused) {
        s.npcs.forEach((npc, i) => {
          if (npc.path.length) { stepActor(npc, dt, 28 + i * 3); if (!npc.path.length) { npc.wait = 7 + i * 2; npc.activity = npc.activity.replace(/^去/, "在") + "停留"; } }
          else {
            npc.moving = false; npc.wait -= dt;
            if (npc.wait <= 0) {
              const definition = residents[i], place = places[npc.meeting ?? definition.route[npc.visit % definition.route.length]];
              npc.meeting = undefined;
              const target = door(place); npc.path = findPath(npc, target); npc.visit++;
              npc.activity = `去${place.name}`; npc.bubble = npc.visit % 2 ? definition.line : `去${place.name}看看。`; npc.bubbleUntil = s.time + 4;
              npc.wait = 10; addLog(`${npc.name}${npc.activity}了。`);
            }
          }
        });
        // Encounters arise from shared routes: residents stop, exchange a line, then continue.
        if (s.time - s.lastChat > 16) {
          outer: for (let i = 0; i < s.npcs.length; i++) for (let j = i + 1; j < s.npcs.length; j++) {
            const a = s.npcs[i], b = s.npcs[j];
            if (Math.hypot(a.x - b.x, a.y - b.y) < 46) {
              a.bubble = `嗨，${b.name}，一起吃面包？`; b.bubble = "好呀，等会儿去面包屋。";
              a.bubbleUntil = b.bubbleUntil = s.time + 5; a.path = []; b.path = []; a.wait = b.wait = 5;
              a.meeting = b.meeting = 1;
              a.activity = `和${b.name}聊天`; b.activity = `和${a.name}聊天`; s.lastChat = s.time;
              addLog(`${a.name}遇到了${b.name}，约好去面包屋。`); break outer;
            }
          }
        }
      }
      breadSpots.forEach((p, i) => {
        if (!s.found.includes(i) && Math.hypot(p.x - s.player.x, p.y - s.player.y) < 21) {
          s.found.push(i); setFound([...s.found]);
          try { localStorage.setItem("bread-town-crumbs-v1", JSON.stringify(s.found)); } catch { /* Local progress may be unavailable. */ }
          setToast(s.found.length === breadSpots.length ? "面包收齐了！获得称号：小镇常客。" : `捡到一块小面包！${s.found.length} / ${breadSpots.length}`);
        }
      });
      s.near = places.find(p => Math.hypot(door(p).x - s.player.x, door(p).y - s.player.y) < 52)?.id ?? null;
      if (now - lastUi > 500) {
        const currentClock = chinaClock();
        s.minute = currentClock.minute;
        lastUi = now; setTime(currentClock.time); setDateLabel(currentClock.date); setPeriod(currentClock.period); setNear(s.near); setPeople(s.npcs.map(p => ({ name: p.name, activity: p.activity })));
        canvas.dataset.position = `${Math.round(s.player.x)},${Math.round(s.player.y)}`;
        canvas.dataset.residents = s.npcs.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(";");
      }
      const view = s.camera, mobile = view.width < 650;
      view.scale = mobile ? Math.max(.86, view.height / WORLD_H) : Math.max(view.width / WORLD_W, view.height / WORLD_H);
      const scaledWidth = WORLD_W * view.scale, scaledHeight = WORLD_H * view.scale;
      const targetX = Math.max(view.width - scaledWidth, Math.min(0, view.width / 2 - s.player.x * view.scale));
      const targetY = Math.max(view.height - scaledHeight, Math.min(0, view.height * .56 - s.player.y * view.scale));
      const follow = previous ? Math.min(1, dt * 8) : 1;
      view.x += (targetX - view.x) * follow;
      view.y += (targetY - view.y) * follow;
      const dpr = canvas.width / view.width;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = "#151d27"; ctx.fillRect(0, 0, view.width, view.height);
      ctx.translate(view.x, view.y); ctx.scale(view.scale, view.scale);
      const minute = s.minute % 1440;
      const night = s.light === "night" ? 1 : s.light === "day" ? 0 : minute >= 1200 || minute < 360 ? 1 : minute >= 1020 ? (minute - 1020) / 180 : minute < 480 ? (480 - minute) / 120 : 0;
      drawWorld(ctx, terrain, { time: s.time, night, rain: s.rain, player: s.player, npcs: s.npcs, images, backdrop, found: s.found, near: s.near, destination: s.destination, reduced: s.reduced });
    };
    request = requestAnimationFrame(frame);
    return () => {
      alive = false; cancelAnimationFrame(request); observer.disconnect(); s.keys.clear();
      window.removeEventListener("blur", release); document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup); media.removeEventListener("change", motion);
    };
  }, [addLog]);

  function mapClick(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.button !== 0 || sim.current.panel) return;
    e.currentTarget.focus({ preventScroll: true });
    const s = sim.current, rect = e.currentTarget.getBoundingClientRect(), v = s.camera;
    const p = { x: (e.clientX - rect.left - v.x) / v.scale, y: (e.clientY - rect.top - v.y) / v.scale };
    const place = places.find(b => p.x >= b.x - 5 && p.x <= b.x + b.w + 5 && p.y >= b.y - 25 && p.y <= b.y + b.h + 40);
    if (place) { openPanel({ kind: "place", id: place.id }); return; }
    const npc = s.npcs.findIndex(r => Math.hypot(r.x - p.x, r.y - 20 - p.y) < 27);
    if (npc !== -1) { openPanel({ kind: "resident", id: npc }); return; }
    const path = findPath(s.player, p);
    s.player.path = path; s.destination = path.length ? path[path.length - 1] : null;
    if (!path.length && Math.hypot(p.x - s.player.x, p.y - s.player.y) > 20) setToast("这里走不过去，试试点石板路。");
  }
  function walkTo(place: Place) {
    closePanel(); const path = findPath(sim.current.player, door(place)); sim.current.player.path = path;
    sim.current.destination = path[path.length - 1] ?? null;
    setToast(`出发，去${place.name}。到门口按 E 就能打开。`);
  }
  const activePlace = panel?.kind === "place" ? places.find(p => p.id === panel.id) : null;
  const activeResident = panel?.kind === "resident" ? sim.current.npcs[panel.id] : null;
  const nearbyName = places.find(p => p.id === near)?.name;
  function togglePause() { const value = !sim.current.paused; sim.current.paused = value; setPaused(value); }
  const dailyTasks = [
    { title: "推开三扇门", note: "去不同建筑里看看", current: Math.min(visited.length, 3), goal: 3 },
    { title: "认识一位邻居", note: "和任意居民打个招呼", current: Math.min(greeted.length, 1), goal: 1 },
    { title: "捡到三块面包", note: "沿着石板路散散步", current: Math.min(found.length, 3), goal: 3 },
  ];
  const completedTasks = dailyTasks.filter(task => task.current >= task.goal).length;
  function greetResident(name: string) {
    setGreeted(previous => {
      const value = previous.includes(name) ? previous : [...previous, name];
      try { localStorage.setItem("bread-town-friends-v1", JSON.stringify(value)); } catch { /* Progress is optional. */ }
      return value;
    });
    closePanel(); addLog(`你和${name}打了个招呼。`); setToast(`${name}：下次见，记得来坐坐！`);
  }
  function claimReward() {
    if (completedTasks < dailyTasks.length) { setToast("还有委托没完成，再去镇上转转吧。"); return; }
    setRewardClaimed(true);
    try { localStorage.setItem("bread-town-reward-v1", "claimed"); } catch { /* Progress is optional. */ }
    closePanel(); addLog("今日委托全部完成，金麦徽章已经放进行囊。"); setToast("获得收藏：金麦徽章 ✦");
  }
  function drawFortune() {
    const next = (Math.floor(Date.now() / 997) + found.length + visited.length) % fortunes.length;
    setFortune(next);
    try { localStorage.setItem("bread-town-fortune-v1", String(next)); } catch { /* Fortune can remain session-only. */ }
    addLog(`你抽到了“${fortunes[next].title}”面包签。`);
  }

  const dockItems = [
    { href: "/work", label: "作品", note: `${projects.length} 件`, art: "work" },
    { href: "/blog", label: "博客", note: `${articles.length} 篇`, art: "blog" },
    { href: "/ai-learn", label: "AI 学习", note: "课程与路线", art: "resources" },
    { href: "/news", label: "AI 消息站", note: "今日信号", art: "news" },
    { href: "https://navigation.aibread.site/", label: "AI 导航", note: "工具地图", art: "navigation", external: true },
    { href: "/about", label: "关于我", note: "认识镇长", art: "about" },
  ];

  return (
    <div className={styles.town}>
      <div className={styles.gameFrame}>
        <aside className={styles.playerPanel}>
          <Link href="/" className={styles.brand} aria-label="AI面包君首页">
            <Image className={styles.panelArt} src="/town/ui-v3/brand-plaque-v4.png" alt="" fill sizes="320px" unoptimized />
            <strong>AI面包君</strong>
          </Link>

          <div className={styles.portraitFrame}>
            <Image className={styles.portraitCard} src="/town/ui-v6/portrait-card.png" alt="穿着未来外套、正在挥手的面包君像素角色" fill priority sizes="(max-width: 760px) 120px, 290px" unoptimized />
            <span className={styles.online}><i /> 在线</span>
          </div>

          <div className={styles.playerMessage}>
            <div className={styles.panelContent}><p>今天也做点<br />有意思的东西。</p>
            <button onClick={() => openPanel({ kind: "guide" })}>怎么玩 <ArrowRight size={14} /></button></div>
          </div>

          <div className={styles.playerStats}>
            <div className={styles.statsContent}><div className={styles.levelLine}><span>等级</span><strong>Lv. 25</strong></div>
              <div className={styles.statRow}><span>经验</span><b>12880 / 20000</b></div>
              <div className={styles.progressTrack}><span style={{ width: "64%" }} /></div>
              <div className={styles.statRow}><span>热爱值</span><span className={styles.hearts} aria-label="热爱值四颗心">{[0, 1, 2, 3, 4].map(i => <Heart key={i} size={15} fill={i < 4 ? "currentColor" : "none"} />)}</span></div>
              <div className={styles.statRow}><span>探索</span><b>{visited.length} / 6 地点</b></div>
              <div className={styles.statRow}><span>收集</span><b>{found.length} / 5 面包</b></div></div>
          </div>

          <button className={styles.sideNotebook} onClick={() => openPanel({ kind: "quests" })}>
            <span><ClipboardCheck size={15} /> 今日委托 <b>{completedTasks}/{dailyTasks.length}</b></span>
            {dailyTasks.map(task => <i key={task.title} className={task.current >= task.goal ? styles.miniDone : ""}><em>{task.current >= task.goal ? "✓" : "·"}</em>{task.title}<small>{task.current}/{task.goal}</small></i>)}
            <strong>打开委托簿 <ArrowRight size={12} /></strong>
          </button>
        </aside>

        <section className={styles.worldPanel} aria-label="可探索的面包小镇">
          <header className={styles.worldHeader}>
            <div><span className={styles.liveDot} /> {paused ? "小镇休息中" : "小镇生活中"}</div>
          </header>

          <div className={styles.hudCluster}>
            <button className={styles.hudClock} onClick={() => openPanel({ kind: "directory" })} aria-label={`打开小镇地图，北京时间 ${time}`}><Image src="/town/ui-v3/hud-clock-v4.png" alt="" fill sizes="330px" unoptimized /><span>北京时间</span><b>{time}</b></button>
            <div className={styles.hudActions}>
              <button onClick={togglePause} aria-label={paused ? "继续居民活动" : "暂停居民活动"} aria-pressed={paused}><Image src="/town/ui-v3/hud-pause-v4.png" alt="" fill sizes="58px" unoptimized /></button>
              <button aria-label="切换光照" title="切换自动 / 白天 / 夜晚" onClick={() => { const value = light === "auto" ? "day" : light === "day" ? "night" : "auto"; setLight(value); sim.current.light = value; }}><Image src="/town/ui-v3/hud-light-v4.png" alt="" fill sizes="58px" unoptimized /></button>
              <button aria-label="切换下雨天气" aria-pressed={rain} onClick={() => { const value = !rain; setRain(value); sim.current.rain = value; addLog(value ? "小镇落起了细雨。屋檐下的灯更暖了。" : "雨停了，适合再散会儿步。"); }}><Image src="/town/ui-v3/hud-weather-v4.png" alt="" fill sizes="58px" unoptimized /></button>
              <button aria-label="查看玩法帮助" onClick={() => openPanel({ kind: "guide" })}><Image src="/town/ui-v3/hud-help-v4.png" alt="" fill sizes="58px" unoptimized /></button>
            </div>
          </div>

          <div ref={stageRef} className={styles.stage}>
            <canvas ref={canvasRef} onPointerDown={mapClick} tabIndex={0} aria-label="像素小镇地图。点击道路行走，点击建筑或居民互动。聚焦后可用 WASD 或方向键移动，E 互动。" onKeyDown={e => { if (e.key.toLowerCase() === "e" && !e.repeat) { e.preventDefault(); interact(); } }} onBlur={() => sim.current.keys.clear()} />
            {!loaded && <div className={styles.loading}><p>正在打开小镇的灯……</p><small>面包马上出炉</small></div>}
            <div className={styles.mapCaption}><span>{dateLabel} · {period}</span><b>点击道路散步，点击建筑进门</b></div>
            <div className={styles.keyHelp}><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>移动</span><kbd>E</kbd><span>互动</span></div>
            <nav className={styles.townTools} aria-label="小镇玩法菜单">
              <button onClick={() => openPanel({ kind: "quests" })}><ClipboardCheck size={17} /><span>今日委托</span><b>{completedTasks}/{dailyTasks.length}</b></button>
              <button onClick={() => openPanel({ kind: "bag" })}><Backpack size={17} /><span>旅行袋</span><b>{found.length}</b></button>
              <button onClick={() => openPanel({ kind: "neighbors" })}><UsersRound size={17} /><span>居民动态</span><b>{greeted.length}/{residents.length}</b></button>
              <button onClick={() => openPanel({ kind: "fortune" })}><Sparkles size={17} /><span>面包签</span><b>{fortune === null ? "?" : "✦"}</b></button>
            </nav>
            {toast && <div role="status" className={styles.toast}>{toast}</div>}
            {nearbyName && <button className={styles.interact} onClick={interact}><kbd>E</kbd> 进入{nearbyName} <ArrowRight size={14} /></button>}
            <div className={styles.touchPad} aria-label="移动控制">
              {[{ key: "arrowup", label: "向上移动", Icon: ArrowUp }, { key: "arrowleft", label: "向左移动", Icon: ArrowLeft }, { key: "arrowdown", label: "向下移动", Icon: ArrowDown }, { key: "arrowright", label: "向右移动", Icon: ArrowRight }].map(({ key, label, Icon }) => <button key={key} aria-label={label} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); sim.current.keys.add(key); sim.current.player.path = []; }} onPointerUp={() => sim.current.keys.delete(key)} onPointerCancel={() => sim.current.keys.delete(key)} onLostPointerCapture={() => sim.current.keys.delete(key)}><Icon size={18} /></button>)}
              <button aria-label="与附近建筑或居民互动" onClick={interact}>E</button>
            </div>
          </div>

          <div className={styles.townTicker}>
            <span><span className={styles.liveDot} /> 镇上刚刚</span>
            <p>{logs[0]?.text}</p>
            <button onClick={() => openPanel({ kind: "directory" })}>打开地图 <ArrowRight size={13} /></button>
          </div>
        </section>

        <nav className={styles.dock} aria-label="网站主导航">
          {dockItems.map(({ href, label, note, art, external }) => {
            const content = <><Image className={styles.dockArt} src={`/town/ui-v5/nav-${art}.png`} alt="" fill sizes="(max-width: 820px) 150px, 17vw" unoptimized /><span className={styles.dockLabel}><strong>{label}</strong><small>{note}</small></span></>;
            return external
              ? <a key={href} href={href} target="_blank" rel="noreferrer">{content}</a>
              : <Link key={href} href={href}>{content}</Link>;
          })}
        </nav>
      </div>

      <dialog ref={dialogRef} className={styles.dialog} aria-label={activePlace?.name ?? activeResident?.name ?? "小镇菜单"} onCancel={e => { e.preventDefault(); closePanel(); }} onClick={e => { if (e.target === e.currentTarget) closePanel(); }}>
        <div className={styles.dialogContent}>
          <button className={styles.close} onClick={closePanel} aria-label="关闭窗口"><X size={19} /></button>
          {activePlace && <>
            <p className={styles.eyebrow} style={{ color: activePlace.color }}>{activePlace.label}</p><h2>{activePlace.name}</h2><p className={styles.dialogDescription}>{activePlace.description}</p>
            <div className={styles.panelLinks}>
              {activePlace.id === "blog" && articles.slice(0, 5).map(a => <Link key={a.slug} href={`/blog/${a.slug}`}><span><small>{a.tag}</small>{a.title}</span><ArrowRight size={16} /></Link>)}
              {activePlace.id === "work" && projects.map(p => p.href ? <Link key={p.id} href={p.href} target={p.isExternal ? "_blank" : undefined} rel={p.isExternal ? "noreferrer" : undefined}>{p.title}<ArrowRight size={16} /></Link> : <p key={p.id}>{p.title}<small>准备中</small></p>)}
              {activePlace.id === "resources" && <><Link href="/ai-learn">系列课程 <ArrowRight size={16} /></Link><Link href="/resources">学习资源 <ArrowRight size={16} /></Link><Link href="/learn">AI 闯关地图 <ArrowRight size={16} /></Link><Link href="/cc">Claude Code 实验室 <ArrowRight size={16} /></Link></>}
              {activePlace.id === "about" && <Link href="/about#contact">坐下来，聊聊你的想法 <ArrowRight size={16} /></Link>}
            </div>
            <div className={styles.dialogActions}><Link className={styles.primary} href={activePlace.href} target={activePlace.id === "navigation" ? "_blank" : undefined} rel={activePlace.id === "navigation" ? "noreferrer" : undefined}>进入{activePlace.name} <ArrowRight size={15} /></Link><button onClick={() => walkTo(activePlace)}>让小人走过去</button></div>
            <p className={styles.stamp}><Check size={12} /> 已盖章 · 探索了 {visited.length} / 6 个地方</p>
          </>}
          {activeResident && <>
            <p className={styles.eyebrow}>NEIGHBORHOOD STORIES</p><h2>{activeResident.name}<span className={styles.npcBadge}>小镇居民</span></h2><p className={styles.dialogDescription}>{activeResident.activity}</p>
            <blockquote>“{activeResident.bubble || residents[panel?.kind === "resident" ? panel.id : 0].line}”</blockquote>
            <p className={styles.dialogDescription}>{["我的日常就是烤面包、逛工坊，再给朋友留一份。面包屋里能找到镇长。", "有时候一个小工具就能省掉好多重复劳动。工坊里的东西都可以试用。", "温室里的课可以直接上手。比起看完再做，我更喜欢边做边学。", "我负责在镇上送消息。博客书店里的文章，读完还可以按目录接着翻。", "接收信号，分享发现。消息电台收集了 AI 世界的新动态。"][panel?.kind === "resident" ? panel.id : 0]}</p>
            <div className={styles.dialogActions}><button className={styles.primary} onClick={() => greetResident(activeResident.name)}>{greeted.includes(activeResident.name) ? "再聊两句" : "打个招呼"} <Sparkles size={14} /></button><button onClick={() => openPanel({ kind: "place", id: places[residents[panel?.kind === "resident" ? panel.id : 0].route[0]].id })}>看看 TA 常去的地方</button></div>
          </>}
          {panel?.kind === "directory" && <><p className={styles.eyebrow}>面包镇 · 站牌</p><h2>去哪里？</h2><p className={styles.dialogDescription}>选一站直接打开，或者让小人沿石板路走过去。</p><div className={styles.directory}>{places.map((p, i) => { const Icon = icons[i]; return <button key={p.id} onClick={() => openPanel({ kind: "place", id: p.id })}><span className={styles.stopNumber}>{String(i + 1).padStart(2, "0")}</span><Icon size={19} style={{ color: p.color }} /><span className={styles.stopName}><strong>{p.name}</strong><small>{p.sign}</small></span><em>{visited.includes(p.id) ? "去过" : "未到访"}</em><ArrowRight size={15} /></button>; })}</div><Link href="/home" className={styles.classic}>不逛小镇，直接看普通首页 <ArrowRight size={13} /></Link></>}
          {panel?.kind === "quests" && <><p className={styles.eyebrow}>今天的小事</p><h2>今日委托<span className={styles.questCount}>{completedTasks}/{dailyTasks.length}</span></h2><p className={styles.dialogDescription}>不用打卡，顺路完成就好。进度只保存在你的浏览器里。</p><div className={styles.questList}>{dailyTasks.map(task => <div key={task.title} className={task.current >= task.goal ? styles.questDone : ""}><span className={styles.questIcon}>{task.current >= task.goal ? <Check size={16} /> : <Cookie size={16} />}</span><p><strong>{task.title}</strong><small>{task.note}</small></p><b>{task.current}/{task.goal}</b><i><span style={{ width: `${task.current / task.goal * 100}%` }} /></i></div>)}</div><button className={styles.primary} disabled={completedTasks < dailyTasks.length || rewardClaimed} onClick={claimReward}><Gift size={15} /> {rewardClaimed ? "金麦徽章已领取" : "领取金麦徽章"}</button></>}
          {panel?.kind === "bag" && <><p className={styles.eyebrow}>随身物品</p><h2>旅行袋</h2><p className={styles.dialogDescription}>散步时捡到的小东西，都会留在这里。</p><div className={styles.bagSlots}>{breadSpots.map((_, index) => <div key={index} className={found.includes(index) ? styles.slotFound : ""}><Cookie size={24} /><span>{found.includes(index) ? `面包碎片 ${index + 1}` : "还没找到"}</span></div>)}{rewardClaimed && <div className={styles.slotFound}><Gift size={24} /><span>金麦徽章</span></div>}</div><p className={styles.dialogDescription}>{found.length === breadSpots.length ? "五块面包已经集齐。你现在是认证的“小镇常客”。" : `还有 ${breadSpots.length - found.length} 块小面包藏在石板路附近。`}</p></>}
          {panel?.kind === "neighbors" && <><p className={styles.eyebrow}>镇上此刻</p><h2>居民动态</h2><p className={styles.dialogDescription}>他们会自己串门，也会在路上碰见彼此。</p><div className={styles.neighborList}>{people.map((person, index) => <button key={person.name} onClick={() => openPanel({ kind: "resident", id: index })}><span className={styles.avatarDot}>{person.name.slice(0, 1)}</span><p><strong>{person.name}</strong><small>{person.activity}</small></p>{greeted.includes(person.name) ? <b>认识了</b> : <ArrowRight size={15} />}</button>)}</div></>}
          {panel?.kind === "fortune" && <><p className={styles.eyebrow}>面包签</p><h2>今天会抽到什么？</h2>{fortune === null ? <div className={styles.fortuneEmpty}><Cookie size={42} /><p>炉子已经热了。<br />抽一张今天专属的面包签。</p></div> : <div className={styles.fortuneCard}><span>✦ 今日签 ✦</span><strong>{fortunes[fortune].title}</strong><p>{fortunes[fortune].text}</p><small>推荐去处 · {places.find(place => place.id === fortunes[fortune].place)?.name}</small></div>}<div className={styles.dialogActions}><button className={styles.primary} onClick={drawFortune}><Sparkles size={15} /> {fortune === null ? "抽一张" : "再抽一次"}</button>{fortune !== null && <button onClick={() => { const place = places.find(item => item.id === fortunes[fortune].place); if (place) walkTo(place); }}>沿着签文出发 <ArrowRight size={14} /></button>}</div></>}
          {panel?.kind === "guide" && <><p className={styles.eyebrow}>第一次来？</p><h2>小镇漫游指南</h2><div className={styles.guide}><p><kbd>WASD / ↑↓←→</kbd><span>先点一下地图，再用键盘移动。</span></p><p><kbd>点击 / 轻触</kbd><span>点道路自动走过去；点建筑或居民打开窗口。</span></p><p><kbd>E</kbd><span>靠近门口进入建筑，靠近居民打招呼。</span></p><p><kbd>▰</kbd><span>散步时收集 5 块小面包，解锁“小镇常客”。</span></p></div><button className={styles.primary} onClick={closePanel}>知道了，继续逛 <ArrowRight size={14} /></button></>}
        </div>
      </dialog>
    </div>
  );
}
