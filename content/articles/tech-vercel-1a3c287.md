---
title: "Vercel：前端部署为什么能\"推代码即上线\"？"
slug: tech-vercel-1a3c287
excerpt: "部署一个网站，传统做法要买服务器、配 Nginx（一款高性能 Web 服务器）、绑域名、搞 SSL 证书（安全套接层证书）……折腾半天才能上线。Vercel（一家云平台公司）把这整个过程压缩成一句话：git push（推送代码到远程仓库），你的网站就上线了。这篇文章讲清楚 Vercel 到底是什么、为什么它让前端部署简单到离谱，以及它和 Netlify（另一"
tag: "技术词典"
date: "2026-06-02"
cover: "/placeholders/cover-3.svg"
readMin: 7
importedFrom: "4-技术栈认知/42-Vercel是什么.md"
---
> **摘要：** 部署一个网站，传统做法要买服务器、配 Nginx（一款高性能 Web 服务器）、绑域名、搞 SSL 证书（安全套接层证书）……折腾半天才能上线。Vercel（一家云平台公司）把这整个过程压缩成一句话：`git push`（推送代码到远程仓库），你的网站就上线了。这篇文章讲清楚 Vercel 到底是什么、为什么它让前端部署简单到离谱，以及它和 Netlify（另一家网站部署平台）、传统云服务器的区别。

---

你写完一个网站，想让全世界看到。

传统做法：买一台云服务器 → SSH（安全外壳协议）连上去 → 装 Node.js（JavaScript 运行时环境）→ 配 Nginx → 把代码传上去 → 装 SSL 证书 → 绑域名。**这一套下来，部署比写代码还累。**

Vercel 把这一切变成了：`git push`。对，推完代码，网站就上线了。

---

## 📖 一句话定义

**Vercel 是一个前端部署和托管平台，专注于让开发者"推送代码即上线"，并提供全球 CDN（内容分发网络）、Serverless 函数（无服务器函数）、自动 HTTPS 和协作预览等能力。**

---

## 🏠 一个精妙的类比：寄快递 vs 拍立得

| | 传统部署（寄快递） | Vercel 部署（拍立得） |
|---|---|---|
| 流程 | 买服务器 → 配置环境 → 上传代码 → 配域名 → 配 SSL | `git push` → 自动检测 → 构建 → 上线 |
| 时间 | 几小时到几天 | 几十秒 |
| 回滚 | 手动操作，心惊胆战 | 一键回退到任意历史版本 |
| 预览 | 只能在自己电脑上看 | 每次代码修改自动生成一个预览链接 |
| 扩容 | 用户多了自己加机器 | 自动扩容，你完全不用管 |

**Vercel 让部署这件事从"运维工程"变成了"Git 操作"。**

> **🖼️ 图片建议：** 一张"拍立得 vs 寄快递"对比图。左侧"传统部署"：一个人满头大汗，面前是一堆零件——服务器机箱、SSL 证书文件、Nginx 齿轮、域名 DNS 记录（标注"几小时到几天，每一步都要手动配"）。右侧"Vercel"：同一个人按下快门（git push），一张照片（网站）立刻从相机里吐出来（标注"几十秒，自动完成"）。风格：可爱对比信息图，色彩明快。

---

## 🔧 Vercel 到底做了什么？

你把代码推到 GitHub（一个代码托管平台），Vercel 自动做四件事：

```
1. 检测到代码推送
2. 运行构建命令（npm run build）
3. 把构建产物部署到全球 CDN 节点
4. 自动配置 HTTPS 和域名
```

**你不写 Dockerfile，不配 Nginx，不买 SSL 证书。** Vercel 自动识别你用的框架——Next.js、Nuxt、Gatsby、Vite、Create React App……识别到了就用对应的最优构建配置。

```bash
# 传统方式部署一个 Next.js 应用：
# 1. 买服务器（$5-50/月）
# 2. SSH 登录：ssh root@123.456.789.0
# 3. 装依赖：apt install nodejs nginx git
# 4. 克隆代码：git clone https://github.com/xxx/my-app.git
# 5. 构建：npm run build
# 6. 配 Nginx 反向代理
# 7. 配 systemd 守护进程
# 8. 配 SSL（Let's Encrypt）
# 9. 绑域名 DNS 解析
# 10. 每次更新重复步骤 4-5，还要重启服务

# Vercel 方式：
# git push
# 没了。
```

---

## 🎯 Vercel 的核心能力

| 能力 | 做什么的 | 为什么重要 |
|---|---|---|
| **自动部署** | 推代码 → 自动构建 → 上线 | 不用学运维 |
| **全球 CDN** | 代码部署到全球 100+ 边缘节点 | 北京用户和纽约用户打开一样快 |
| **预览部署** | 每个分支自动生成一个预览 URL | 改完代码发个链接给同事看，不用部署到正式环境 |
| **Serverless 函数** | 写 API 不需要管理服务器 | 偶尔需要后端逻辑时，写个函数就行 |
| **自动 HTTPS** | SSL 证书自动申请和续期 | 不用操心证书过期 |
| **域名管理** | 支持自定义域名，一键绑定 | 用你自己的域名，不是 `xxx.vercel.app` |
| **分析和监控** | 页面性能、访问量、错误追踪 | 知道网站跑得怎么样 |

---

## ⚡ Serverless 函数：后端也不需要服务器了

你的网站偶尔需要一点后端逻辑——比如处理表单提交、调用第三方 API、读写数据库。但你不想为这点逻辑专门维护一台服务器。

**Vercel 的解法：Serverless 函数。**

```javascript
// api/hello.js —— 放在项目里，自动变成 API 接口
export default function handler(req, res) {
  res.status(200).json({
    message: '你好，这是 Vercel Serverless 函数',
    time: new Date().toISOString()
  })
}

// 部署后访问：https://你的域名/api/hello
// 返回：{"message":"你好...","time":"2026-06-02T..."}
```

**一个文件 = 一个 API 接口。** 没有服务器要管，没有进程要守护。没人访问时函数不运行也不收费，流量来了自动扩容。

> **🖼️ 图片建议：** 一张"Serverless 函数工作原理"示意图。从左到右：用户请求 → Vercel 边缘网络 → 函数冷启动（一个函数图标从休眠状态亮起来）→ 执行代码 → 返回结果 → 函数回到休眠状态。标注："没有请求时函数休眠不花钱，来请求时自动唤醒执行，流量暴涨时自动创建更多实例"。风格：技术流程图，简洁干净。

---

## 🆚 Vercel vs Netlify vs 传统云服务器

这是前端圈最常见的选型问题：

| | **Vercel** | **Netlify** | **传统云服务器（AWS/阿里云）** |
|---|---|---|---|
| 上手难度 | ⭐ 极低 | ⭐ 极低 | ⭐⭐⭐⭐⭐ 需要运维知识 |
| 框架支持 | 最强，Next.js 亲爹 | 很好，支持主流框架 | 什么都能跑，但要自己配 |
| Serverless 函数 | ✅ | ✅ | ✅（但要配 API Gateway） |
| 免费额度 | 慷慨（100GB 带宽/月） | 慷慨（100GB 带宽/月） | 通常有试用期 |
| Edge 函数 | ✅ 全球边缘运行 | ✅ | ❌ 需要自己搭 |
| 后端部署 | 有限（Serverless 为主） | 有限（Serverless 为主） | 无限制 |
| 最适合 | Next.js 项目、前端应用 | 静态网站、Jamstack | 全栈应用、复杂后端、微服务 |

**如果你主要做前端，Vercel 和 Netlify 二选一就够了。** 如果你需要跑数据库、消息队列、后台任务，才需要传统云服务器。

Vercel 和 Netlify 怎么选？简单说：**用 Next.js 选 Vercel（同一家公司做的，支持最好）；纯静态网站随意，两个都行。**

---

## 🧠 Vercel 和 AI 编程的结合

Vercel 天然适合 AI 辅助开发的工作流：

1. **AI 生成代码 → 推到 GitHub → Vercel 自动上线。** 你甚至不用在本地跑代码，AI 写完推上去，几十秒后一个可访问的 URL 就出现了。

2. **Vercel AI SDK。** Vercel 官方出了一个 AI SDK（软件开发工具包），专门帮开发者在 Vercel 上对接各种大模型——OpenAI（一家人工智能研究公司）、Anthropic（另一家人工智能公司）、Google AI（谷歌人工智能）等。它处理了流式输出、聊天历史、工具调用这些烦人的细节。

```javascript
// Vercel AI SDK：几行代码实现 AI 对话接口
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req) {
  const { messages } = await req.json()
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  })
  return result.toDataStreamResponse()
}
```

3. **AI 应用的一站式部署。** 你想做一个 AI 聊天网站？前端用 Next.js，API 用 Vercel Serverless 函数，数据库接 Supabase——全部有免费额度，推代码即上线。**一个完整的 AI 应用，不需要任何付费基础设施就能跑起来。**

4. **v0.dev。** Vercel 自己做的 AI 生成 UI 工具。用自然语言描述你想要什么界面，它生成一个完整的 React 组件，还能一键部署到 Vercel。这是"推代码即上线"进化到了"说话即上线"。

> **🖼️ 图片建议：** 一张"AI 编程 + Vercel 工作流"全景图。从左到右四个阶段：①AI 对话生成代码（一个人和 AI 对话框，旁边标注"v0.dev / Cursor / Claude"）→ ②代码推到 GitHub（GitHub 图标 + git push 箭头）→ ③Vercel 自动构建部署（Vercel 三角 logo，标注"自动检测框架 → npm run build → 部署到全球 CDN"）→ ④生成预览链接（手机和电脑屏幕显示同一个网站，标注"发链接给任何人看"）。风格：现代技术工作流图，色彩明快。

---

## 💡 Vercel 的局限性（诚实地说）

Vercel 不是万能的：

- **Serverless 函数有执行时间限制。** 免费版 10 秒，Pro 版 60 秒。如果你需要跑一个 10 分钟的视频转码任务，Serverless 做不了。
- **数据库不内置。** Vercel 只做部署和 Serverless，数据库你得另外接（Supabase、PlanetScale、Neon 都是好选择）。
- **不是给传统后端用的。** 如果你的应用核心是后端逻辑（大量的数据处理、WebSocket 长连接、后台定时任务），传统服务器更适合你。
- **价格随流量涨。** 小项目免费额度够用，但流量大了之后按量计费，可能比固定价格的 VPS（虚拟专用服务器）贵。

**Vercel 的最佳使用场景：前端应用 + 少量 Serverless 函数 + 外部数据库。** 如果你的应用恰好是这种形态，那 Vercel 接近完美。

---

## 💡 总结

- **Vercel = 推送代码即上线，部署从"几小时的运维操作"变成"一个 git push"**
- 核心能力：自动构建部署、全球 CDN、预览部署、Serverless 函数、自动 HTTPS
- Next.js 的亲生父亲，对 Next.js 的支持无人能及
- 和 AI 编程天然适配：AI 生成代码 → 推仓库 → Vercel 上线，流水线一气呵成
- 免费额度慷慨，个人项目和小团队基本够用
- 不是万能药——长时任务、复杂后端、大流量高预算场景要另做打算

**下次你写完一个前端项目，别琢磨怎么部署了——把代码推到 GitHub，去 Vercel 点几下，几分钟后把链接发朋友圈。**

---

**面包君** 🍞
*比你多懂一点的朋友*
