---
title: "第 2 章 · 真 embedding API（语义检索）"
slug: "bread-rag-02-embeddings"
excerpt: "让模型找到资料。真 embedding API（语义检索），边读边运行配套 Python 代码。"
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
chapter: 2
seriesOrder: 18
difficulty: 2
codeLines: 200
---
## 1. 故事：从"字面"到"语义"

ch01 的词袋（BoW）检索能用，但它**只看字面**：

| 用户问 | 文档里写 | BoW 能不能匹配 |
|---|---|---|
| "公司**在哪儿**？" | "总部**位于**上海" | ❌ |
| "**vegan** 选项" | "**植物基**" | ❌ |
| "小麦粉**从哪里来**？" | "**原料采购**" | ❌ |
| "想**退货**可以吗" | "**退换货**政策" | ❌ |

这就是为什么 BoW 在生产环境会让用户骂街——**用户说话方式和文档里写的从来不一样**。

这一章我们换"真 embedding 模型"——一个被训练过的 AI 把每段文字映射到 1024 维的稠密向量。在它的"语义空间"里，**"位于"和"在哪儿"距离很近，"vegan"和"植物基"也很近**——即使它们没有任何共同字。

**代码 99% 跟 ch01 一样**——唯一变化是 `vectorize()` 从"数词频"换成"调 embedding API"。这就是工程上的优雅：**检索算法不变，换数据源就升级了一个维度**。

---

## 2. 跑起来

```
cd ch02_embeddings
python main.py
```

> 本章需要 embedding key。如果你跟着课程在 `.env` 里配了 `EMBEDDING_*` 三行，开箱即用。
> 没配的话看仓库顶层 README 的 ".env 配置"小节。

预期输出（关键对比 ch01）：

```
=== 问题 1: 公司在哪儿？ ===
[检索] top-3 片段:
  - 第1块 (cos=0.513) ## 一、关于公司       ← BoW 这里基本是 0
  - 第7块 (cos=0.420) ## 七、招聘
  - 第5块 (cos=0.402) ## 五、加盟政策
AI: 总部位于上海。

=== 问题 2: 你们卖的 vegan 选项有哪些？ ===
[检索] top-3 片段:
  - 第6块 (cos=0.599) ## 六、研发动态         ← "vegan" ≈ "植物基" 命中了
  - 第2块 (cos=0.581) ## 二、产品线
  - 第8块 (cos=0.541) ## 八、客户常见问题
AI: 目前有植物基羊角面包，正在研发中，预计 7 月推出。

=== 问题 3: 小麦粉是从哪里来的？ ===
[检索] top-3 片段:
  - 第3块 (cos=0.645) ## 三、原料采购         ← "从哪里来" ≈ "采购"
  ...
```

5 个问题都答对，且**相似度普遍 0.4-0.7**（ch01 是 0.1-0.3）——区分度肉眼可见提高了。

---

## 3. 逐行精讲

### 第 1 段：双 client

```python
chat_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["OPENAI_BASE_URL"],
)
MODEL = os.environ["MODEL"]

embedding_client = OpenAI(
    api_key=os.environ.get("EMBEDDING_API_KEY") or os.environ["OPENAI_API_KEY"],
    base_url=os.environ.get("EMBEDDING_BASE_URL") or os.environ["OPENAI_BASE_URL"],
)
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "BAAI/bge-m3")
```

两个 OpenAI client，分别给 "对话" 和 "向量化" 用。**它们可以是同一个 provider，也可以分开**——本课程默认：

- 对话：火山引擎 GLM-5.1（你 ch01 已经在用的）
- 向量化：硅基流动 BAAI/bge-m3（中文一流且免费额度够用）

如果你只有一把 OpenAI 官方 key，把它配给两边都行——`text-embedding-3-small` + `gpt-4o-mini`。

### 第 2 段：`embed()` 函数（本章核心）

```python
def embed(texts: list[str]) -> list[list[float]]:
    resp = embedding_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [d.embedding for d in resp.data]
```

**就这 4 行**。

注意 `input=texts` 是 **list**——一次可以传几十条文本，**API 会批量返回**。比挨个调便宜 + 快得多。

返回的 `resp.data` 是个 list，顺序跟你输入一致。`d.embedding` 是 `list[float]`，长度取决于模型（bge-m3 是 1024）。

### 第 3 段：余弦相似度改用稠密向量

```python
def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    return dot / (norm_a * norm_b)
```

跟 ch01 公式**一模一样**，类型从 `Counter` 换成 `list[float]`。

性能优化提示：生产环境会用 `numpy` 或 `torch` 的向量化操作，1024 维点积只要几微秒。我们用纯 Python 列表推导式也能跑——几千个 chunks 的检索时间在毫秒级。

### 第 4 段：query 也要 embed

```python
qv = embed([q])[0]
top = retrieve(qv, chunk_vectors, chunks, k=3)
```

**用户的问题也要走一遍 embedding 模型**。这是 RAG 工程里最容易被忽视的细节——你必须用**同一个 embedding 模型**给 query 和 chunks 编码，它们才在同一个向量空间。

如果你给 chunks 用了 bge-m3，但用 jina 或 openai 给 query 编码，**相似度完全失效**。

---

## 4. 为什么 bge-m3 这种模型管用？

简单解释 embedding 模型的训练原理（不必精通，但理解一下方便后续讲故事）：

1. **训练目标**：让模型学会"语义相近的文本 → 向量相近"
2. **训练数据**：海量"问题-答案"对、"同义改写"对、"相关段落"对
3. **训练手法**：对比学习——把正样本拉近、负样本推远
4. **最终效果**：模型变成一个 1024 维的"语义嗅探器"

**bge-m3** 是中文圈最广受好评的开源 embedding 模型之一（智源研究院出的）。其他常用模型：
- **text-embedding-3-small / -3-large**：OpenAI 官方
- **doubao-embedding**：字节火山
- **jina-embeddings-v3**：Jina AI
- **m3e-base**：摩尔线程

**你选谁影响检索质量**。bge-m3 在中文场景下基本是 SOTA。

---

## 5. 卡住了怎么办

### ❌ `KeyError: 'EMBEDDING_API_KEY'`（或类似）

`.env` 没配 embedding 那三行。最简单方案：注册硅基流动 (cloud.siliconflow.cn) 拿 sk-xxx，配上：

```
EMBEDDING_API_KEY=sk-...
EMBEDDING_BASE_URL=https://api.siliconflow.cn/v1
EMBEDDING_MODEL=BAAI/bge-m3
```

### ❌ `Model not found`

你的 provider 不一定支持 `BAAI/bge-m3`。硅基流动支持，火山的 ark/coding 不支持。换 provider 或者换 model 名。

### ❌ API 调用慢（每次都 1-2 秒）

正常。embedding 模型在 GPU 服务端有冷启动。第一次 调时如果模型没加载在显存里会很慢，后面快得多。

生产环境通常是**离线批量 embedding**（建库一次性）+ **在线 query embedding**（每次提问），前者可以慢，后者必须秒级。

### ❌ 想换 OpenAI 官方

把 .env 里 `EMBEDDING_*` 改成：

```
EMBEDDING_API_KEY=sk-你的OpenAI key
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
```

`text-embedding-3-small` 是 1536 维，价格 $0.02/1M tokens。完全适合教学。

### ❌ 想要更牛的中文模型

试试 `BAAI/bge-large-zh-v1.5`（专门为中文优化）或 `BAAI/bge-m3`（多语言但中文强）。硅基流动都有。

---

## 6. 思考题

### 题 1：直接对比 ch01 和 ch02 的检索质量

把 ch01 的 `main.py` 和 ch02 的 `main.py` **同时**对同一组问题跑（用 ch02 的 5 个"语义"问题）。把每个问题命中的 top-3 chunks 编号和分数列出来对比——你会肉眼看到 BoW 和 embedding 检索质量的差距。

### 题 2：试 "近义但极端" 的问题

试这些问题，看 embedding 能不能命中：

- "几年了" （→ "成立于 2018 年"）
- "你们是干啥的？" （→ "专注于欧式硬欧包..."）
- "有什么菜单" （→ "产品线"）

**目的**：感受 embedding 模型对"完全没有共同字"的近义查询的能力上限。

### 题 3：换 embedding 模型对比

注册 OpenAI 拿一把 key（或用你已有的），把 `.env` 换到 `text-embedding-3-small`，跑同样问题。**哪个 top-1 命中率高、哪个相似度更分明、哪个对中英混合更友好**——这是工程上选模型的真实评估方式。

---

## 这一章你学会了什么

- ✅ **真 embedding API** 的用法：批量 input、返回 `list[float]`、按顺序对应
- ✅ "对话 client" 和 "embedding client" 可以是两个不同 provider
- ✅ query 和 chunks **必须用同一个 embedding 模型**
- ✅ 余弦相似度算法跟 ch01 完全一样——**只是数据来源换了**
- ✅ 语义检索能解决 BoW 完全搞不定的"近义不同字"问题

**下一章 ch03**：到目前为止索引都在内存里。每次启动都要重新 embed 一遍——**慢、费钱**。下一章我们把索引**存到硬盘**，并支持多文档增量入库。

