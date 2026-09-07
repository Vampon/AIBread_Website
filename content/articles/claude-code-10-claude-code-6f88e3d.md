---
title: "10分钟装好Claude Code，说第一句话"
slug: claude-code-10-claude-code-6f88e3d
excerpt: "不是因为难，是因为我一开始连从哪里开始都不知道——要账号？要付钱吗？要先装什么前置软件？"
tag: "Claude Code"
date: "2026-04-23"
cover: "/placeholders/cover-2.svg"
readMin: 7
importedFrom: "3-Claude code系列/重写/02_10分钟装好Claude Code，说第一句话.md"
---
> 系列：Claude Code从入门到精通 · 第2篇  
> 适合人群：准备开始用Claude Code的你

---

## 安装之前，先做一件事

去年我第一次装Claude Code，卡了半小时。

不是因为难，是因为我一开始连从哪里开始都不知道——要账号？要付钱吗？要先装什么前置软件？

所以这篇文章，我把这些全部说清楚，让你一次装好。

先做一件事：确认你的电脑是什么系统。

- **Mac** → 用第一种方式
- **Windows** → 用第二种方式
- **Linux** → 跟Mac一样

好，开始。

---

## 第一步：选一种安装方式

### Mac / Linux 用户

打开终端（Mac上叫Terminal，或者你也可以用iTerm2）。

如果你不知道怎么打开终端：Mac左上角点放大镜图标搜索"Terminal"，回车就开了。

然后把这行命令粘贴进去，回车：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

脚本会自动检测你的系统、下载程序、配置好路径。装完输入 `claude` 就能启动。

如果你平时用Homebrew（Mac上的包管理器），也可以用这个：

```bash
brew install --cask claude-code
```

两个方式效果一样，选你顺手的就行。

---

### Windows 用户

Windows多一个前置步骤，需要先装 Git for Windows。

**第一步：装 Git for Windows**

打开浏览器，搜索"Git for Windows"，进官网下载安装包。安装时一路默认选项就行，它会顺带安装一个叫"Git Bash"的终端工具。

或者，如果你有PowerShell，也可以运行：
```
winget install Git.Git
```

**第二步：装 Claude Code**

打开PowerShell或刚才装好的Git Bash，运行：
```
winget install Anthropic.ClaudeCode
```

**第三步：验证一下**

重新打开终端，输入：
```
claude --version
```

看到版本号，说明装好了。

> ⚠️ 注意：Windows用户尽量用Git Bash或PowerShell，不要用CMD（命令提示符），可能会出问题。

---

## 第二步：注册账号并登录

装好了之后，在终端输入 `claude`，首次启动会自动打开浏览器，让你登录Anthropic账号。

如果你还没有账号：点"注册"，用邮箱注册一个就行。注册是免费的，几分钟搞定。

登录成功后，回到终端，Claude Code的交互界面就出来了。

---

## 第三步：选一个付费方案（不用急着升级）

Claude Code有三个方案：

| 方案 | 月费 | 适合谁 |
|------|------|--------|
| Pro | $20/月 | 个人学习、轻度使用，先从这个开始 |
| Max 5x | $100/月 | 每天用超过2小时，Pro会触到用量上限 |
| Max 20x | $200/月 | 团队使用、商业项目 |

**我的建议：先从Pro开始。**

真的用起来之后，你自然知道够不够。很多人的路径是：第一周觉得Pro够了，第二周开始"上瘾"然后升Max。不用提前花钱。

---

## 第四步：选一个用法（推荐终端）

装好之后，其实有五种方式使用Claude Code：

- **终端CLI**：最原生的体验，功能最完整，直接在终端输入 `claude`
- **VS Code扩展**：在VS Code侧边栏运行，适合习惯VS Code的开发者
- **Desktop App**：独立桌面应用，不需要打开终端，更适合不习惯命令行的人
- **Web版**：浏览器直接访问 claude.ai/code，无需安装
- **JetBrains插件**：IntelliJ IDEA、WebStorm等JetBrains IDE用户专属

**我推荐先从终端CLI开始**，哪怕你之后会用VS Code或Desktop App，先在终端把它的完整能力摸熟，之后怎么切换都方便。终端才是它的完全体。

---

## 第五步：发出你的第一句话

现在，打开终端，进入一个空文件夹，启动Claude Code：

```bash
mkdir ~/my-first-test && cd ~/my-first-test
claude
```

然后输入这个：

```
创建一个简单的HTML页面，显示"你好，Claude Code！"，用好看的CSS样式。
```

你会看到Claude Code开始工作：它在你的目录里创建了一个HTML文件，写入了完整的代码。整个过程大约10到30秒。

做完之后，用浏览器打开这个文件看看效果：

```bash
# Mac：
open index.html

# Windows：
start index.html
```

如果你能看到一个带样式的页面，恭喜——一切正常。

---

## 国内用户特别提示：网络问题怎么解决

Claude Code需要连接Anthropic的服务器。如果你在国内，可能连不上，需要配代理。

在终端里运行这两行（把地址换成你自己的代理）：

```bash
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
```

建议把这两行加到你的shell配置文件（Mac/Linux是 `~/.zshrc` 或 `~/.bashrc`，Windows的Git Bash是 `~/.bashrc`），这样每次打开终端都会自动生效，不用每次手动输入。

---

## 装好了，对一下清单

| 检查项 | 命令 | 预期结果 |
|--------|------|---------|
| CLI可用 | `claude --version` | 显示版本号 |
| 账号已登录 | 直接运行 `claude` | 不再要求登录 |
| 能创建文件 | 让Claude创建一个测试文件 | 文件出现在当前目录 |
| 能运行命令 | 让它运行 `ls` 或 `dir` | 返回目录内容 |

全部通过？可以开干了。

---

## 遇到问题了？

**装完打 `claude` 没反应**：终端关掉重开一次，再试。

**Permission denied 报错**：Mac/Linux用户不要用 `sudo`，试试这个：
```bash
mkdir -p ~/.local/bin
curl -fsSL https://claude.ai/install.sh | bash
```

**怎么更新**：Claude Code更新很频繁，几乎每周都有新功能。手动更新就重新跑一遍安装命令：
```bash
# Mac/Linux：
curl -fsSL https://claude.ai/install.sh | bash

# Windows：
winget upgrade Anthropic.ClaudeCode
```

建议两周更新一次，新版本不只是修bug，经常带来明显的能力提升。

---

## 下一篇预告

装好了，账号也有了，第一次对话也跑通了。

下一篇，我们做一个**真实的小项目**——从零做一个AI新闻聚合工具，体验完整的"对话式编程"是怎么一回事。

---

*AI面包君 · Claude Code系列第2篇*  
*下篇：《用Claude Code做你的第一个项目》*


# 第一步：选一种安装方式

### Mac / Linux 用户

打开终端（Mac 上叫 Terminal，也可以用 iTerm2）。

如果你不知道怎么打开终端：Mac 左上角点放大镜图标搜索 "Terminal"，回车即可打开。

**官方推荐一键安装命令（最新版）：**

```
curl -fsSL https://claude.ai/claude-code/install.sh | bash
```

脚本会自动检测系统、下载程序、配置环境变量。安装完成后，直接输入 `claude-code` 即可启动。

------

**如果你习惯用 Homebrew（Mac 包管理器）**，也可以用这个命令安装：

```
brew install anthropic/brew/claude-code
```

两种方式效果完全一致，选择你熟悉的一种即可。

------

### Windows 用户（完整安装步骤）

⚠️ 重要：Claude Code 在 Windows 上依赖 Git Bash 运行，**必须先安装 Git**。

#### 安装 Git for Windows（必需）

##### 1.1 下载 Git

访问 Git 官网下载页面：

点击下载最新的 64 位版本。

##### 1.2 安装 Git

运行下载的安装文件（如 `Git-2.51.2-64-bit.exe`）

全程使用默认选项，一路点击 **Next**

确保在 **“调整您的 PATH 环境”** 步骤中选择：

✅ **"Git from the command line and also from 3rd-party software"**（默认选项）

点击 **安装** 开始安装

完成后点击 **完成**

##### 1.3 验证 Git 安装

按 `Win + R`

输入 `cmd`，按回车

在命令提示符中输入：

```
git --version
```

✅ 如果显示类似 `git version 2.51.2.windows.1`，说明安装成功。

------

#### 安装 Claude Code

##### 2.1 以管理员身份打开 PowerShell

按下 `Win` 键

输入 `powershell`

右键单击 **Windows PowerShell**

选择 **以管理员身份运行**

##### 2.2 运行安装命令

在 PowerShell 中复制并运行以下命令：

```
irm https://claude.ai/install.ps1 | iex
```

##### 2.3 等待安装完成

安装过程会显示详细信息，完成后会显示：

```
✅ Installation complete!
Version: 2.0.34
Location: C:\Users\你的用户名\.local\bin\claude.exe
```

------

#### 配置环境变量（添加 PATH）

安装完成后需要将 Claude 添加到系统 PATH，这样才能在任何位置运行 `claude` 命令。

##### 图形界面操作（新手）

1. 按 `Win + R`，输入 `sysdm.cpl`，按回车

2. 点击 **高级** 标签

3. 点击 **环境变量** 按钮

4. 在 **用户变量** 区域（窗口上半部分），找到并选中 **Path**

5. 点击 **编辑** → **新建**

6. 输入：

   ```
   C:\Users\你的用户名\.local\bin
   ```

   ⚠️ 请将 `你的用户名 `替换为实际的 Windows 用户名

7. 依次点击 **确定** 关闭所有窗口

------

#### 安装完成验证

**关闭所有终端 / 命令行窗口，重新打开**，输入：

```
claude --version
```

显示如下即表示安装成功。
