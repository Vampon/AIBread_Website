---
title: "第 4 章 · Hybrid 检索 + LLM Rerank"
slug: "bread-rag-04-hybrid"
excerpt: "让模型找到资料。Hybrid 检索 + LLM Rerank，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 60
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread RAG"
courseSlug: "rag"
courseOrder: 3
chapter: 4
seriesOrder: 20
difficulty: 4
codeLines: 380
---
## 1. 故事：单一检索的盲区

ch02-ch03 用向量检索。看起来很美——但工业实战会撞墙：

| 查询 | 向量检索 | BM25 |
|---|---|---|
| "BW-20260301-0042 的订单" | ❌ 编号语义低，命中率差 | ✅ 字面精准匹配 |
| "vegan 选项" | ✅ 命中"植物基" | ❌ 完全没共同字 |
| "员工面包福利" | 半准（命中"员工"语义） | 半准（命中"福利"字面） |

**单一检索都有盲区**。生产 RAG 都做 hybrid（混合检索）：

```
                     用户查询
                        │
            ┌───────────┴────────────┐
            ▼                        ▼
     +-------------+          +-------------+
     | 向量检索     │          │ BM25 检索    │
     | top-10      │          │ top-10      │
     +-------------+          +-------------+
            │                        │
            └───────────┬────────────┘
                        ▼
                  +----------+
                  | RRF 融合  │       ← 用 Reciprocal Rank Fusion
                  +----------+         合并两个排名列表，跳过分数尺度问题
                        │
                        ▼
                  +-----------+
                  | LLM 重排   │       ← 给 LLM 看 top-K 候选
                  +-----------+         让它选最相关的 final_k 个
                        │
                        ▼
              拼进 prompt 让 LLM 回答
```

本章把这套完整做出来。

---

## 2. 跑起来

```
cd ch04_hybrid
python main.py
```

预期输出（截取问题 1 的展示）：

```
======================================================================
问题 1: BW-20260301-0042 这个订单退款时要注意什么？
======================================================================
  [向量检索 top-5]
    #1 [bread_workshop.md] (chunk 5) ## 五、订单编号规则
    #2 [bread_workshop.md] (chunk 4) ## 四、退换货政策
    ...
  [BM25 检索 top-5]
    #1 [bread_workshop.md] (chunk 5) ## 五、订单编号规则
    #2 [bread_workshop.md] (chunk 4) ## 四、退换货政策
    ...
  [Hybrid (RRF) top-5]
    #1 [bread_workshop.md] (chunk 5) score=0.033
    ...
  [LLM 重排 final top-3]
    #1 [bread_workshop.md] (chunk 4) ## 四、退换货政策
    #2 [bread_workshop.md] (chunk 5) ## 五、订单编号规则

AI: 根据订单编号 BW-20260301-0042 退款时，必须提供完整的订单编号...
```

**4 路结果并排展示**——这是教学的重点。看每个问题哪一路赢，你会内化"什么场景用什么"。

---

## 3. 逐行精讲

### BM25：手写的"经典 IR"

```python
class BM25:
    def __init__(self, corpus_tokens, k1=1.5, b=0.75):
        ...
        df = Counter()
        for doc in corpus_tokens:
            for term in set(doc):
                df[term] += 1
        self.idf = {term: math.log((self.N - n + 0.5) / (n + 0.5) + 1) for term, n in df.items()}
        self.tfs = [Counter(doc) for doc in corpus_tokens]
        self.doc_lens = [len(d) for d in corpus_tokens]

    def score(self, query_tokens):
        scores = [0.0] * self.N
        for i in range(self.N):
            for q in query_tokens:
                if q not in self.tfs[i]: continue
                idf = self.idf.get(q, 0.0)
                tf = self.tfs[i][q]
                dl = self.doc_lens[i]
                numer = tf * (self.k1 + 1)
                denom = tf + self.k1 * (1 - self.b + self.b * dl / self.avg_dl)
                scores[i] += idf * numer / denom
        return scores
```

公式直观解读：
- **tf** = 词频。出现越多次得分越高，但有上限（k1 = 1.5 控制递减斜率）
- **idf** = 逆文档频率。词越罕见越值钱（"加盟"比"的"信息量大）
- **|D|/avgDL** = 文档长度归一化。长文档天然容易撞到词，惩罚一下（b = 0.75 控制强度）

BM25 是 2010 年之前 Google 主排序算法的核心。**对编号、专有名词、英文术语**——它至今没被打败。

### RRF：跳过分数尺度的融合艺术

```python
def rrf_fuse(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, idx in enumerate(ranking):
            scores[idx] = scores.get(idx, 0.0) + 1.0 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

**问题**：BM25 分数可以是 0~50，向量余弦是 0~1。直接加权融合很糟糕。

**解决**：RRF 只看**排名**——第 1 名 = 1/(60+1)，第 2 名 = 1/(60+2)，...。两路都进 top 几的 chunk 自然累加得高分。**完全跳过原始分数尺度**。

`k=60` 是 RRF 论文里推荐的默认值。Elasticsearch、OpenSearch、Pinecone 的 hybrid 都用这个套路。

### LLM Rerank：用模型当裁判

```python
def llm_rerank(chat_client, model, query, candidates, final_k=3):
    listing = "\n".join(f"[{i}] {c.text[:200]}" for i, c in enumerate(candidates))
    messages = [
        {"role": "system", "content": "你是搜索结果重排序专家..."},
        {"role": "user", "content": f"查询: {query}\n\n候选片段:\n{listing}"},
    ]
    resp = chat_client.chat.completions.create(model=model, messages=messages, temperature=0)
    # 解析 LLM 返回的 "2,0,4" 这种编号序列
    picks = [int(x) for x in re.findall(r"\d+", resp.choices[0].message.content)]
    ...
```

**思想**：
- 用 BM25 + 向量取 fetch_k=10 个候选（**召回阶段**——快、宽）
- 用 LLM 看完所有候选再选 final_k=3 个（**精排阶段**——慢、准）

工业级 rerank 通常用专门的 cross-encoder 模型（如 bge-reranker-large），比 LLM 更快更便宜。我们这里用对话 LLM 直接当 reranker——**教学版图省事**。

**注意 `temperature=0`**——重排序要稳定输出，不要随机。

---

## 4. 卡住了怎么办

### ❌ LLM rerank 把候选筛得太狠（只剩 1-2 个）

这正是 ch04 输出里发生的事。LLM 倾向于严格——觉得"相关"才保留。要放宽：

- 改 system prompt 里的 "选出最多 final_k 个" 为 "**必须**输出 final_k 个最相关的"
- 或者降到 final_k=2，反正会被 prompt 进上下文

### ❌ BM25 返回的全是 0 分

通常是 query 用了文档里完全没有的词（如英文术语）。**这正是 hybrid 存在的意义**——向量分量会兜底。

### ❌ 中文 BM25 效果差

很正常——我们用"按字切"分词，BM25 在词级别才发挥最佳。装 jieba 改进：

```python
import jieba
def tokenize(text):
    return [t for t in jieba.cut(text) if t not in STOPWORDS]
```

### ❌ RRF score 看着都差不多 0.03

正常。RRF score = 1/61 ≈ 0.016，重复出现两次就 0.032。绝对值不重要，**排名**才是它的产出。

### ❌ rerank 把好的答案丢了

LLM 也会犯错。监督要点：
- 看 hybrid top-10 里是否本来就有正确答案——如果没有，是召回问题，rerank 救不了
- 看 rerank 选了什么——是不是 LLM 误解了 query

工业实践：**rerank 出错时，回退用 hybrid 原始排名**作为容错。

---

## 5. 思考题

### 题 1：禁掉某一路

把 `search_hybrid` 改成只用向量（删掉 bm25_top 那行），跑问题 1。看"BW-20260301-0042" 是否还命中订单编号规则——大概率会降到第 2-3 名。**这就是 BM25 不可替代的场景**。

反过来禁掉向量，跑问题 4 "我能从太原下单冷链配送吗？"——观察 BM25 单独的效果。

### 题 2：调权重

工业级 hybrid 通常给 BM25 和向量加权重（如 0.4 + 0.6）而不是简单加 RRF score。给 `rrf_fuse` 加 `weights=[0.5, 0.5]` 参数：

```python
def rrf_fuse(rankings, weights, k=60):
    scores = {}
    for ranking, w in zip(rankings, weights):
        for rank, idx in enumerate(ranking):
            scores[idx] = scores.get(idx, 0.0) + w / (k + rank + 1)
    ...
```

试不同权重组合（[0.7, 0.3] vs [0.3, 0.7]），看哪种对你的文档集更好。

### 题 3：用专业 reranker

`pip install sentence-transformers`，用 `BAAI/bge-reranker-large` 本地跑。它是 cross-encoder——同时看 query 和候选打分，比 LLM rerank 准确得多。

代价：要装 torch（~2GB），首次跑下 1GB 模型。生产环境部署是有 GPU 的服务端，本地教学用 LLM rerank 已够。

---

## 这一章你学会了什么

- ✅ **BM25 的公式**：tf + idf + 长度归一化
- ✅ **RRF 融合**：用排名而不是分数，跳过尺度问题
- ✅ **召回 + 精排**两阶段：宽召回（fetch_k=10）+ 严格精排（final_k=3）
- ✅ LLM rerank 的实现：让模型输出编号序列
- ✅ "什么场景用什么"的工程直觉

**下一章 ch05（终章）**：把 RAG 包成一个工具接入 Bread Agent —— agent 在多轮对话里自己决定"要不要查知识库"。

