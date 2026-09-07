---
title: "第 1 章 · DOM Snapshot"
slug: "bread-browser-01-dom_snapshot"
excerpt: "让模型操作网页。DOM Snapshot，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Browser"
courseSlug: "browser"
courseOrder: 4
chapter: 1
seriesOrder: 23
difficulty: 2
codeLines: 130
---
## 1. 故事：网页 HTML 给 LLM 是浪费

quotes.toscrape.com 首页的 HTML 大概长这样：

```html
<!DOCTYPE html><html><head>...300 行 head 标签和 meta...</head>
<body>
<div class="container">
  <div class="row header-box">
    <div class="col-md-8">
      <h1><a href="/" style="text-decoration: none">Quotes to Scrape</a></h1>
    </div>
    ...
  </div>
  <div class="quote" itemscope itemtype="http://schema.org/CreativeWork">
    <span class="text" itemprop="text">"The world as we have created it..."</span>
    ...
  </div>
  ...
</div>
</body></html>
```

10 KB，几百行，里面 90% 是布局 / 样式 / 元信息——**LLM 完全不需要**。

LLM 要回答的问题只有一个：

> "用户要登录。我应该点哪个元素？"

那它只需要知道：**页面上有哪些可点击的东西、它们叫什么名字、编号是几**。

这一章的产出：

```
[0] <a> Quotes to Scrape       → https://quotes.toscrape.com/
[1] <a> Login                  → https://quotes.toscrape.com/login
[2] <a> (about)                → https://quotes.toscrape.com/author/Albert-Einstein
...
[42] <a> Next →                → https://quotes.toscrape.com/page/2/
```

200 行 HTML 压成 55 行纯文本。Token 节省 ~10×。**这就是 browser-use / Skyvern 等项目能跑得起来的根本原因**。

---

## 2. 跑起来

```
cd ch01_dom_snapshot
python main.py
```

### 预期输出

依次抽 3 个页面：

1. **首页** → 55 个元素（很多 tag 链接 + Login 链接 + Next 按钮）
2. **/login** → 7 个元素，关键的是 `<input name="username">` / `<input name="password">` / `<input type="submit">`
3. **/search.aspx** → 含两个 `<select>`（author / tag 下拉）

最后浏览器停留 3 秒 —— 这时**打开 DevTools 看页面源码**，你会看到所有被抽到的元素都多了一个 `data-bread-id="N"` 属性。这是后续章节"通过编号点击元素"的钥匙。

---

## 3. 逐行精讲

### `page.evaluate()` —— 在浏览器里跑 JS

```python
elements = page.evaluate(EXTRACT_JS)
```

`EXTRACT_JS` 是一个**字符串**，里面是 JavaScript 代码。Playwright 把它扔进浏览器的 JS runtime 执行，把 `return` 的值序列化成 JSON 拿回 Python。

**为什么用 JS 而不是 Python 抽 DOM？**

Python 这边能做的只有 `page.locator(...)` —— 一次找一种选择器。但抽"所有可交互元素"需要：

- 遍历 5-6 种 selector
- 检查每个元素的可见性（`getBoundingClientRect` / `getComputedStyle`）
- 给每个元素**写入** `data-bread-id` 属性

这些事在 JS 里做是**几十毫秒一次性完成**；在 Python 里做要走几百次 IPC 调用，慢且复杂。

**记住：批量 DOM 操作用 `page.evaluate(JS_STRING)`，单个交互（click/type）用 `page.locator(...)`。**

### `EXTRACT_JS` 核心 selector

```javascript
const SELECTOR = [
  'button', 'input', 'a', 'select', 'textarea',
  '[role="button"]', '[role="link"]', '[role="textbox"]',
  '[onclick]', '[contenteditable="true"]'
].join(',');
```

包含三大类：

- **原生交互元素**：`button` / `input` / `a` / `select` / `textarea`
- **ARIA 角色**：现代网站很多用 `<div role="button">` 当按钮（React/Vue 写法）
- **绑了点击**：`[onclick]` 兜底；`[contenteditable]` 是富文本编辑器

**这个 selector 列表决定了 LLM 能"看到"哪些元素**。如果某个目标网站用了特殊的自定义组件（如 Web Components），可能要加进来。这是 ch01 的主要可调优点。

### 可见性过滤 —— 这一段是工程精华

```javascript
const rect = el.getBoundingClientRect();
if (rect.width === 0 || rect.height === 0) continue;
const style = window.getComputedStyle(el);
if (style.display === 'none' || style.visibility === 'hidden') continue;
if (parseFloat(style.opacity) === 0) continue;
```

为什么必须过滤？现代网页**到处都是看不见的元素**：

- 折叠菜单里的按钮（`display: none`）
- 用 `aria-hidden` 隐藏的备用 UI
- 加载未完成时占位的骨架屏
- `opacity: 0` 的渐变元素

如果不过滤，LLM 会看到几百个元素，**还会去点看不到的**——崩溃灾难。

**这 3 行过滤等于过掉了 80% 的噪声**。生产级 agent 还会判断元素是否在视口内、是否被遮挡（用 `elementFromPoint`），本课程为可读性不深入。

### `data-bread-id` —— 我们打的"暗记"

```javascript
el.setAttribute('data-bread-id', String(idx));
```

这是后续章节"通过编号点击元素"的关键。

下一章我们要做的是：

```python
# LLM 说："点 [5]"
page.locator('[data-bread-id="5"]').click()
```

为什么不直接用 CSS / XPath？因为它们**容易飘**：

- 同一个网页跑两次，CSS 路径可能因 DOM 变化而失效
- XPath 写起来 LLM 不擅长（容易写错）

用 `data-bread-id` 这个属性 selector，**只要这次快照拿到的元素还在页面上，就一定点得对**。这是 browser-use 等项目的核心 trick。

### `format_elements` —— LLM 友好格式

```python
parts = [f"[{el['idx']}] <{el['tag']}"]
if el["type"]:
    parts.append(f' type="{el["type"]}"')
parts.append(">")
if el["text"]:
    parts.append(f" {el['text']}")
```

输出格式像 HTML 但**简化掉了所有冗余**：

- 没有引号嵌套（`<input type="text">` 简化为 `<input type="text">` 但只保留 type、name）
- 文本截断到 100 字符（很多 `<a>` 里有几千字的）
- href 截断到 60 字符

**LLM 处理这种格式比处理 HTML 准确率高得多** —— 上下文紧凑、信息密集。

---

## 4. 卡住了怎么办

### ❌ 抽到 0 个元素

页面可能还没加载完。在 `snapshot_page` 之前加 `page.wait_for_load_state("networkidle")`。但**别滥用**——这会等所有网络请求结束，慢站点上能等 30 秒。

### ❌ 抽到几百个元素（噪声太多）

可能是动态广告 / 推荐位 / aria 嵌套。两种对策：

1. **加严过滤**：在 JS 里再加 `el.children.length > 10` 的过滤（嵌套太深的容器跳过）
2. **缩 selector**：把 `[onclick]` 去掉

### ❌ 元素抽到了但 LLM 选不对

不是 ch01 的锅，是 ch02-ch03 的事。先确认 ch01 抽出来的 `text` 字段对人类是清晰的——如果对人都不清晰，对 LLM 更不可能。

### ❌ 我看不到 data-bread-id 属性

可能你打开 DevTools 太晚了，等下次跑时**先打开 DevTools 再跑** `main.py`。或者你过滤掉了某些元素（它们就不会被打标）。

### ❌ 中文站点（如 zhihu/baidu）抽不到很多元素

很多国内站点用了 Shadow DOM 把内容封装起来。常规 `querySelectorAll` 进不去。这是本课程不深入的边角；生产级浏览器自动化会专门处理 Shadow DOM。

### ❌ 抽到一堆 (about) 之类的元素

那是 quotes.toscrape.com 的设计——它每条 quote 下面有个 "(about)" 链接指向作者主页。LLM 看到这种应该能自己理解。

---

## 5. 思考题

### 题 1：加 placeholder / aria-label 显示

当前 `format_elements` 只显示 `text`。但 `<input placeholder="搜索...">` 这种**没有 text 只有 placeholder**。改造 EXTRACT_JS 让 placeholder 也被收集（已经收集了）；改 `format_elements` 把它显示出来。

提示：当 `tag == "input"` 时，把 placeholder 当作 text 显示。

### 题 2：加视口位置

`getBoundingClientRect()` 不只能判断可见，还能拿坐标。加一个字段记录元素在视口内的位置（`top` / `left`），用 `(x=120, y=300)` 形式追加在每行末尾。

> 这有什么用？让 LLM 理解"上面的菜单 vs. 下面的按钮"——视觉空间感。

### 题 3：抽完保存为 JSON

把 `snapshot_page` 的返回写到 `snapshot.json`。然后做实验：

- 同一个页面抽两次，diff 一下，看 idx 是否稳定
- 把页面往下滚一屏再抽，看新元素是否被加进来（提示：会的）

> 思考：如果同一个页面前后抽到的 idx 不一样，会对 ch03 的 agent 循环有什么影响？

---

## 下一章预告

ch02 我们把这一章的"页面快照" + "任务描述"喂给 LLM，让它**输出一个 action**：

```
{"action": "click", "index": 2}     ← 点 Login
{"action": "type", "index": 3, "value": "alice"}   ← 在 [3] 输入框输入 alice
{"action": "done", "answer": "找到了"}
```

我们本地执行这个 action。**第一次让 LLM 真正"用浏览器"**。

