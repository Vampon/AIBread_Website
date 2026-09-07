---
title: "MCP：让 Agent 能接\"任何工具\"的通用协议"
slug: agent-mcp-agent-79a98be
excerpt: "前面讲了 Function Calling——大模型怎么\"表达\"要调用工具。"
tag: "AI Agent"
date: "2026-06-02"
cover: "/placeholders/cover-3.svg"
readMin: 4
importedFrom: "5-Agent/06-MCP是什么.md"
---
前面讲了 Function Calling——大模型怎么"表达"要调用工具。

但有一个问题没解决：**每个工具都有自己的接口格式。** 你想让 Agent 同时用 10 个工具，就得适配 10 种不同的接口。

**MCP（Model Context Protocol）就是解决这个问题的——给工具提供统一的接口标准。**

> 💡 更详细的 MCP 科普，请参考我之前写的《MCP：AI 与世界的"通用接口"》（在 1-AI认知/AI基础认知 目录下）。本篇聚焦 Agent 开发场景。

---

## 📖 一句话定义

**MCP（模型上下文协议）是一个开放协议，定义了 AI 模型如何与外部工具和数据源交互的统一标准。** 它让任何 AI 模型都能用同一种方式调用任何 MCP 兼容的工具。

---

## 🔌 一个精妙的类比：USB 接口

**USB 出现之前：**
- 鼠标用 PS/2 接口
- 键盘用 PS/2 接口（跟鼠标还不一样）
- 打印机用并口
- 外置硬盘用 FireWire
- 每个设备配一条专用线，电脑后面一堆不同的口

**USB 出现之后：**
- 所有设备都用 USB
- 电脑只要有一个 USB 口，什么都能接
- 即插即用

| 硬件世界 | AI 世界 |
|---------|---------|
| USB 出现前：每种设备不同接口 | MCP 出现前：每个工具不同格式 |
| USB：统一接口标准 | MCP：统一工具协议 |
| 即插即用 | 工具接入即用 |

**MCP 就是 AI 世界的 USB 接口。**

> **🖼️ 图片建议：** 一张"USB 类比"对比图。左侧"没有 MCP"：大模型和多个工具之间用不同颜色/形状的线连接，每条线标注不同格式（"天气 API 用 REST""数据库用 SQL""文件用 POSIX"），大模型满头大汗。右侧"有 MCP"：所有工具都通过统一的"MCP 接口层"连接大模型，所有线同样颜色，标注"统一协议，即插即用"。风格：科技信息图。

---

## 🎯 MCP 解决了什么问题？

没有 MCP 时，一个 Agent 想用多个工具：

```python
# 每个工具单独适配，格式各不相同
# 天气工具
def get_weather(city): ...
# 数据库工具
def query_db(sql): ...
# 文件工具
def read_file(path): ...
# 搜索工具
def web_search(query): ...

# Agent 需要知道每个工具的调用方式
# 换一个工具就要改代码
```

**有 MCP 后：**

```python
# 所有 MCP 兼容的工具，用统一的方式调用
# Agent 只需要知道"MCP 协议"
# 新工具只要符合 MCP 标准，接入即用

mcp_client.call_tool("get_weather", {"city": "北京"})
mcp_client.call_tool("query_db", {"sql": "SELECT ..."})
mcp_client.call_tool("read_file", {"path": "/data/report.pdf"})
# 同样的调用方式！
```

---

## 🏗️ MCP 的架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  MCP Host   │     │ MCP Client  │     │ MCP Server  │
│  (你的 App)  │────→│ (协议客户端)  │────→│ (工具提供方) │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                    ┌─────────┼─────────┐
                                    ↓         ↓         ↓
                                 天气工具   数据库    文件系统
```

| 角色 | 是什么 | 类比 |
|------|--------|------|
| **MCP Host** | 你的 AI 应用（如 Claude Code） | 电脑 |
| **MCP Client** | 协议客户端，负责跟 Server 通信 | USB 控制器 |
| **MCP Server** | 工具提供方，暴露具体功能 | USB 设备（U 盘、鼠标、键盘） |

**Claude Code 本身就是 MCP Host。** 你在 Claude Code 里配置 MCP Server，它就能用那些工具。

---

## 🔧 Agent 开发中的 MCP

### Claude Code 配置 MCP 示例

```json
// .claude/mcp.json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-weather"]
    },
    "database": {
      "command": "npx", 
      "args": ["-y", "mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

**配置完成后，Claude Code 自动发现这些工具，自动在需要时调用。**

### 开发自己的 MCP Server

MCP Server 的核心很简单——就是实现三个能力：

| 能力 | 做什么 | 对应 |
|------|--------|------|
| **List Tools** | 告诉 Agent"我有哪些工具" | USB 设备报告自己是什么 |
| **Call Tool** | 执行具体的工具调用 | USB 设备执行功能 |
| **List Resources** | 告诉 Agent"我有哪些数据" | 暴露可读取的资源 |

---

## 🆚 MCP vs Function Calling

这两个经常被搞混：

| | Function Calling | MCP |
|---|---|---|
| 是什么 | API 层面的协议 | 工具层面的协议 |
| 谁定义的 | OpenAI/Anthropic 各自定义 | Anthropic 开源，跨模型 |
| 解决的问题 | 大模型怎么"表达"调用工具 | 工具怎么"统一接入" |
| 关系 | 底层机制 | 上层标准 |
| 类比 | 电话怎么拨号 | 所有电话用同样的插头 |

**Function Calling 定义了"大模型说话的方式"。MCP 定义了"工具接入的接口"。** 两者是不同层面的东西，互补。

---

## 💡 总结

- **MCP = AI 世界的 USB 接口，让任何工具都能用统一方式接入 Agent**
- 没有 MCP：每个工具单独适配。有 MCP：接入即用
- Claude Code 原生支持 MCP，配置 JSON 就能扩展 Agent 能力
- MCP Server 三要素：List Tools、Call Tool、List Resources
- MCP 和 Function Calling 是不同层面的东西——前者统一工具接口，后者统一调用协议

---

*下篇预告：Skill——比 Tool 更高一层的"Agent 能力模块"*

---

**面包君** 🍞
*比你多懂一点的朋友*
