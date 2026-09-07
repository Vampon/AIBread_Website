---
title: "第 0 章 · 最简的 LLM 调用"
slug: "bread-agent-00-hello"
excerpt: "让模型开始动手。最简的 LLM 调用，边读边运行配套 Python 代码。"
tag: "Bread 教程"
date: "2026-09-07"
cover: "/placeholders/cover-2.svg"
readMin: 25
kind: "tutorial"
series: "从零手写 AI 助手"
seriesSlug: "bread-ai-from-scratch"
course: "Bread Agent"
courseSlug: "agent"
courseOrder: 1
chapter: 0
seriesOrder: 1
difficulty: 1
codeLines: 30
---
## 1. 故事：我们到底要做什么

ChatGPT、文心一言、DeepSeek 网页版你都用过吧？你打字 → 它回答。

我们这门课的目标是用 Python **自己造一个**这样的东西。但造之前，我们得先理解：当你在 ChatGPT 输入框里按下回车，背后到底发生了什么？

答案极其简单：

> **你的程序把一个 list（列表）发送给了大模型 API，大模型返回一句话。**

仅此而已。这一章我们就把这件事做出来——什么 agent、什么循环、什么工具都没有，**纯纯一句话一句话地对话**。这是整门课所有后续章节的"地基"。

如果你连这章都没跑通，后面会越学越懵；如果跑通了，恭喜你已经迈过了最难的一步——**搞定环境**。

---

## 2. 跑起来：先看到效果，再讲原理

### 第一步：进入这一章的文件夹

在终端（Windows 是 PowerShell 或命令提示符）里，确保你已经 `cd` 到了仓库根目录 `bread-agent/`，然后：

```
cd ch00_hello
```

![image-20260523110434850](/tutorials/bread-ai-from-scratch/image-20260523110434850.png)

### 第二步：运行 main.py

```
python main.py
```

> 如果用的是 Anaconda 或者特定 Python 环境（例如老师让你用 `D:\anaconda3\envs\yutong\python.exe`），把上面命令的 `python` 替换成对应路径：
>
> ```
> D:\anaconda3\envs\xxxxx\python.exe main.py
> ```

![image-20260523110545412](/tutorials/bread-ai-from-scratch/image-20260523110545412.png)

### 第三步：看到 AI 的回答

正常应该看到一行类似这样的话：

```
你好！我是一个友好的中文助理，随时可以帮你解答各种问题、聊天或提供信息查询。请问有什么可以帮助你的吗？
```

具体内容每次不一样（这是大模型的特性）。**只要看到一行像样的中文回答，就算这一章跑通了。** 🎉

如果报错了，跳到本文末尾的"4. 卡住了怎么办"。

---

## 3. 逐行精讲：30 行代码到底在干嘛

打开 `main.py`，跟我一行一行读：

### 第 11 行：导入工具包

```python
import os
from dotenv import load_dotenv
from openai import OpenAI
```

- `os` 是 Python 自带的，用来读环境变量
- `dotenv` 让我们能读 `.env` 那个配置文件
- `OpenAI` 是 openai 这个包提供的客户端类，能帮我们调大模型 API

### 第 14 行：加载 .env

```python
load_dotenv()
```

这一行会自动找到上层目录的 `.env` 文件，把里面的 `OPENAI_API_KEY=xxx` 这些都注入到环境变量。**这就是为什么我们不需要把 key 写在代码里**。

### 第 19-22 行：创建客户端

```python
client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ["OPENAI_BASE_URL"],
)
```

`client` 这个对象就是我们调 LLM 的"遥控器"。`api_key` 是身份认证，`base_url` 决定你调的是 DeepSeek 还是 OpenAI 还是别的。

`os.environ["OPENAI_API_KEY"]` 的意思是"读名为 OPENAI_API_KEY 的环境变量"。如果 .env 没配好，这里就会报 `KeyError`。

### 第 23 行：选哪个模型

```python
MODEL = os.environ["MODEL"]
```

DeepSeek 的模型名叫 `deepseek-chat`；OpenAI 是 `gpt-4o-mini` 之类的。这个值也从 .env 来。

### 第 26 行：函数定义

```python
def chat(user_input: str) -> str:
```

`def` 是 Python 定义函数的关键字。这个函数叫 `chat`，接受一个字符串参数叫 `user_input`，返回一个字符串。

冒号 `:` 后面的内容（缩进的部分）就是函数体。

### 第 31-34 行：★ 全章最重要的代码

```python
messages = [
    {"role": "system", "content": "你是一个友好的中文助理。"},
    {"role": "user", "content": user_input},
]
```

**这就是"对话"的真面目**。它是一个 list（列表），里面装着两个 dict（字典）。

- 第一条：`role="system"`，是开发者（你）给 AI 的"角色设定"
- 第二条：`role="user"`，是真实用户输入的话

**所有的 LLM 对话都长这样**。ChatGPT 网页版背后传给后端的，就是这种 list。**你必须把这个结构刻进脑子里，后面 8 章全建立在它之上**。

### 第 36-39 行：调大模型

```python
response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
)
```

`client.chat.completions.create()` 这一长串就是"发请求"的标准写法。它接受两个关键参数：

- `model`：用哪个模型
- `messages`：上面那个 list

返回的 `response` 是一个对象，里面装着 AI 的回复，还有一些计费信息之类的。

### 第 42 行：取出回复

```python
return response.choices[0].message.content
```

为啥要这么绕？因为 API 设计上允许一次返回多个候选答案（`choices` 是一个 list），我们只取第 0 个。每个候选里有个 `message` 对象，`message.content` 就是 AI 说的话。

### 第 45-47 行：程序入口

```python
if __name__ == "__main__":
    reply = chat("用一句话介绍一下你自己。")
    print(reply)
```

`if __name__ == "__main__":` 是 Python 的惯用法，意思是"当这个文件被直接运行时，下面的代码才执行"。

我们调 `chat()`，把 AI 的回答存到 `reply`，然后打印。

---

## 卡住了怎么办（FAQ）

### ❌ `ModuleNotFoundError: No module named 'openai'` 或 `'dotenv'`

依赖没装。**回到 `bread-agent/` 根目录**（不是在 ch00_hello 里），跑：

```
pip install -r requirements.txt
```

### ❌ `KeyError: 'OPENAI_API_KEY'`

`.env` 文件没找到，或者里面没填 key。检查：

1. `.env` 文件**在 `bread-agent/` 根目录**，**不是**在 ch00_hello 里
2. 文件名是 `.env`（带前面那个点，没有 .txt 后缀）
3. 里面有一行 `OPENAI_API_KEY=sk-真实的key`
4. `OPENAI_BASE_URL` 和 `MODEL` 这两行也不能空

### ❌ `openai.AuthenticationError: Incorrect API key`

key 错了或复制时丢了字符。回 DeepSeek 控制台重新生成一个 key，**完整复制**（包括最前面的 `sk-`）粘贴到 .env。

### ❌ `openai.APIConnectionError` / `Connection error`

网络问题。如果你用 DeepSeek，国内宽带正常都能直连；如果用 OpenAI 官方接口，需要代理。

### ❌ 余额不足

去 https://platform.deepseek.com 充 5 块钱，能跑完整门课还有剩。

### ❌ 输出是乱码

Windows 命令提示符默认不是 UTF-8。试试用 PowerShell 而不是 cmd，或者运行前执行 `chcp 65001`。

---

## 5. 思考题（强烈建议做，做了才算学会）

### 题 1：改 system prompt
把 `main.py` 第 32 行 system 那条消息的 content 改成：

```python
{"role": "system", "content": "你只能用 emoji 回答，不许用文字。"},
```

再跑一次，看会发生什么。**理解：system prompt 对 AI 的行为有强约束力**。

### 题 2：手动多轮对话
把 messages 改成下面这样（你提前帮 AI 编了一段假对话历史）：

```python
messages = [
    {"role": "system", "content": "你是一个友好的中文助理。"},
    {"role": "user", "content": "你能记住我喜欢的颜色吗？我喜欢蓝色。"},
    {"role": "assistant", "content": "好的，我记住了，你喜欢蓝色。"},
    {"role": "user", "content": "我刚才说我喜欢什么颜色？"},
]
```

跑一次。AI 必须正确说出"蓝色"。**理解：所谓"多轮对话"，就是 messages 越来越长**。ch03 我们会让这个过程自动化。

### 题 3：切换 provider
如果你有其他 LLM 厂商的 key（Qwen、Moonshot、智谱、本地 Ollama 都行），改 `.env` 里的 `OPENAI_BASE_URL` 和 `MODEL`，跑一遍。**理解：因为 OpenAI 接口已经成为事实标准，我们的代码不需要任何改动就能切到别家**。

---

## 这一章你学会了什么

- ✅ 一段 LLM 对话，本质就是一个 list of dict
- ✅ 三种 role：system / user / assistant
- ✅ 用 `client.chat.completions.create()` 发请求
- ✅ 用 `response.choices[0].message.content` 取回复

**下一章 ch01**：让 AI 不再只是"动嘴说话"，而是**会调用我们写的 Python 函数**。

