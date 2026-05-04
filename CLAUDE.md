# AI面包君 · 项目说明

面向**非从业者**的 AI 知识分享站。账号定位：用面包/烤箱这种生活类比，把 AI 讲给小白听。
设计语言参考 `../refs/` 目录里的轩辕的编程宇宙 / Codex 课程页（Next.js + Tailwind 的暖色系教育站）。
**`../refs/` 是只读参考资料，不要修改。**

---

## 技术栈

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3，主题色定义在 `tailwind.config.ts` 的 `bread.50–900`（金黄面包皮 `#F5B70F`，烤色棕 `#3D2817`）
- 文章 markdown 渲染：`react-markdown` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings` + `rehype-highlight`
- 图标：`lucide-react`
- 包管理：npm（国内用 `--registry=https://registry.npmmirror.com`）

## 常用命令

```bash
npm run dev       # 开发，默认 :3000，被占用会自动找下一个端口
npm run build     # 生产构建
npm run start     # 生产模式跑构建产物
```

---

## 目录速查

```
site/
├── content/articles/         # 博客文章 markdown 源（在这里加文章）
├── public/                   # 静态资源（logo、占位封面 SVG）
└── src/
    ├── app/                  # Next.js App Router 页面
    │   ├── page.tsx          # 首页
    │   ├── blog/page.tsx     # 博客列表（Server）
    │   ├── blog/[slug]/...   # 博客详情（Server，markdown 渲染 + TOC）
    │   ├── learn/page.tsx    # 学习地图（PlayerCard + 章节 + 徽章）
    │   ├── learn/[levelId]/  # 关卡播放器路由
    │   ├── feed.xml/route.ts # RSS 2.0
    │   ├── about/page.tsx
    │   ├── layout.tsx        # 全局 Header/Footer/字体/RSS alternate
    │   └── globals.css       # Tailwind 入口 + .article-prose 排版样式
    ├── components/
    │   ├── Header / Footer / Hero / StatCard / SectionTitle
    │   ├── ArticleCard / TopicCard / BlogList / TocSidebar / ArticleBody
    │   ├── PlayerCard / DailyQuest / AchievementStrip / MatrixNode
    │   └── level/            # 关卡引擎
    │       ├── LevelPlayer.tsx       # 主控（步骤逐次解锁 + 底栏进度）
    │       ├── Bubble.tsx            # 通用气泡外壳
    │       └── Step{Text,Quiz,FillBlank,PromptInput,Terminal,ImageGen,Reveal,Celebration}.tsx
    ├── data/
    │   ├── articles.ts       # 兼容层（重导出 lib/articles）
    │   ├── topics.ts         # 首页"精选专题"展示用
    │   ├── matrix.ts         # 学习地图节点 + 章节主题色配置
    │   └── levels/           # 关卡内容
    │       ├── index.ts      # 关卡注册表
    │       └── cX-Y.ts       # 单关数据
    └── lib/
        ├── articles.ts       # 读 content/articles/*.md，提取 TOC
        ├── levels.ts         # 关卡 Step 8 种类型定义（看这个就够了）
        └── mini-md.tsx       # 关卡内文本用的轻量 markdown 渲染（不引依赖）
```

---

## 加新文章

在 `content/articles/` 新建 `<slug>.md`，frontmatter 必须有：

```yaml
---
title: "标题"
slug: "url-slug"           # 决定 /blog/<slug>
excerpt: "一句话摘要"
tag: "AI 工具"             # 任意分类，会自动出现在筛选标签里
date: "2026-04-22"         # YYYY-MM-DD，决定排序和上下篇
cover: "/placeholders/cover-1.svg"
readMin: 8
---
```

正文支持 GFM markdown：标题、段落、列表、表格、`代码`、```代码块```、引用块、链接。
`##`/`###` 会自动出现在右侧 TOC 并支持滚动高亮。

无需改任何代码——保存即在 `/blog`、首页"最新文章"、RSS 里出现。

## 加新关卡

1. 在 `src/data/levels/` 新建 `cX-Y.ts`（参考 `c1-1.ts` / `c4-1.ts`）：
   ```ts
   import type { Level } from "@/lib/levels";
   const level: Level = {
     id: "c1-2",
     chapterId: "c1",
     title: "...",
     emoji: "🧠",
     difficulty: 1,                  // 1=轻松 2=进阶 3=硬核
     xpReward: 30,
     estimatedMin: 7,
     steps: [ /* 用 8 种 kind 自由组合 */ ],
   };
   export default level;
   ```
2. 在 `src/data/levels/index.ts` 加一行 import + 加进 `levels` 数组
3. 在 `src/data/matrix.ts` 把对应节点改成 `unlocked: true`

### Step 8 种类型速查（详见 `src/lib/levels.ts`）

| kind | 用途 | 关键字段 |
|------|------|---------|
| `text` | 讲解段落（mini-md） | `markdown` |
| `quiz` | 单/多选 | `question / options[] / explanation / allowMulti` |
| `fill-blank` | 填空 | `prompt / accept[] / hint / reveal` |
| `prompt-input` | 模拟 AI 对话框，含示例填入 + 关键词校验 + 逐段揭示 | `intro / sampleInputs[] / aiReply[] / expectKeywords` |
| `terminal` | 模拟命令行，逐行打印输出（可强制照敲） | `command / output[{line,delay,tone}] / requireType` |
| `image-gen` | 模拟出图：输入 → 进度条 → 出图 | `promptPlaceholder / sampleInputs[] / resultSrc / durationMs` |
| `reveal` | 点击揭晓答案 | `prompt / hidden` |
| `celebration` | 通关庆祝（XP + 徽章 + 下一关） | `title / xp / badge / nextLevelId` |

**约定**：每关首步用 `text` 引入背景，最后一步必用 `celebration`。中间穿插能让用户"动手"的 step（quiz/fill-blank/prompt-input），不要全是 text。

---

## 配色 / 排版约定

- 用 `bread-*` token，不要写裸 hex（保持品牌一致）
- 卡片标准：`rounded-2xl border border-bread-100 bg-white shadow-sm`
- 卡片悬浮：`hover:-translate-y-2 hover:shadow-xl transition-all duration-300`
- 容器：`container-page`（max-w 1400 + 响应式 padding）
- 文章排版用 `.article-prose` class（在 `globals.css` 里）

## 内容口吻约定

写给非从业者，要：
- 用生活类比（面包/烤箱/厨房）替代术语，第一次出现术语必加括号解释
- 列表 + 加粗强调要点，单段不超过 4 行
- 主动反幻觉：标注 AI 不擅长的事、提醒交叉验证
- 不卖焦虑、不喊口号

---

## 未做 / 未来可加

- 文章评论（建议用 Giscus）
- 真实进度持久化（关卡已通关状态、XP、连烤天数 — 目前是静态值，可接 localStorage 或登录后接 DB）
- 全站搜索（多关卡 + 文章）— 可以用 Pagefind 静态索引
- 暗色模式
- Sitemap（用 `next-sitemap`）

任何修改要照下面顺序自检：
1. `npm run dev` 把改的页面打开看效果
2. 改 markdown 文章不需要重启
3. 改 step 引擎组件后，至少打开 `/learn/c4-1`（含画图）和 `/learn/c2-2`（含终端）回归一遍
