---
title: "第 5 章 · SQLite MCP server（终章实战）"
slug: "bread-mcp-05-sqlite_server"
excerpt: "让工具即插即用。SQLite MCP server（终章实战），边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 60
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread MCP"
courseSlug: "mcp"
courseOrder: 2
chapter: 5
seriesOrder: 15
difficulty: 4
codeLines: 350
---
## 1. 故事：让 AI 能查数据库

老板问你："工程部工资最高的人是谁，他在做什么项目？"

不用 AI 你得：
1. 打开数据库管理工具
2. 写 SQL `SELECT * FROM employees WHERE department='工程部' ORDER BY salary DESC LIMIT 1;`
3. 拿到他的 id
4. 再写 SQL `SELECT * FROM projects WHERE owner_id=...;`
5. 整理成中文回答

如果有个 agent + SQLite MCP server，你只用问：

> "工程部工资最高的是谁，他在做什么项目？"

agent 自己会：
1. 调 `db_list_tables` 看有什么表
2. 调 `db_describe_table` 看 employees / projects 结构
3. 写 SQL 调 `db_query`
4. 用中文给你答案

**这是 MCP 在企业里最赚钱的用法**——把已有的数据库 / API / 内部系统包装成 MCP server，agent 立刻就能上手。

本章我们提供 4 个数据库工具：

| 工具 | 用途 |
|---|---|
| `db_list_tables` | 列出所有表名 |
| `db_describe_table(table)` | 看表结构 |
| `db_query(sql)` | SELECT 查询 |
| `db_execute(sql)` | INSERT/UPDATE/DELETE/CREATE |

并预置一个示例数据库 `demo.db`（员工 + 项目两张表）。

---

## 2. 跑起来

```
cd ch05_sqlite_server
python main.py
```

第一次启动时 server 会自动建 `demo.db` 并塞 5 个员工 + 3 个项目作为示例数据。

试这一组对话：

```
你 > 数据库里有哪些表？
  [step 0] db_list_tables({})
  [step 0] -> employees\nprojects
AI > 数据库里有 2 张表：employees（员工表）和 projects（项目表）。

你 > 工程部工资最高的是谁？
  [step 0] db_describe_table(employees)
  [step 0] -> 列名  类型  非空  默认值  主键 ...
  [step 1] db_query(SELECT name, salary FROM employees WHERE department='工程部' ORDER BY salary DESC LIMIT 1)
  [step 1] -> name salary\n王五  32000.0
AI > 工程部工资最高的是 王五，月薪 32000。

你 > 他在做什么项目？
  [step 0] db_query(SELECT p.* FROM projects p JOIN employees e ON p.owner_id=e.id WHERE e.name='王五')
  [step 0] -> id  name  owner_id  status\n3  数据中台  3  in_progress
AI > 王五负责"数据中台"项目，当前状态是进行中（in_progress）。
```

**关键观察**：

- 第二轮 agent **先看表结构再写 SQL**——这是 SYSTEM_PROMPT 引导的好习惯
- 第三轮 agent **自己写了 JOIN**——它从历史对话知道"他"指王五

试完后 `demo.db` 留在目录里。你可以 `del demo.db` 让下次启动重置。

---

## 3. 逐行精讲

### `server.py` 第 1 段：可参数化的 db 路径

```python
DB_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "demo.db"
```

启动时可以传 db 文件路径。这是**生产级 MCP server 的常见姿势**——参数化配置，让同一份代码服务不同的数据库。

### `server.py` 第 2 段：示例数据自动注入

```python
def init_demo_db_if_needed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    if cur.fetchone() is None:
        cur.executescript("""CREATE TABLE employees ...""")
        conn.commit()
    conn.close()
```

如果数据库是空的，就建表并塞示例数据。**让学员开箱有得查**，不用自己造数据。

### `server.py` 第 3 段：连接管理

```python
def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
```

每次工具调用**新开一个连接、用完关闭**。这跟"连接池"理念相反，但对一个简单 MCP server 已经够用——SQLite 是文件锁的，并发不强。

`row_factory = sqlite3.Row` 让查询结果支持按列名访问（`row["name"]` 而不是 `row[0]`）。

### `server.py` 第 4 段：`db_query` 的安全防线

```python
def tool_db_query(sql: str) -> str:
    s = sql.strip().lstrip("(").lower()
    if not (s.startswith("select") or s.startswith("with")):
        return "db_query 只接受 SELECT 或 WITH 开头的查询；改用 db_execute"
    ...
    rows = cur.fetchmany(MAX_ROWS + 1)
    truncated = len(rows) > MAX_ROWS
    rows = rows[:MAX_ROWS]
```

**两道防线**：
1. **只允许 SELECT/WITH** —— 防止 LLM 在"查询"工具里偷偷写 DROP TABLE
2. **结果截断在 100 行** —— 防 SELECT \* 把 LLM 上下文撑爆

**生产环境还要**：
- 参数化查询防 SQL 注入（教学版没做，所有 SQL 都是 LLM 直接生成）
- 角色权限校验（哪些表允许 SELECT、哪些禁止）
- 超时、并发限制
- 审计日志

这些都是从教学版到生产 MCP server 之间的工程化工作。

### `agent.py`：system prompt 是关键

```python
SYSTEM_PROMPT = """你是一个数据分析助手...

工作流程建议：
- 不知道有什么表 → 先 db_list_tables
- 不知道表结构 → db_describe_table
- 看数据 → db_query (SELECT)
- 改数据 → 必须先和用户确认，再用 db_execute（一次只做一个改动）
...
"""
```

**这段 prompt 决定了 agent 的"工作风格"**：
- 不会跳过元数据探索一上来就瞎写 SQL
- 改数据前会先问用户
- 用中文给洞察而不是只贴 TSV

这就是 MCP server 之外、agent 一侧需要做的**业务侧调教**。

### 把 SQL 显式打日志

```python
arg_preview = args.get("sql") or args.get("table") or json.dumps(args, ensure_ascii=False)
print(f"  [step {step}] {name}({arg_preview[:120]})")
```

让学员**亲眼看见 agent 编了什么 SQL**——这非常重要。看到 agent 拼了一个三表 JOIN 的瞬间会震撼。

---

## 4. 卡住了怎么办

### ❌ `sqlite3.OperationalError: database is locked`

并发问题。一般是有别的进程占着 demo.db。关掉所有打开 demo.db 的工具，或者改个名重试。

### ❌ agent 写的 SQL 报错

正常——LLM 不是数据库专家，第一次会写错。我们的 server 把错误以 `isError=true` 回给 agent，**agent 下一轮通常会自己改对**。你可以观察这个"边写边改"过程，比直接给对的 SQL 更有教学价值。

### ❌ agent 想 DROP TABLE

它会调 `db_execute` 而不是 `db_query`。**这就是为什么 SYSTEM_PROMPT 要写"改数据前必须先和用户确认"**——但目前的实现是建议性的，LLM 不一定遵守。生产环境得在 server 端硬卡（白名单 SQL）或用 MCP 钩子做权限询问。

### ❌ demo.db 数据被改乱了

删除文件即可：

```
del demo.db    # Windows
rm demo.db     # macOS/Linux
```

下次启动 server 会自动建一份新的。

### ❌ 想换成自己的数据库

启动时传路径：

```python
server_cmd = [sys.executable, "server.py", "/path/to/your.db"]
```

任何 SQLite 数据库都能用。如果是 MySQL/PostgreSQL，把 `sqlite3` 换成 `pymysql` / `psycopg2`，TOOL_REGISTRY 里的实现改一下连接代码即可——**协议层完全不用动**。

---

## 5. 思考题

### 题 1：参数化查询防注入

当前 `db_query(sql)` 是把 SQL 字符串原样执行——LLM 写"SELECT \* FROM users WHERE name='张三' OR 1=1"会全表查出。改成支持参数化：

```python
def tool_db_query(sql: str, params: list | None = None) -> str:
    ...
    cur = conn.execute(sql, params or [])
```

修改 inputSchema 让模型知道可以传 params。让模型用 `?` 占位符 + 单独 params。这是工业级数据查询工具的标准做法。

### 题 2：表级权限白名单

加一个启动参数 `--readonly-tables=employees,projects` —— 只允许查这两张表，其他全部拒绝。在 `db_query` 里用一个简单的正则匹配 `FROM xxx` 部分校验。

**思考**：LLM 可以构造很 tricky 的 SQL 绕过简单正则。你能让校验做得多严？

### 题 3：暴露 resources

MCP 不只有工具，还有"资源"。把 `employees` 表的整表内容暴露成一个 resource（URI `sqlite://demo.db/employees`），agent 可以"读"这个资源而不是写 SQL。

这就是 `pi-main` 之类 agent 接 RAG 数据源的姿势。**思考一下：什么样的数据适合做 resource，什么适合做 tool？**

### 题 4：接其他真实数据库

把这个 server 改造成连一个真实的 MySQL / PostgreSQL（用 `pymysql` 或 `psycopg2`）。**不需要改 agent 一行代码**——这就是 MCP 的力量。

---

## 6. 写在课程的最后

你现在已经掌握的：

- ✅ **JSON-RPC 2.0**（ch00）
- ✅ **MCP server 的协议骨架**（ch01）
- ✅ **MCP client 类抽象**（ch02）
- ✅ **多工具 server + 错误处理**（ch03）
- ✅ **接入 LLM agent 的 schema 翻译**（ch04）
- ✅ **真实业务 MCP server**（ch05）

你能做的事：
- 给任何已有系统包一层 MCP（数据库、API、内部工具）
- 让你的 Bread Agent 立刻获得新能力
- 看懂 Cursor / Claude Code 等产品的 MCP 集成
- 在工作里推动"工具协议化"的工程改造

**接下来的方向建议**：

1. **加 HTTP/SSE transport** —— 让 MCP server 能跨机器部署
2. **接入官方 MCP 生态** —— 试用 `@modelcontextprotocol/server-*` 系列
3. **写一个领域 MCP server** —— 你工作场景里那个最痛的内部系统，包一层 MCP 试试
4. **学下一门课**：Bread RAG（搭建企业知识库）

祝玩得开心。

> —— Bread MCP 课程 · 知识星球

