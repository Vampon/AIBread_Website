/**
 * 仿真 Claude Code 的"原理卡"数据。
 *
 * 每张卡：
 * - 当前 phase 触发它对应的 explainId 时，Explainer 显示 markdown + 关联博文链接 + visual 组件
 * - implemented 字段决定首页"概念索引"里是绿底"已收录"还是灰底"v2 解锁"
 *
 * markdown 用 explainerMd 渲染，仅支持段落 / 加粗 / 行内 code / [text](url) 链接。
 */

import type { ConceptCard } from "@/lib/cc/types";

export const concepts: Record<string, ConceptCard> = {
  "tool-use-loop": {
    id: "tool-use-loop",
    title: "Tool Use 循环：模型怎么「动手」",
    emoji: "🛠️",
    tagline: "Claude 不是直接读文件，而是在每一轮里决定要不要调用工具。",
    visual: "tool-use-loop",
    markdown: `Claude 模型本身**只会输出文字**。要让它读文件、跑命令，得给它一份「工具菜单」。

每一轮对话其实是这样的：

1. 你说一句话 → 模型决定**调一个工具**（比如 \`Read\`）。
2. Claude Code 接到工具调用，去真实环境执行，把结果再喂回给模型。
3. 模型读到结果后，**再生成一段回复**或继续调下一个工具。

你看到的"流式回复"中间那些灰色折叠块，就是这个循环正在发生。模型决定用什么工具是**自己想的**，不是 Claude Code 写死的——这也是为什么同一个问题它有时调 Read、有时调 Grep。

[读完整篇 →](/blog/how-claude-uses-tools)`,
    relatedSlugs: ["how-claude-uses-tools"],
    implemented: true,
  },
  "permission-system": {
    id: "permission-system",
    title: "权限系统：在动手前先问一声",
    emoji: "🔐",
    tagline: "对会改环境的工具（Bash、Edit、Write），Claude Code 默认要先弹窗确认。",
    visual: "permission",
    markdown: `不是所有工具都「动手」。\`Read\` 这种**只读**工具一般不问；\`Bash\`、\`Edit\`、\`Write\` 这种会**改你电脑**的工具，Claude Code 会先弹窗。

权限有三种粒度：

- **允许一次**：本次执行，下次再问还要再问。
- **允许本会话**：这把对话里同一类工具不再问。
- **拒绝**：模型收到拒绝信号，会换个思路（比如改成只看不动）。

你也可以预先在 \`settings.json\` 里写白名单（\`permissions.allow\`），或者用 \`--dangerously-skip-permissions\` 直接关掉确认（**只在沙箱里这么玩**）。

[读完整篇 →](/blog/claude-code-permissions)`,
    relatedSlugs: ["claude-code-permissions"],
    implemented: true,
  },
  "context-window": {
    id: "context-window",
    title: "上下文窗口：桌面就这么大",
    emoji: "📜",
    tagline: "对话历史 + 工具结果都吃 token，超了 Claude 就记不住前面的事。",
    visual: "context-window",
    markdown: `想象 Claude 的工作台只有一张桌子。**所有对话历史、读过的文件内容、工具结果**都堆在这张桌子上，统称「上下文」。

桌子有上限（context window，比如 200k token）。堆满之后：

- 旧的内容会被**摘要替换**（这就是 \`/compact\` 命令做的事）。
- 或者你也可以 \`/clear\` 直接清桌子重开。

\`/compact\` 不是一刀切，它会**保留近几轮 + 摘要远期对话**，让 Claude 仍然知道你想干什么，只是不再记得每个字。

桌面占用率到 80% 时进度条会变橙——那是提醒你考虑收一下了。

[读完整篇 →](/blog/context-engineering)`,
    relatedSlugs: ["context-engineering"],
    implemented: true,
  },
  "claude-md-memory": {
    id: "claude-md-memory",
    title: "CLAUDE.md：贴在冰箱上的家规",
    emoji: "📝",
    tagline: "项目根目录的 CLAUDE.md 会自动注入 system prompt，跨会话生效。",
    visual: "memory-layers",
    markdown: `每次你在某个项目里启动 Claude Code，它做的第一件事是**找 CLAUDE.md**——找到就把内容塞进 system prompt。

写在 CLAUDE.md 里的内容相当于「对所有未来对话生效的家规」。\`/init\` 命令会让 Claude **扫一遍项目**，自动给你写一份草稿，你再改。

记忆有三层：项目级（\`./CLAUDE.md\`）→ 用户级（\`~/.claude/CLAUDE.md\`）→ 企业级。**重叠时项目级优先**。

[读完整篇 →](/blog/claude-md-best-practices)`,
    relatedSlugs: ["claude-md-best-practices"],
    implemented: true,
  },
  "slash-commands": {
    id: "slash-commands",
    title: "Slash 命令：直达内置技能",
    emoji: "⌨️",
    tagline: "/ 开头的输入会被当成命令分发到内置或自定义技能，不走模型推理。",
    visual: "slash-route",
    markdown: `普通输入交给 Claude 模型推理；以 \`/\` 开头的输入则**直接进命令分发器**——速度更快、行为更可预测。

内置常见命令：\`/help\` \`/init\` \`/compact\` \`/clear\` \`/permissions\` \`/cost\` \`/exit\`。

你也可以**自己写 slash 命令**——在 \`.claude/commands/<name>.md\` 里放一段 markdown，Claude 收到 \`/<name>\` 就会按那段执行。

[读完整篇 →](/blog/claude-code-slash-commands)`,
    relatedSlugs: ["claude-code-slash-commands"],
    implemented: true,
  },
  subagent: {
    id: "subagent",
    title: "子代理：派出去的小工",
    emoji: "🤝",
    tagline: "主代理可以派子代理去单独跑某个子任务，回来汇报结果。",
    visual: "subagent-tree",
    markdown: `干大活时，Claude 会**派一个子代理**去执行——子代理有自己独立的桌面（上下文），跑完只把摘要回主代理。

为什么要这样？因为如果主代理直接读 200 个文件，桌面会被原始内容撑爆，后面什么都做不了。

每个子代理可以**限定工具**（比如安全审计员只给 Read+Grep），让它专注、可控。子代理任务结束就消失，下次新派的是新实例。

[读完整篇 →](/blog/claude-subagent)`,
    relatedSlugs: ["claude-subagent"],
    implemented: true,
  },
  "mcp-integration": {
    id: "mcp-integration",
    title: "MCP：AI 的 USB 接口",
    emoji: "🔌",
    tagline: "通过 MCP 协议把第三方服务（Notion、GitHub、数据库）变成 Claude 的工具。",
    visual: "mcp-plugins",
    markdown: `MCP（Model Context Protocol）是 Anthropic 牵头搞的开放协议。装一个 MCP server，**它的工具就被加进 Claude 的工具菜单**——对模型来说没区别，都是工具。

社区已有的 MCP server：Notion / GitHub / Postgres / Linear / Figma / Slack ……几乎所有有 API 的服务。

装上 MCP，Claude 就能在终端里**直接帮你查 Notion、提 PR、查数据库**。

[Claude Code 里怎么装 →](/blog/claude-code-mcp) · [MCP 协议本身 →](/blog/mcp-protocol)`,
    relatedSlugs: ["claude-code-mcp", "mcp-protocol"],
    implemented: true,
  },
  hooks: {
    id: "hooks",
    title: "Hooks：在关键节点插一脚",
    emoji: "🪝",
    tagline: "工具调用前 / 后 / 提示词提交时，跑你写的脚本做检查或改写。",
    visual: "hooks-timeline",
    markdown: `Hooks 是 Claude Code 的「中间件」。在 4 个已知节点（**UserPromptSubmit / PreToolUse / PostToolUse / Stop**）你都可以挂一段自己的脚本。

脚本能：

- 看到这一刻的上下文（哪个工具、参数是啥）
- **改写**参数（比如自动给 Bash 命令加 \`--dry-run\`）
- **拦截**（exit code 非 0 → 工具被取消）

最常见用法：拦截危险命令、自动跑格式化、自动 commit。

[读完整篇 →](/blog/claude-code-hooks)`,
    relatedSlugs: ["claude-code-hooks"],
    implemented: true,
  },
  "skills-system": {
    id: "skills-system",
    title: "Skills：教 Claude 学会一招",
    emoji: "🎒",
    tagline: "把一段流程封装成 skill，触发关键词时自动加载。",
    visual: "skills-autoload",
    markdown: `Skill 是 Claude Code 里**起了名字的工作流**。

跟 slash 命令的区别：slash 命令需要你显式敲 \`/xxx\`；**skill 可以隐式触发**——你说「review 一下这个 PR」，Claude 读到关键词，**自动加载** code-review skill 的工作流。

一个 skill 包含：触发关键词、允许的工具、执行流程。可以单独写，也可以**打包成插件发布**给团队共享。

[读完整篇 →](/blog/claude-skills)`,
    relatedSlugs: ["claude-skills"],
    implemented: true,
  },
  "plan-mode": {
    id: "plan-mode",
    title: "Plan 模式：先想清楚再动手",
    emoji: "🗺️",
    tagline: "启动加 --permission-mode plan，Claude 只列方案不修改文件。",
    visual: "plan-mode",
    markdown: `Claude Code 启动时可以选**权限模式**。\`plan\` 模式很特别——它告诉 Claude「**只列计划，不真的动手**」。

适合三种场景：

- 给一个**模糊大需求**（如「重构 auth 模块」），先看 AI 准备怎么拆。
- 不熟悉的代码库，先让它读一圈写个动手指南。
- 给同事 review AI 的方案，再决定要不要执行。

跟另两个常见模式对比：

- \`default\`：动手前**问你**——最稳，但啰嗦。
- \`plan\`：**只列**计划——只读不写。
- \`acceptEdits\`：Edit 工具**自动放行**——快，但要求 git 干净能 reset。

[读完整篇 →](/blog/claude-plan-mode)`,
    relatedSlugs: ["claude-plan-mode", "claude-code-permissions"],
    implemented: true,
  },
  "cost-tracking": {
    id: "cost-tracking",
    title: "成本透明：一次对话花了多少钱",
    emoji: "💰",
    tagline: "/cost 看 token 消耗 + 美元折算，prompt cache 是省钱关键。",
    visual: "cost-tracking",
    markdown: `Claude API 按 **token** 收费。每次对话，Claude Code 在底下默默记账。\`/cost\` 一键查看：

- **input tokens**:你的输入 + 历史对话 + 工具结果
- **output tokens**:模型生成的回复 → 单价约 5x
- **cache hit**:之前的输入被缓存命中 → 单价**降到 ~10%**

省钱的核心是**让缓存命中**。Claude Code 已经做了：

- 系统 prompt + CLAUDE.md 自动放在前面（最稳的部分）
- 对话历史保持顺序（顺序变了缓存就失效）
- \`/compact\` 不仅省桌面，还重建一个**新的稳定前缀**

实战：长对话 + 多次工具调用，缓存命中 80%+ 是正常水平。

[读完整篇 →](/blog/claude-code-cost)`,
    relatedSlugs: ["claude-code-cost", "context-engineering"],
    implemented: true,
  },
  doctor: {
    id: "doctor",
    title: "/doctor：环境一键体检",
    emoji: "🩺",
    tagline: "装完先跑这个，省半小时排查 API key/MCP/权限/版本问题。",
    visual: "doctor-check",
    markdown: `\`/doctor\` 一行命令检查所有可能让 Claude Code 跑不起来的事：

- API key 是否设置、连不连得上模型
- \`settings.json\` 三层（用户/项目/local）是否合法
- 每个 MCP server 启动状态、握手是否成功
- 当前项目有没有 CLAUDE.md
- Node 版本、当前权限模式

每项独立打勾打叉。**fail 项会给修复建议**——比如 GH_TOKEN 过期会提示你去重新生成。

新装机第一件事跑这个，能省掉「why 不工作」的两小时折腾。

[读完整篇 →](/blog/claude-code-doctor)`,
    relatedSlugs: ["claude-code-doctor"],
    implemented: true,
  },
  "session-resume": {
    id: "session-resume",
    title: "会话恢复：关掉终端不会丢",
    emoji: "🔁",
    tagline: "/resume 列出历史会话，按项目恢复完整上下文继续聊。",
    visual: "session-resume",
    markdown: `每次你在某项目里跑 Claude Code，对话**自动存到本地**（按 project + 时间索引）。

\`/resume\` 列出所有会话；选中一条 → 加载完整上下文（消息历史 + 工具结果 + CLAUDE.md），就像你**没退出过**。

跨项目恢复会**警告**：如果历史会话来自 \`my-api/\`，但你现在在 \`my-tool/\`，里面的相对路径会找不到文件。Claude Code 会提示你 \`cd\` 过去或者新建会话。

最常见用法：

- 早上接着昨晚的活
- 上下文太满了 \`/clear\` 重开 → 后悔了 \`/resume\` 找回来

会话目前存在本地 \`~/.claude/sessions/\`，跨机同步是已知 roadmap。

[读完整篇 →](/blog/claude-code-session)`,
    relatedSlugs: ["claude-code-session"],
    implemented: true,
  },
  "todo-write": {
    id: "todo-write",
    title: "TodoWrite：AI 内部的待办清单",
    emoji: "📋",
    tagline: "Claude 接到多步任务时自己拆 todo，每完成一项就更新状态。",
    visual: "todo-write",
    markdown: `给 Claude 一个大任务（「实现一个完整的搜索功能」），它**不会闷头干**，而是先调 \`TodoWrite\` 工具拆成 4-6 个 todo，然后逐项推进。

每个 todo 有三态：\`pending → in_progress → completed\`。当前在做的那一项是 \`in_progress\`，每完成一项**立刻更新**——你看着它一项一项打勾。

为什么这是 Claude Code 干 30 分钟活的**关键机制**?

- **不忘事**：跨多轮 / 多个工具调用，todo 列表始终是「真相之源」。
- **可追踪**：你在屏幕上能看到它在哪一步、卡在哪。
- **能跨子代理**：父代理派子代理时把 todo 同步过去，子代理跑完更新状态回来。

你也可以**手动让它写 todo**——「先用 TodoWrite 拆一下任务，再开干」是新人最该学的提示词之一。

[读完整篇 →](/blog/claude-todowrite)`,
    relatedSlugs: ["claude-todowrite", "claude-subagent"],
    implemented: true,
  },
};

/** 概念索引（首页底部网格）按这个顺序展示。 */
export const conceptOrder: string[] = [
  "tool-use-loop",
  "permission-system",
  "context-window",
  "claude-md-memory",
  "slash-commands",
  "subagent",
  "mcp-integration",
  "hooks",
  "skills-system",
  "plan-mode",
  "cost-tracking",
  "doctor",
  "session-resume",
  "todo-write",
];

export function getConcept(id: string | null | undefined) {
  if (!id) return null;
  return concepts[id] ?? null;
}
