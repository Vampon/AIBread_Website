---
title: "第 1 章 · 手写词袋检索（BoW + 余弦）"
slug: "bread-rag-01-bow"
excerpt: "让模型找到资料。手写词袋检索（BoW + 余弦），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 50
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread RAG"
courseSlug: "rag"
courseOrder: 3
chapter: 1
seriesOrder: 17
difficulty: 3
codeLines: 150
---
## 1. 故事：从"塞全文"到"先检索后生成"

ch00 我们把整篇文档塞 prompt。文档一长就崩。

RAG 的核心思路是**"先检索后生成"**：

```
                     用户提问
                        │
       ┌────────────────┼────────────────┐
       │                                 │
       ▼                                 │
+--------------+      检索 (cosine)       │
|  向量索引     │ ◄───────────────────────┘
|  (offline)   │
+--------------+
       │
       │  返回 top-3 最相关的片段
       ▼
+----------------------+
| 拼进 prompt 给 LLM    |
+----------------------+
       │
       ▼
       AI 的回答
```

3 件事必须做对：

1. **切块（chunking）**：长文档切成几十段
2. **向量化（embedding）**：每段表达成一组数字
3. **检索（retrieval）**：用户提问 → 提问也向量化 → 找出最相似的几段

**这一章我们用最朴素的方式做这 3 件事——纯 Python 标准库，零 ML 依赖**：
- 切块：按 markdown `##` 标题切
- 向量化：词袋（Bag of Words，每个词出现几次）
- 相似度：余弦相似度

跑通后你会理解：所谓"向量数据库"、"向量检索"听起来很高大上，**核心就 30 行 Python**。

---

## 2. 跑起来

```
cd ch01_bow
python main.py
```

预期输出：

```
[索引] 文档切成 9 个 chunks
[索引] 平均每个 chunk 59 个不同词

=== 问题 1: 你们公司哪一年成立的？ ===
[检索] top-3 片段:
  - 第1块 (cos=0.247) ## 一、关于公司
  - 第2块 (cos=0.117) ## 二、产品线
  - 第3块 (cos=0.081) ## 三、原料采购
AI: Bread 面包工坊成立于 2018 年。

=== 问题 2: 加盟费是多少？培训要多久？ ===
[检索] top-3 片段:
  - 第5块 (cos=0.338) ## 五、加盟政策
  ...
AI: 加盟费 38 万元，培训时长 14 天...

...
```

**关键观察**：

- 每个问题先打印 `[检索]` 找到的 top-3 片段及相似度分数
- AI 看到的**不再是整本文档**——只有 top-3 片段
- 5 个问题全部答对——证明 BoW 这种朴素方法在中等粒度问题上**就够用**

---

## 3. 逐行精讲

### 第 1 段：切块（chunk_by_heading）

```python
def chunk_by_heading(text: str) -> list[str]:
    parts = re.split(r"\n(?=## )", text)
    return [p.strip() for p in parts if p.strip()]
```

正则 `\n(?=## )` 用了 **lookahead**：在 `\n` 前**断开**，但**保留** `## ` 在下一块。这样每个 chunk 都带着自己的标题，是个完整段落。

真实场景的切块策略多得多：
- **按字数滑窗**（chunk_size=512, overlap=50）
- **按句子边界**（用句号、问号断开）
- **按语义边界**（用 LLM 自己切——慢但效果好）

ch04 我们会做更精细的版本。本章用最朴素的"按 ## 切"。

### 第 2 段：分词（tokenize）

```python
def tokenize(text: str) -> list[str]:
    tokens = []
    for word in re.findall(r"[a-zA-Z0-9]+", text):
        tokens.append(word.lower())
    for ch in text:
        if "一" <= ch <= "鿿":
            tokens.append(ch)
    return [t for t in tokens if t not in STOPWORDS]
```

中文用**按字切**（每个汉字一个 token），英文用**按词切**（连续字母数字算一个）。再过一遍停用词。

**按字切**听起来粗暴，但对一两段几百字的文本，效果意外地不差。生产环境通常用 [jieba](https://github.com/fxsjy/jieba) 或 BPE 分词器；本课程零依赖。

### 第 3 段：词袋向量化（vectorize）

```python
def vectorize(text: str) -> Counter:
    return Counter(tokenize(text))
```

**就这一行**。`Counter` 是 Python 标准库的"自动计数 dict"——`Counter(["我","爱","面","包","面","包"])` 立刻得到 `{"我":1, "爱":1, "面":2, "包":2}`。

这个 Counter 就是我们的"向量"——key 是词，value 是次数。它是个**稀疏向量**（vocabulary 几千个词，但每段只用几十个）。Counter 形态恰好天然适合稀疏表达。

### 第 4 段：余弦相似度（cosine_similarity）

```python
def cosine_similarity(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common_keys = set(a) & set(b)
    dot = sum(a[k] * b[k] for k in common_keys)
    norm_a = math.sqrt(sum(v*v for v in a.values()))
    norm_b = math.sqrt(sum(v*v for v in b.values()))
    return dot / (norm_a * norm_b)
```

数学公式：

$$
\cos(A, B) = \frac{\vec A \cdot \vec B}{|\vec A| \cdot |\vec B|}
$$

代码 3 行就完成了：

1. **点积**：两个向量 key 一样的位置相乘相加。我们用 `set(a) & set(b)` 取共同 key，省去稀疏向量里大量 0 \* 0 的浪费
2. **模长**：自己跟自己点积再开平方
3. **相除**

返回值在 [0, 1] 之间（因为我们的频次都是非负的）。**0 = 完全无关，1 = 完全一样**。

### 第 5 段：检索（retrieve）

```python
def retrieve(query, chunk_vectors, chunks, k=3):
    qv = vectorize(query)
    scores = [(i, cosine_similarity(qv, cv), chunks[i]) for i, cv in enumerate(chunk_vectors)]
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:k]
```

把 query 也向量化，对每个 chunk 算一次余弦，排序取前 K。**线性扫描**——对几千个 chunk 完全够用。

生产环境数据量大（百万级 chunks）会用 FAISS / HNSW 做 ANN（近似最近邻），但**算法本质就是这套**。

### 第 6 段：增强生成（ask_with_rag）

```python
def ask_with_rag(question, retrieved):
    context_blocks = []
    for i, (idx, score, text) in enumerate(retrieved, 1):
        context_blocks.append(f"--- 片段 {i} (相似度 {score:.3f}) ---\n{text}")
    context = "\n\n".join(context_blocks)

    messages = [
        {"role": "system", "content": "...\n" + context},
        {"role": "user", "content": question},
    ]
    resp = client.chat.completions.create(model=MODEL, messages=messages)
    return resp.choices[0].message.content
```

跟 ch00 的**唯一区别**：system prompt 里的"知识库"不再是整本文档，只是检索到的 top-K 片段。

**这就是完整 RAG 闭环**。160 行代码（含注释），全部 Python 标准库。

---

## 4. BoW 的极限：什么时候它不够用

虽然我们 5 个问题都答对了，但**BoW 有明显短板**——所有"语义检索"的需求它都搞不定：

| 用户问 | 文档里写 | BoW 能不能匹配 |
|---|---|---|
| "公司在哪儿？" | "**总部位于**上海" | ❌（"在哪儿" / "位于" 没共同字） |
| "小麦粉来自哪？" | "**原料采购**" | ❌（用户根本不知道叫"原料采购"） |
| "vegan 选项" | "植物基" | ❌（"vegan"是英文，文档说中文） |
| "周年庆有什么活动" | "节日限定" | ❌（"周年庆"和"节日"是近义但不同词） |

**这就是 ch02 引入"真 embedding"要解决的问题**——把每段映射到几百维稠密向量，让"位于" 和 "在哪儿" 在向量空间里靠近。

---

## 5. 卡住了怎么办

### ❌ 5 个问题答得不准

可能你的文档跟我的不一样。或者你删了 STOPWORDS。或者 chunk 切得太大/太小。

调参建议：
- 把 `k=3` 改成 `k=5` 看是不是有相关片段排在第 4
- 删 STOPWORDS 看是不是某些停用词被误删了关键信息

### ❌ 中文按字切感觉太粗

完全可以装 `pip install jieba`，把 `tokenize` 改成：

```python
import jieba
def tokenize(text):
    return [t for t in jieba.cut(text) if t.strip() and t not in STOPWORDS]
```

效果会更好。本课程为了零依赖用按字切。

### ❌ 相似度都很低（< 0.3）

正常。BoW 余弦相似度本来就不会很高——共同词太少。**绝对值不重要，相对排名重要**。

### ❌ AI 还是答错了

把 `[检索]` 那段打印拿来看——如果**检索到的片段就不对**，是检索的问题，需要更好的 embedding（ch02）。如果**检索对了但生成错了**，是 prompt 工程或模型能力的问题。

---

## 6. 思考题

### 题 1：换 chunk 策略

把 `chunk_by_heading` 改成"按 200 字滑窗"——每 200 字一个 chunk，相邻 chunk 重叠 50 字：

```python
def chunk_sliding(text, size=200, overlap=50):
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i+size])
        i += size - overlap
    return chunks
```

跑同样的 5 个问题，对比检索效果。**理解**：chunk 大小是 RAG 的关键调参——太大 → 噪声多；太小 → 信息不全。

### 题 2：加 IDF（升级到 TF-IDF）

BoW 把"的"和"加盟"看得一样重要。**TF-IDF** 给越罕见的词更高权重：

$$
\text{IDF}(w) = \log \frac{N}{\text{df}(w)}
$$

其中 N 是 chunk 总数，df(w) 是包含词 w 的 chunk 数。把 `vectorize` 改成返回 TF \* IDF 加权的 Counter，看相似度排名怎么变。

### 题 3：用 jieba 分词

```bash
pip install jieba
```

把 `tokenize` 改成 jieba 分词。看检索质量提升多少。**理解**：分词器质量直接决定 BoW 检索质量——这就是为什么大家最后都转向语义向量（不用分词器）。

---

## 这一章你学会了什么

- ✅ **RAG 的完整 3 步**：切块 / 向量化 / 检索
- ✅ **BoW + 余弦**：30 行 Python 实现的检索引擎
- ✅ 中文按字切的"零依赖"分词
- ✅ Counter 作为稀疏向量的天然容器
- ✅ BoW 的极限：搞不定"语义"近义

**下一章 ch02**：把"按字数表达"换成"按语义表达"——调真正的 embedding API，把每段映射到 1024 维空间。让"位于"和"在哪儿"靠近。

