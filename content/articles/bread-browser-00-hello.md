---
title: "第 0 章 · Hello Playwright"
slug: "bread-browser-00-hello"
excerpt: "让模型操作网页。Hello Playwright，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 20
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 0
seriesOrder: 22
difficulty: 1
codeLines: 50
---
## 1. 故事：让 AI 用浏览器之前，先让你能用 Playwright

整门课的核心是"让 LLM 操作浏览器"。但操作浏览器是**两件事**：

```
LLM 决策          ←→   浏览器执行
（点 [3] 按钮）         （Playwright 真的点）
```

后半部分跟 AI 没关系，是纯工程。这一章把这部分做扎实，后续 5 章你才能专心想 AI 的部分。

3 件事：

1. **启动浏览器** —— Playwright 的工作流"管家"
2. **打开网页** —— 一行 `page.goto()`
3. **读 DOM + 截图** —— 之后 LLM 看到的就是这些

---

## 2. 跑起来

### 安装

```
pip install -r ../requirements.txt
python -m playwright install chromium
```

**第二行很关键**：Playwright 跟其他库不同，包本身只是个"控制器"，**还要单独装浏览器二进制**。如果你跳过这一步，下一步会报 `Executable doesn't exist`。

### 跑

```
cd ch00_hello
python main.py
```

### 预期输出

你会看到：

1. **一个 Chrome 窗口自动弹出来** —— 不是错觉，那就是被代码控制的浏览器
2. 它自己打开 `quotes.toscrape.com`
3. 等 2 秒后窗口关闭
4. 当前目录多了一个 `hello.png` —— 截图

终端打印：

```
[1/4] 启动 Chromium...
[2/4] 新建一个标签页...
[3/4] 打开 https://quotes.toscrape.com ...
  网页标题: Quotes to Scrape
  H1 文本: Quotes to Scrape
  第一条引言: "The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking."...
[4/4] 截图存到 hello.png

完成 ✓  打开 hello.png 看截图
```

---

## 3. 逐行精讲

### `sync_playwright()` —— 必须用 `with`

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    ...
```

Playwright 在底层是 Node.js 进程，Python 通过 IPC 跟它通信。`sync_playwright()` 启的不是"一个对象"——是**一个后台 Node 进程**。

如果你忘了 `with`、用普通赋值（`p = sync_playwright().start()`），程序结束时 Node 进程**可能不被清理**——你机器上会留个僵尸进程。

**记住：永远 `with sync_playwright() as p:`** —— 整门课所有章都这么写。

### `headless=False` 看见浏览器

```python
browser = p.chromium.launch(headless=False)
```

- `headless=True`（默认）：浏览器在后台跑，看不见。生产环境用这个。
- `headless=False`：浏览器弹窗。**教学和调试都强烈建议用 False** —— 你能亲眼看到 AI 在干什么，出 bug 一眼就知道。

### `page.goto()` —— 同步等待加载

```python
page.goto("https://quotes.toscrape.com")
```

Playwright 默认会**等到页面 load 事件触发后**才返回。所以下一行 `page.title()` 可以直接用，不需要 `sleep`。

这是 Playwright 比 Selenium 好用的地方之一 —— 同步 API **不需要你手动 wait**。

### `page.locator()` —— Playwright 的选择器系统

```python
page.locator("h1").first.inner_text()
page.locator(".quote .text").first.inner_text()
```

`locator()` 接受 **CSS 选择器**（也支持 XPath、text=、role= 等），返回一个**惰性句柄** —— 它不立刻执行，等你调 `.inner_text()` / `.click()` 时才真的去找元素。

`.first` 取第一个匹配的元素（页面里有 10 条 quote）。

这是后面几章我们抽 DOM 时最常用的 API，一定要熟悉。

### `page.screenshot(full_page=True)`

```python
page.screenshot(path=str(screenshot_path), full_page=True)
```

`full_page=True` 截**整个页面**（包括滚动条下面的）。不设的话只截视口（viewport）。

本课程不用截图喂 LLM（我们走 DOM 路线），但截图对**调试**极其重要 —— 看 LLM "看到的"页面长什么样。

---

## 4. 卡住了怎么办

### ❌ `playwright._impl._errors.Error: Executable doesn't exist`

你跳过了 `python -m playwright install chromium`。补跑一遍。

### ❌ 浏览器弹出但 0.1 秒就关了

把 `page.wait_for_timeout(2000)` 改大，比如 `5000`（5 秒）。

### ❌ 公司电脑装不了 Chromium（被 IT 锁了）

试 `p.firefox.launch()` 或 `p.webkit.launch()`。Playwright 自己带这三种浏览器，Chromium 装不上换一个。

### ❌ Mac M 芯片报错

通常是 Playwright 没认 ARM。`pip install --upgrade playwright` 后重装：

```
python -m playwright install --force chromium
```

### ❌ 我看不见浏览器（headless=False 但没弹窗）

可能你在 SSH / Docker / WSL 里跑，没有图形界面。把 `headless=True`，看截图就行。

### ❌ `goto` 卡住超时

quotes.toscrape.com 服务器有时挂；试试 `https://example.com` 先验证 Playwright 本身没问题，再换站点。

### ❌ 跑完命令行光标卡住

可能 browser 进程没被回收。`Ctrl+C` 强退；下次确认 `with` 写对了。

---

## 5. 思考题

### 题 1：换浏览器

把 `p.chromium.launch` 改成 `p.firefox.launch`，再跑一遍。
观察：截图有什么不同？打开开发者工具时 H1 元素的渲染有什么差异？

> 思考：生产环境为什么大多数 AI agent 用 Chromium？

### 题 2：抓取多条引言

文档：https://playwright.dev/python/docs/locators

修改代码，把页面上**所有** 10 条引言都打印出来（提示：`locator(".quote .text").all_inner_texts()`）。

> 这一题为 ch01 的"批量抽元素"思路热身。

### 题 3：用真实站点

把 URL 换成你常用的网站（如 `https://www.zhihu.com`）。

观察：

- 加载时间长多少？
- 是否被反爬墙拦截？
- 截图里能看到的内容是否完整？

> 真实站点的复杂度 / 反爬 / 验证码 / SPA 渲染等，是本课程主线**不深入**的部分。但你应该亲眼看一次差距。

---

## 下一章预告

ch01 我们开始让"AI 能理解页面"——把页面上**所有可交互元素**（按钮、输入框、链接）抽出来，编号成 `[1] 搜索框  [2] 提交按钮  [3] 登录链接` 的纯文本，**这就是给 LLM 看的"网页"**。

> 这一章是整门课的**信息压缩核心**——把几千行 HTML 压成几十行 LLM 友好文本。

