/**
 * 仿真 Claude Code 的 5 个核心场景 + 兜底。
 *
 * 添加新场景：在 scenarios 数组追加一项即可，parser 会按数组顺序匹配。
 * 触发优先级：slash > keywords。
 */

import type { Scenario, Phase } from "@/lib/cc/types";

// ---- 0. /help（onboarding 兜底也复用它） -------------------------------

const helpPhases: Phase[] = [
  {
    kind: "system-note",
    tone: "info",
    delay: 200,
    explainId: "slash-commands",
    text: `可用命令：
- /help          列出命令（就是这个）
- /init          扫描项目并生成 CLAUDE.md
- /compact       压缩上下文，腾出 token
- /plan          plan 模式：只列方案不动手
- /cost          看本次会话花了多少 token / 钱
- /doctor        一键环境体检
- /resume        恢复历史会话
- /scan-todo     派子代理扫 TODO
- /big-task      拆分大任务（TodoWrite 演示）
- /notion-weekly 用 MCP 查 Notion 周报
- /cleanup-tmp   触发 hooks 拦截危险命令

你也可以直接对我说话，比如：
- 看一下 README 的第一行
- 帮我删掉 dist 目录
- 帮我 review 一下改动（自动加载 code-review skill）
- 帮我重构 src/auth 模块（plan 模式触发）
- 实现一个完整的搜索功能（自动 TodoWrite 拆分）
- 为什么你说话总爱用厨房做类比？`,
  },
];

const helpScenario: Scenario = {
  id: "help",
  title: "/help —— 看看能干啥",
  triggers: { slash: ["/help"] },
  defaultExplainId: "slash-commands",
  phases: helpPhases,
};

// ---- 1. read-readme：经典 Tool Use 循环 -------------------------------

const README_FIRST_LINE = "# 我的小工具";
const README_SNIPPET = `# 我的小工具

这是一个示例项目，用来演示 Claude Code 怎么读文件、改代码、跑命令。

## 用法

\`\`\`bash
npm install
npm run dev
\`\`\`

…（共 11 行，已截断）`;

const readReadmeScenario: Scenario = {
  id: "read-readme",
  title: "看一下 README",
  triggers: {
    keywords: [/README/i, /读.*第一行/, /看.*第一行/, /readme/i],
  },
  defaultExplainId: "tool-use-loop",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "tool-use-loop",
      text: "你想看 README 第一行 → 我自己读不到文件，得调用 Read 工具。",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { file_path: "README.md" },
      output: README_SNIPPET,
      truncated: true,
      delay: 900,
      explainId: "tool-use-loop",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "tool-use-loop",
      text: `README 的第一行是：**${README_FIRST_LINE}**\n\n这是一个示例项目的标题。要看完整内容你可以展开上面那个工具调用块。`,
    },
  ],
};

// ---- 2. delete-dist：权限弹窗（含分支） -------------------------------

const deleteDistScenario: Scenario = {
  id: "delete-dist",
  title: "删掉 dist 目录",
  triggers: {
    slash: ["/rm-dist"],
    keywords: [/删.*dist/, /rm.*dist/i, /清.*dist/, /删除.*构建/],
  },
  defaultExplainId: "permission-system",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "permission-system",
      text: "这会改你的文件系统（删 23 个文件），属于「动手」操作，我得先请权限。",
    },
    {
      kind: "permission-prompt",
      tool: "Bash",
      reason: "执行 `rm -rf dist`，会删除 3 个直接子项 / 共 23 个文件",
      explainId: "permission-system",
      onAllow: [
        {
          kind: "tool-call",
          tool: "Bash",
          input: { command: "rm -rf dist" },
          output: "removed 'dist/index.js'\nremoved 'dist/index.js.map'\nremoved 'dist/chunks.js'\nremoved 'dist/'",
          delay: 800,
          explainId: "permission-system",
        },
        { kind: "fs-mutation", op: "delete", path: "dist" },
        {
          kind: "assistant-reply",
          delay: 600,
          explainId: "permission-system",
          text: "搞定。`dist` 目录已删除，下次 `npm run build` 会重新生成。",
        },
      ],
      onDeny: [
        {
          kind: "system-note",
          tone: "warn",
          delay: 300,
          text: "权限被拒绝。我不会执行 rm -rf。",
          explainId: "permission-system",
        },
        {
          kind: "assistant-reply",
          delay: 600,
          explainId: "permission-system",
          text: "好的，我不动文件系统。如果你只是想腾点空间，可以自己在终端跑 `rm -rf dist`，或者下次允许我「本会话」权限就不用每次问你。",
        },
      ],
    },
  ],
};

// ---- 3. /compact：上下文压缩 -----------------------------------------

const compactScenario: Scenario = {
  id: "compact",
  title: "/compact —— 把桌面收干净",
  triggers: { slash: ["/compact"] },
  defaultExplainId: "context-window",
  preset: { tokenUsedPct: 78 }, // 演示前先把进度条拉到高位
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 200,
      text: "正在分析对话历史…",
      explainId: "context-window",
    },
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "context-window",
      text: "桌面已用 78%，再继续就要顶到天花板了。我把前面的对话压成摘要。",
    },
    {
      kind: "context-effect",
      before: 78,
      after: 22,
      summaryText:
        "**会话摘要（自动生成）**：用户在搭一个 Next.js 项目，问过 README、想清理 dist、关心 Claude Code 的工作原理。已读文件：README.md、package.json。",
      explainId: "context-window",
      delay: 900,
    },
    {
      kind: "assistant-reply",
      delay: 600,
      explainId: "context-window",
      text: "已把前面的对话压成 1 段摘要。token 占用从 **78%** 降到 **22%**，可以继续聊了。",
    },
  ],
};

// ---- 4. /init：扫项目 + 写 CLAUDE.md -----------------------------------

const initScenario: Scenario = {
  id: "init",
  title: "/init —— 给项目写个家规",
  triggers: {
    slash: ["/init"],
    keywords: [/为什么.*厨房/, /为什么.*类比/, /为什么.*面包/, /为什么.*烤箱/],
  },
  defaultExplainId: "claude-md-memory",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 500,
      explainId: "claude-md-memory",
      text: "我先扫一下项目结构，看你都有什么。",
    },
    {
      kind: "tool-call",
      tool: "Glob",
      input: { pattern: "**/*" },
      output: "my-tool/README.md\nmy-tool/package.json\nmy-tool/src/index.ts\nmy-tool/src/note.md\nmy-tool/dist/index.js\nmy-tool/dist/index.js.map\nmy-tool/dist/chunks.js",
      delay: 700,
      explainId: "tool-use-loop",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { file_path: "package.json" },
      output: `{\n  "name": "my-tool",\n  "scripts": { "dev": "next dev", "build": "next build" }\n}`,
      delay: 700,
      explainId: "tool-use-loop",
    },
    {
      kind: "memory-load",
      path: "CLAUDE.md",
      preview: `# my-tool · 项目说明

这是一个 Next.js 项目。

## 命令
- npm run dev：起开发服
- npm run build：生产构建

## 约定
- 主要源码在 src/
- 不要直接改 dist/（自动生成）`,
      explainId: "claude-md-memory",
      delay: 900,
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "claude-md-memory",
      text: "已生成 **CLAUDE.md** 草稿（左边那块）。下次你在这个项目里启动我，我会自动读它，相当于每次都先看一眼贴在冰箱上的家规。你可以直接改这个文件，我会按改完的版本来。",
    },
  ],
};

// ---- 5. scan-todo：派子代理扫 src ----------------------------------------

const scanTodoScenario: Scenario = {
  id: "scan-todo",
  title: "扫描 TODO（派子代理）",
  triggers: {
    slash: ["/scan-todo"],
    keywords: [/扫.*TODO/i, /找.*所有.*TODO/i, /列.*TODO/i],
  },
  defaultExplainId: "subagent",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "subagent",
      text: "src 下文件很多，我直接 Read 会把桌面塞满。**派一个 scanner 子代理**去做这件事——它有自己独立的桌面。",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 400,
      explainId: "subagent",
      text: "→ 启动子代理 scanner（允许工具：Glob, Grep）",
    },
    {
      kind: "tool-call",
      tool: "Glob",
      input: { pattern: "src/**/*.{ts,tsx}" },
      output: "src/index.ts\nsrc/note.md\n（共 47 个文件）",
      delay: 700,
      truncated: true,
      explainId: "subagent",
    },
    {
      kind: "tool-call",
      tool: "Grep",
      input: { pattern: "TODO|FIXME", path: "src" },
      output:
        "src/index.ts:3:// TODO: 加 i18n\nsrc/note.md:7:- TODO 加更多笔记\n（共 12 个匹配）",
      delay: 700,
      truncated: true,
      explainId: "subagent",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 400,
      explainId: "subagent",
      text: "← scanner 完成，回主代理（只回摘要，原始内容已丢弃）",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "subagent",
      text:
        "扫完了。在 47 个 ts/tsx 文件里找到 **12 个 TODO**，主要集中在 `src/index.ts` 和 `src/note.md`。\n\n如果想看具体每条，告诉我「列出来」。",
    },
  ],
};

// ---- 6. mcp-notion：MCP 工具调用 -----------------------------------------

const mcpNotionScenario: Scenario = {
  id: "mcp-notion",
  title: "MCP 调 Notion 找周报",
  triggers: {
    slash: ["/notion-weekly"],
    keywords: [/Notion.*周报/, /Notion.*查/, /周报.*Notion/, /我的周报/],
  },
  defaultExplainId: "mcp-integration",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 300,
      explainId: "mcp-integration",
      text: "检测到 MCP server `notion` 已加载。可用工具：search / getPage / appendBlock。",
    },
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "mcp-integration",
      text: "用 notion 的 search 工具找含「周报」的页面。",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { tool_name: "notion.search", query: "周报" },
      output:
        '[\n  { "id": "p_42a", "title": "本周周报 (2026-W18)", "url": "..." }\n]',
      delay: 700,
      explainId: "mcp-integration",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { tool_name: "notion.getPage", page_id: "p_42a" },
      output:
        "# 本周周报 (W18)\n\n- 完成：/cc 仿真器主体\n- 在做：原理面板交互动画\n- 卡点：暂无",
      delay: 800,
      truncated: true,
      explainId: "mcp-integration",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "mcp-integration",
      text:
        "找到了你的「本周周报 (W18)」：\n\n- ✅ 完成了 /cc 仿真器主体\n- 🚧 正在做原理面板交互动画\n- 🟢 没卡点\n\n要把今天的进度也追加进去吗？",
    },
  ],
};

// ---- 7. hooks-cleanup：PreToolUse hook 拦截危险 Bash --------------------

const hooksCleanupScenario: Scenario = {
  id: "hooks-cleanup",
  title: "Hooks 拦截危险命令",
  triggers: {
    slash: ["/cleanup-tmp"],
    keywords: [/清.*tmp/, /删.*tmp/, /清理.*临时/],
  },
  defaultExplainId: "hooks",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 500,
      explainId: "hooks",
      text: "我打算跑 `rm -rf tmp/` 一把清掉。",
    },
    {
      kind: "system-note",
      tone: "warn",
      delay: 500,
      explainId: "hooks",
      text:
        "PreToolUse hook 触发：`.claude/check-bash.sh`\n→ 检测到命令含 `rm -rf` → exit 1\n工具调用被拒绝。",
    },
    {
      kind: "assistant-thinking",
      delay: 700,
      explainId: "hooks",
      text: "好的，hook 不让我跑 rm -rf。我换个思路：先列出来给你看，让你决定怎么处理。",
    },
    {
      kind: "tool-call",
      tool: "Bash",
      input: { command: "ls tmp/" },
      output: "build.log\ndebug.log\nold-screenshots/\n（共 3 项）",
      delay: 700,
      explainId: "hooks",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "hooks",
      text:
        "tmp/ 里有 3 项：`build.log`、`debug.log`、`old-screenshots/`。\n\n你的 hook 把 `rm -rf` 全拦了，所以我没法批量删。建议你自己在终端跑：\n\n```bash\nrm -rf tmp/build.log tmp/debug.log\n```\n\n或者把 hook 改成只拦根目录的 rm -rf，允许 tmp/ 下的。",
    },
  ],
};

// ---- 8. skills-review：自动加载 review skill ---------------------------

const skillsReviewScenario: Scenario = {
  id: "skills-review",
  title: "review skill 自动加载",
  triggers: {
    keywords: [/review.*改动/, /帮我.*review/, /看.*PR/, /检查.*改动/, /审.*代码/],
  },
  defaultExplainId: "skills-system",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 400,
      explainId: "skills-system",
      text:
        "Skill 自动加载：`code-review`（匹配关键词「review / 看 PR / 检查改动」）。\n注入工作流到上下文。",
    },
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "skills-system",
      text: "按 skill 模板：第 1 步先 `git diff main...HEAD` 看改动。",
    },
    {
      kind: "tool-call",
      tool: "Bash",
      input: { command: "git diff main...HEAD --stat" },
      output:
        " src/components/Header.tsx       |  2 +-\n src/app/cc/page.tsx              | 75 +++++++++\n src/components/cc/Simulator.tsx  | 95 ++++++++++++\n（共 22 个文件）",
      delay: 800,
      truncated: true,
      explainId: "skills-system",
    },
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "skills-system",
      text: "按 skill 模板的分类逻辑（逻辑 / 性能 / 风格）扫一遍每个改动。",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "skills-system",
      text:
        "## Review 报告\n\n- 高风险：**0**\n- 中风险：**1** —— `Simulator.tsx` 里 phase queue 调度的 useEffect 依赖里少了 `state.tokenUsedPct`，理论上不会触发但写法不一致。\n- 低风险：**2** —— Header.tsx 加了一行入口（OK）；scenarios 里有几处中文双引号嵌套，已通过。\n\n要看具体行号还是修哪个？",
    },
  ],
};

// ---- 9. plan-first：plan 模式 -----------------------------------------

const planFirstScenario: Scenario = {
  id: "plan-first",
  title: "/plan —— 只列方案不动手",
  triggers: {
    slash: ["/plan"],
    keywords: [/重构.*auth/i, /先列.*方案/, /先规划/, /帮我规划/],
  },
  defaultExplainId: "plan-mode",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 300,
      text: "已切到 plan 模式：本次对话只列计划，不真的修改文件。",
      explainId: "plan-mode",
    },
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "plan-mode",
      text: "目标：重构 src/auth 模块。先看一下现状，再出计划。",
    },
    {
      kind: "tool-call",
      tool: "Glob",
      input: { pattern: "src/auth/**/*.{ts,tsx}" },
      output:
        "src/auth/index.ts\nsrc/auth/login.tsx\nsrc/auth/logout.tsx\nsrc/auth/use-auth.ts\nsrc/auth/token.ts\nsrc/auth/__tests__/auth.test.ts\n（共 8 个文件）",
      delay: 700,
      truncated: true,
      explainId: "plan-mode",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { file_path: "src/auth/use-auth.ts" },
      output: "// 当前 88 行，token 校验逻辑散落 4 处\n…（已截断）",
      delay: 600,
      truncated: true,
      explainId: "plan-mode",
    },
    {
      kind: "assistant-reply",
      delay: 800,
      explainId: "plan-mode",
      text: `## 重构计划草案

1. **统一 token 校验**：把 use-auth / login / token.ts 里 4 处重复逻辑提取到 \`hooks/useTokenGuard\`。
2. **接口收口**：4 个组件改用新 hook，删掉旧接口。
3. **测试更新**：\`__tests__/auth.test.ts\` 加新 hook 的 unit + 修旧用例。
4. **跑测试**：\`npm test\` 通过。
5. **review**：人工看一眼 diff。

预计改动：~6 个文件，~150 行。

**因为是 plan 模式，我没改任何东西**。要执行可以：
- 退出后用 \`--permission-mode acceptEdits\` 重启
- 或者跟我说「按这个计划做」，我会一步步问你权限`,
    },
  ],
};

// ---- 10. cost-track：/cost 透明账单 -----------------------------------

const costTrackScenario: Scenario = {
  id: "cost-track",
  title: "/cost —— 看本次会话花了多少",
  triggers: { slash: ["/cost"] },
  defaultExplainId: "cost-tracking",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 300,
      text: `本次会话计费明细：

input tokens:    12,450
  └ cache hit:    8,900 (71%)
  └ fresh:        3,550
output tokens:    3,200
─────────────────────────────
input cost:    $0.0134
output cost:   $0.0480
TOTAL:         $0.0614`,
      explainId: "cost-tracking",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "cost-tracking",
      text: `这次会话到现在花了 **6 美分**。

省钱的关键是**缓存命中**——这次 71%。\`/compact\` 后命中率会暂时降，但长会话整体更省。

输出 token 单价是输入的约 5 倍——所以让 Claude **回答精炼**比让它**少读文件**更省钱。`,
    },
  ],
};

// ---- 11. doctor-check：/doctor 环境体检 -------------------------------

const doctorCheckScenario: Scenario = {
  id: "doctor-check",
  title: "/doctor —— 环境一键体检",
  triggers: { slash: ["/doctor"] },
  defaultExplainId: "doctor",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 300,
      text: "正在检查 Claude Code 环境…",
      explainId: "doctor",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 1200,
      text: `检查完成（8 项 / 6 通过 / 1 警告 / 1 失败）：

✓ Anthropic API key 已设置
✓ 模型连通性 (claude-opus-4-7, 320ms)
✓ settings.json 解析合法
✓ MCP: notion (search / getPage / appendBlock)
✗ MCP: github —— stdio 握手超时
✓ 项目 CLAUDE.md (38 行)
⚠ Node v18.20.0（推荐 v20+）
✓ 权限模式：default`,
      explainId: "doctor",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "doctor",
      text: `8 项里 1 个 fail / 1 个 warn：

**❌ MCP github 握手超时** —— 大概率是 \`GH_TOKEN\` 过期。去 GitHub Settings → Developer settings → Personal access tokens 看一眼，过期了重新生成，扔进 \`~/.claude/settings.json\` 的 env 字段。

**⚠ Node v18** —— 不影响跑，但 v20+ 性能更好，特别是大项目。\`nvm install 20\` 即可。

其他 6 项 OK，可以正常工作。`,
    },
  ],
};

// ---- 12. resume-session：/resume 恢复历史会话 -------------------------

const resumeSessionScenario: Scenario = {
  id: "resume-session",
  title: "/resume —— 恢复历史会话",
  triggers: { slash: ["/resume"] },
  defaultExplainId: "session-resume",
  phases: [
    {
      kind: "system-note",
      tone: "info",
      delay: 300,
      text: `找到 4 条历史会话：

[1] 今天 14:30 · my-tool/ · 改首页 hero 文案 (23 轮)
[2] 昨天 19:00 · my-blog/ · 写 claude-skills.md (8 轮)
[3] 3 天前    · my-api/  · 调试 webhook 鉴权 (41 轮)
[4] 上周      · my-tool/ · 初始化 Next.js + Tailwind (17 轮)

输入序号或会话 id 恢复。当前 cwd: ~/my-tool`,
      explainId: "session-resume",
    },
    {
      kind: "assistant-reply",
      delay: 700,
      explainId: "session-resume",
      text: `挑一条恢复就好。

- **同项目（[1] [4]）**：直接恢复，里面的文件路径都对得上。
- **跨项目（[2] [3]）**：能恢复，但里面引用的相对路径（\`./src/...\`）会找不到文件——除非你 \`cd\` 过去。我会先警告你。

会话存在本地的 \`~/.claude/sessions/\`，目前还不能跨机同步——这是已知 roadmap。`,
    },
  ],
};

// ---- 13. big-task：TodoWrite 拆分多步任务 -----------------------------

const bigTaskScenario: Scenario = {
  id: "big-task",
  title: "拆分大任务（TodoWrite）",
  triggers: {
    slash: ["/big-task"],
    keywords: [
      /实现.*完整.*功能/,
      /搭一个.*页面/,
      /加一个.*功能/,
      /改首页.*hero/,
    ],
  },
  defaultExplainId: "todo-write",
  phases: [
    {
      kind: "assistant-thinking",
      delay: 600,
      explainId: "todo-write",
      text: "这是多步任务。先用 TodoWrite 拆成 5 步，再一项项推进——这样不会忘事。",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 500,
      explainId: "todo-write",
      text: `📋 TodoWrite —— 已规划 5 个任务：

[ ] 1. 读 README 了解项目结构
[ ] 2. 用 Glob 找到 hero 组件入口
[ ] 3. 改 hero 文案 + 加新插画
[ ] 4. 跑 npm run build 确认无类型错
[ ] 5. 起 dev 服务浏览器对效果`,
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 700,
      explainId: "todo-write",
      text: "📋 TodoWrite 更新：[1] in_progress",
    },
    {
      kind: "tool-call",
      tool: "Read",
      input: { file_path: "README.md" },
      output: "# 我的小工具\n\n这是 Next.js 项目…（已截断）",
      delay: 700,
      truncated: true,
      explainId: "todo-write",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 400,
      explainId: "todo-write",
      text: "📋 TodoWrite 更新：[1] ✓ completed → [2] in_progress",
    },
    {
      kind: "tool-call",
      tool: "Glob",
      input: { pattern: "src/components/Hero*.tsx" },
      output: "src/components/Hero.tsx",
      delay: 600,
      explainId: "todo-write",
    },
    {
      kind: "system-note",
      tone: "info",
      delay: 400,
      explainId: "todo-write",
      text: "📋 TodoWrite 更新：[2] ✓ completed → [3] in_progress（继续干，省略后续工具调用）",
    },
    {
      kind: "assistant-reply",
      delay: 800,
      explainId: "todo-write",
      text: `右边那个 todo 列表点「播放」可以看完整推进过程。

为什么要这么折腾？因为多步任务里**任何一步出错或被中断**，从 todo 状态就能立刻看出走到哪了。这是 Claude 干 30 分钟活的关键机制——**不忘事 + 可追踪**。`,
    },
  ],
};

// ---- 兜底场景（parser 没匹配到任何 scenario 时用） ---------------------

export const unknownScenario: Scenario = {
  id: "unknown",
  title: "兜底",
  triggers: {},
  defaultExplainId: "slash-commands",
  phases: [
    {
      kind: "assistant-reply",
      delay: 400,
      explainId: "slash-commands",
      text: "这个我现在还演不出来——这是个简化的模拟器，只懂下面几种操作。试试输入 `/help` 看可以做什么，或者点输入框上方的快速命令。",
    },
  ],
};

// ---- 注册表 -----------------------------------------------------------

export const scenarios: Scenario[] = [
  helpScenario,
  readReadmeScenario,
  deleteDistScenario,
  compactScenario,
  initScenario,
  scanTodoScenario,
  mcpNotionScenario,
  hooksCleanupScenario,
  skillsReviewScenario,
  planFirstScenario,
  costTrackScenario,
  doctorCheckScenario,
  resumeSessionScenario,
  bigTaskScenario,
];

/** 用户进入 /cc 时显示的 onboarding 命令快捷按钮 */
export const onboardingHints: Array<{ label: string; input: string }> = [
  { label: "/help", input: "/help" },
  { label: "看一下 README 第一行", input: "看一下 README 的第一行" },
  { label: "删 dist 目录", input: "帮我删掉 dist 目录" },
  { label: "/compact", input: "/compact" },
  { label: "/init", input: "/init" },
  { label: "扫 src 找 TODO", input: "帮我扫一下 src 里的所有 TODO" },
  { label: "Notion 找周报", input: "在 Notion 里查一下我的周报" },
  { label: "清 tmp 目录", input: "清理一下 tmp 临时目录" },
  { label: "review 改动", input: "帮我 review 一下这次改动" },
  { label: "/plan 重构 auth", input: "/plan" },
  { label: "/cost", input: "/cost" },
  { label: "/doctor", input: "/doctor" },
  { label: "/resume", input: "/resume" },
  { label: "实现完整功能", input: "实现一个完整的搜索功能" },
];
