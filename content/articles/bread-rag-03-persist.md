---
title: "第 3 章 · 多文档 + 持久化索引"
slug: "bread-rag-03-persist"
excerpt: "让模型找到资料。多文档 + 持久化索引，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 40
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread RAG"
courseSlug: "rag"
courseOrder: 3
chapter: 3
seriesOrder: 19
difficulty: 2
codeLines: 280
---
## 1. 故事：让索引"过夜"

ch02 的索引在内存里。每次启动 main.py 都要**重新调一遍 embedding API**——
慢、费钱、伸缩性差。如果索引规模到 10000 chunks，光重新 embed 一次就要几分钟。

而且我们之前只支持**单文档**。真实场景里你有十几篇产品手册、几十篇 FAQ、几百份历史工单——这些应该统一进一个索引。

这一章我们做 4 件事：

1. **多文档入库** —— `docs/` 目录下所有 .md 一起进库
2. **增量入库** —— 同一索引可以多次 add_documents（先有 100 篇，明天再加 5 篇）
3. **pickle 持久化** —— 一次建库、永久使用
4. **封装成 class** —— 工程级 API（`RAGIndex.add_documents` / `.search` / `.save` / `.load`）

文件结构：

```
ch03_persist/
├── rag.py        # ★ RAGIndex 类（本章核心）
├── main.py       # 端到端 demo
├── docs/
│   ├── bread_workshop.md
│   ├── hr_policy.md
│   └── rd_roadmap.md
├── index.pkl     # 首次运行后生成
└── README.md
```

---

## 2. 跑起来

第一次跑：从零建库

```
cd ch03_persist
python main.py
```

应该看到：

```
[索引] 没找到 index.pkl，从 docs/ 目录新建...
[索引] 新增 13 个 chunks，索引总量 13
[索引] 已保存到 index.pkl (120 KB)

=== 问题 1: 公司在哪儿？什么时候成立的？ ===
[检索] top-3 命中：
  - [bread_workshop.md] (cos=0.531) ## 一、关于公司
  ...
AI: ...总部位于上海，成立于 2018 年。[bread_workshop.md]
```

第二次跑：直接从盘上加载（不再调 embedding API）

```
python main.py
```

第一行变成：

```
[索引] 从 index.pkl 加载了 13 个 chunks
```

**这两次跑的速度差距是肉眼可见的**——第一次要等几秒的 embed API；第二次秒开。

---

## 3. 逐行精讲

### Chunk 数据类

```python
@dataclass
class Chunk:
    text: str
    source: str            # 文件名，回答时引用
    vector: list[float] = field(default_factory=list)
```

ch02 我们用裸 `list[str]` 装 chunks，但很快会发现"我想知道这段从哪个文件来"——所以升级到 `dataclass`，加 `source` 字段。

`source` 让 RAG 回答可以**引用来源**："根据 [hr_policy.md]，烘焙学徒月薪 6-9k"。这是企业级 RAG 必备能力——用户对答案的信任来自"看得到来源"。

### RAGIndex.add_documents

```python
def add_documents(self, paths: list[Path]):
    new_chunks = []
    for p in paths:
        text = Path(p).read_text(encoding="utf-8")
        new_chunks.extend(chunk_by_heading(text, source=str(p.name)))

    texts = [c.text for c in new_chunks]
    vectors = self._embed_batch(texts)
    for c, v in zip(new_chunks, vectors):
        c.vector = v

    self.chunks.extend(new_chunks)
```

注意 `self.chunks.extend(...)`——**追加，不是替换**。所以同一个 index 可以多次 `add_documents`，做增量入库。

### `_embed_batch` 分批策略

```python
def _embed_batch(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
    out = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        resp = self.embedding_client.embeddings.create(
            model=self.embedding_model, input=batch,
        )
        out.extend(d.embedding for d in resp.data)
    return out
```

为什么分批？因为单次 API 调用有上限（硅基流动 bge-m3 是 32 条/批）。**分批是工程必备**——既不会单次太大被拒，又比一条条调省得多。

### pickle 持久化

```python
def save(self, path):
    with Path(path).open("wb") as f:
        pickle.dump({
            "embedding_model": self.embedding_model,
            "chunks": self.chunks,
        }, f)

@classmethod
def load(cls, path, embedding_client):
    with Path(path).open("rb") as f:
        data = pickle.load(f)
    idx = cls(embedding_client=embedding_client,
              embedding_model=data["embedding_model"])
    idx.chunks = data["chunks"]
    return idx
```

**关键点**：

1. **embedding_client 不进 pickle**——它内含网络连接、API key，不可序列化也不该序列化
2. **embedding_model 名字进 pickle**——这样 load 时能验证你用的还是同一个模型（实际生产里会做 model 一致性检查）
3. **pickle 安全提示**：**绝不要 load 不可信来源的 pkl 文件**——pickle 可以执行任意代码

### 为什么 13 个 chunks

3 个 .md 文件，每个里若干 `## 二级标题`，总共 13 个。看一下：

```
bread_workshop.md  → "# 标题" + 一、二、三、四 → 5 块
hr_policy.md       → "# 标题" + 招聘流程/薪酬体系/试用期/加班假期 → 5 块
rd_roadmap.md      → "# 标题" + 2026 重点/Q1/Q2/Q3/Q4/长期方向 → 3 块（一些短段会被合）
```

实际上 ch01/ch02 用的 `re.split` 只切 `## ` 级别。`# 一级标题` 是文档的"开头"块，不会被切。

---

## 4. 卡住了怎么办

### ❌ 第二次跑还是慢

如果你看到 `[索引] 没找到 index.pkl，从 docs/ 目录新建...`——说明 pkl 文件被删了。检查 `index.pkl` 是不是被加进了 .gitignore 然后被 git clean 掉了。

### ❌ 想刷新某一份文档

最简单：删 index.pkl 重建。或者写个 `RAGIndex.remove_source("hr_policy.md")` 然后再 add。本课程没实现，留作思考题。

### ❌ pickle 文件特别大

正常。每个 chunk 是 1024 维 float（≈8KB），13 个 chunks ≈ 100KB。如果你有 1 万个 chunks，pickle 文件就要 80MB——这时候应该换 **向量数据库**（FAISS / Chroma / Qdrant），它们用更紧凑的存储 + 索引加速。

### ❌ 改了文档但 RAG 还是旧答案

`index.pkl` 没刷新。删它重建。**这就是 RAG 系统最常见的运维痛点**——文档变了但索引没同步，工程上要做"watch 文件 → 检测变化 → 增量重建"。

### ❌ 想存到数据库而不是 pickle

把 save / load 改成写 SQLite 或 JSON。1 万条以下规模都能 hold 住。再往上就该上专业向量库。

---

## 5. 思考题

### 题 1：增量入库

启动 main.py 一次（生成 index.pkl）。然后**改 `main.py` 让它在 load 完之后再 add 一个新文件**（你自己造一份 docs/new.md），看 search 能不能命中新文件的内容。**理解**：增量入库 = `load` + `add_documents` + `save`。

### 题 2：删除某个 source

给 `RAGIndex` 加一个方法：

```python
def remove_source(self, source: str):
    self.chunks = [c for c in self.chunks if c.source != source]
```

试一下：删 hr_policy.md 后问"烘焙学徒月薪是多少"，看会发生什么。

### 题 3：换 chunk 策略

把 `chunk_by_heading` 改成"按 200 字滑窗、相邻 50 字重叠"。同样 5 个问题，看哪些命中改善、哪些反而变差。**理解**：chunk 策略的选择是个 trade-off——细粒度精确但碎片化、粗粒度信息量足但稀释相关性。

---

## 这一章你学会了什么

- ✅ `dataclass Chunk` 把"内容 + 元数据 + 向量"打包
- ✅ `RAGIndex.add_documents` 支持多文件、增量入库
- ✅ `_embed_batch` 分批调 API（必备工程技巧）
- ✅ pickle 持久化整套索引，秒级加载
- ✅ 回答时**引用 source**——企业级 RAG 必备

**下一章 ch04**：BoW（ch01）和 embedding（ch02-03）各有短板。生产 RAG 用**hybrid（混合检索）**——把两者结合再加一层 rerank 复评。

