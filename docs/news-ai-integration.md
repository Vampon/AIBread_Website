# AI 日刊 · 接入 AI 导读

把 `/news` 页从「纯 RSS 聚合」升级到「AI 选稿 + 中文导读」的完整接入说明。

---

## 改一个文件就够：`src/lib/news/ai.ts`

整条流水线在 `src/lib/news/curate.ts` 里只调用了一次 hook：

```ts
curated = await aiCurator(curated);
```

`aiCurator` 默认是 identity（原样返回）。要打开 AI 导读，只改 `src/lib/news/ai.ts` 这一个文件。

### 期望的输入输出

**输入**：去重 + 按时间倒序的最多 40 条 `NewsItem`，结构见 `types.ts`：

```ts
{ id, title, url, source, sourceId, date, excerpt, lang }
```

**输出**：你认为值得展示的子集（建议 10–15 条），每条**填入** `summary` 字段（一句话中文导读，30–60 字）。页面发现 `summary` 存在时会用「✨ AI 导读」样式优先展示。

---

## 接入路径 A：直连 Anthropic API（推荐起步）

最直观、按 token 计费、Vercel 上运行无障碍。

### 1. 装 SDK

```bash
npm install @anthropic-ai/sdk
```

### 2. 改 `src/lib/news/ai.ts`

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { NewsItem } from "./types";

export type AICurator = (items: NewsItem[]) => Promise<NewsItem[]>;

const client = new Anthropic();

export const aiCurator: AICurator = async (items) => {
  const list = items
    .map((it, i) => `[${i}] (${it.source}) ${it.title}\n${it.excerpt}`)
    .join("\n\n");

  const res = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system:
      "你是 AI 面包君的内容编辑，从一堆 AI 新闻里挑出最值得普通人关注的 10–12 条，并各写一句 30–60 字的中文导读，强调「为什么值得看」。返回 JSON 数组，每条 {index, summary}。",
    messages: [{ role: "user", content: list }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const json = text.match(/\[[\s\S]*\]/)?.[0];
  if (!json) return items.slice(0, 10);

  const picks: { index: number; summary: string }[] = JSON.parse(json);
  return picks
    .map((p) => {
      const it = items[p.index];
      return it ? { ...it, summary: p.summary } : null;
    })
    .filter((x): x is NewsItem => !!x);
};
```

### 3. 加环境变量

Vercel Project Settings → Environment Variables：

- `ANTHROPIC_API_KEY` = `sk-ant-...`

### 4. 成本预估

- 每天 40 条 × 平均 ~80 字 ≈ 4k input tokens + 2k output tokens
- Haiku 4.5：约 $0.005/天 ≈ ¥0.04/天 ≈ **¥1.2/月**

---

## 接入路径 B：OpenAI / DeepSeek / 通义 / 其他兼容 OpenAI 的 API

国内用 DeepSeek 最便宜（API 兼容 OpenAI），按 token 大约是 Anthropic 的 1/10。

```bash
npm install openai
```

```ts
import OpenAI from "openai";
import type { NewsItem } from "./types";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const aiCurator = async (items: NewsItem[]) => {
  const list = items
    .map((it, i) => `[${i}] (${it.source}) ${it.title}\n${it.excerpt}`)
    .join("\n\n");

  const res = await client.chat.completions.create({
    model: "deepseek-chat",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "从下列 AI 新闻里挑 10–12 条最值得普通人关注的，给每条写 30–60 字中文导读。返回 {picks: [{index, summary}]}。",
      },
      { role: "user", content: list },
    ],
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return (parsed.picks ?? [])
    .map((p: { index: number; summary: string }) => {
      const it = items[p.index];
      return it ? { ...it, summary: p.summary } : null;
    })
    .filter(Boolean);
};
```

切换厂商只改 `baseURL` + `model` + `apiKey`：

| 厂商 | baseURL | model 示例 |
|------|---------|-----------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 智谱 | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` |
| Moonshot | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |

---

## 接入路径 C：Claude Code / GitHub Copilot 等订阅制套餐

订阅制（Claude Pro/Max、Copilot Pro、Cursor Pro）**不暴露通用 API**，**不能直接装在 Vercel 上跑**。但可以这么用：

### C-1. 把刷新流水线挪到本地或 GitHub Actions（生成静态 JSON）

思路：本地（或 GH Action 里运行的容器）跑一个脚本，调用 `claude` CLI / `gh copilot` 生成导读，把结果写成 JSON commit 进仓库，Vercel 重部署后页面就拿到了。

**改动概览**：

1. 新增 `scripts/refresh-news.ts`（本地/Action 跑），它调用 `fetchAllNews()` → 把列表喂给 `claude` CLI →把结果写到 `content/news/latest.json`。
2. 把 `src/lib/news/curate.ts` 的 `buildBundle` 改为读 `content/news/latest.json`（而不是 fetch RSS），`aiCurator` 不再需要。
3. `vercel.json` 的 cron 删掉（不再需要 Vercel 跑 cron）。
4. `.github/workflows/news.yml` 每天 8:00 跑脚本，commit `content/news/latest.json`，push 触发 Vercel 重部署。

**调用 Claude Code CLI 的脚本片段**：

```ts
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fetchAllNews } from "../src/lib/news/fetch";

const { items } = await fetchAllNews();
const list = items.slice(0, 40).map((it, i) =>
  `[${i}] (${it.source}) ${it.title}\n${it.excerpt}`
).join("\n\n");

const prompt = `从下列 AI 新闻里挑 10–12 条最值得普通人关注的，给每条写 30–60 字中文导读。只返回 JSON 数组 [{index, summary}]，不要任何解释文字。\n\n${list}`;

const out = execSync(`claude -p ${JSON.stringify(prompt)}`, {
  encoding: "utf-8",
  maxBuffer: 10 * 1024 * 1024,
});

const json = out.match(/\[[\s\S]*\]/)![0];
const picks: { index: number; summary: string }[] = JSON.parse(json);
const curated = picks
  .map((p) => items[p.index] && { ...items[p.index], summary: p.summary })
  .filter(Boolean);

writeFileSync(
  "content/news/latest.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), items: curated, failedSources: [] }, null, 2),
);
```

### C-2. 关键限制 / 注意事项

- **CI 里登录订阅账号麻烦**：Claude Code / Copilot 都需要交互式登录。GitHub Action 上跑要么用 PAT/密钥（厂商不一定支持），要么用 self-hosted runner（自己一台机器，登录一次后常驻）。
- **服务条款**：把订阅当 API 自动化调用，部分厂商 ToS 不允许。Claude Code 在「Max plan」下允许命令行 batch 用法；GitHub Copilot 的 ToS 明确禁止「自动化代码 / 内容生产」用途，不要用。
- **省成本对比**：DeepSeek API 全年成本不到 ¥20，订阅制 ¥150–¥300/月——单为日刊用订阅不划算。订阅适合**你已经有了**、顺便挂上的场景。

> **建议**：起步先走路径 A 或 B（API 直连），项目跑顺了再考虑路径 C。

---

## 接入路径 D：本地 Ollama（零成本，需自己有机器常开）

只在你有一台 24/7 开机的 NAS / 小主机时考虑。

```ts
const res = await fetch("http://your-nas:11434/api/chat", {
  method: "POST",
  body: JSON.stringify({
    model: "qwen2.5:7b",
    format: "json",
    messages: [{ role: "user", content: prompt }],
    stream: false,
  }),
});
```

要把那台机器的 Ollama 端口暴露给 Vercel（或换路径 C 把 cron 跑在那台机器上），网络配置稍麻烦。

---

## 调试与回归

### 本地手动触发

```bash
npm run dev
# 另开一个终端
curl http://localhost:3000/api/news/refresh
```

返回 `{ ok: true, count: N, failed: [...] }` 即正常。打开 `/news` 看页面。

### 部署后手动触发

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://aibread.site/api/news/refresh
```

`CRON_SECRET` 是你在 Vercel 加的环境变量。Vercel Cron 自带 Bearer header，会自动通过鉴权。

### 容错

- 单个源拉取失败不影响整体，会出现在页面顶部的「部分源暂不可达」里
- AI 调用失败应让 `aiCurator` 把异常吞掉、回退到 identity（建议加 `try/catch`）
- 页面有 ISR fallback，AI 没准备好时显示原 `excerpt`

---

## 文件索引

| 角色 | 文件 |
|------|------|
| 数据源清单 | `src/lib/news/sources.ts` |
| RSS 拉取 | `src/lib/news/fetch.ts` |
| **AI 导读 hook** | `src/lib/news/ai.ts` ← 改这里 |
| 流水线 + 缓存 | `src/lib/news/curate.ts` |
| Cron 触发 API | `src/app/api/news/refresh/route.ts` |
| 列表页 | `src/app/news/page.tsx` |
| Cron 配置 | `vercel.json` |
