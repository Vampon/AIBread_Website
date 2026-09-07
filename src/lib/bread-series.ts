export const BREAD_SERIES_SLUG = "bread-ai-from-scratch";
export const BREAD_SERIES_PATH = `/ai-learn/${BREAD_SERIES_SLUG}`;

export function breadChapterPath(slug: string) {
  return `${BREAD_SERIES_PATH}/${slug}`;
}

export const breadCourses = [
  {
    slug: "agent",
    number: "01",
    name: "Bread Agent",
    shortName: "Agent",
    action: "让模型开始动手",
    description: "从一次 LLM 调用出发，亲手补上工具、循环、会话、钩子与子 Agent。",
    color: "#C7772D",
  },
  {
    slug: "mcp",
    number: "02",
    name: "Bread MCP",
    shortName: "MCP",
    action: "让工具即插即用",
    description: "不背协议名词，从 JSON-RPC、stdio 和握手开始，最后接回自己的 Agent。",
    color: "#2B8C82",
  },
  {
    slug: "rag",
    number: "03",
    name: "Bread RAG",
    shortName: "RAG",
    action: "让模型找到资料",
    description: "从暴力塞全文到词袋、向量、混合检索和重排，看清每一步解决了什么。",
    color: "#7C6AB0",
  },
  {
    slug: "browser",
    number: "04",
    name: "Bread Browser",
    shortName: "Browser",
    action: "让模型操作网页",
    description: "用 Playwright 搭出可观察、可点击、可循环执行任务的浏览器 Agent。",
    color: "#3279A8",
  },
  {
    slug: "multi-agent",
    number: "05",
    name: "Bread Multi-Agent",
    shortName: "Multi-Agent",
    action: "让多个角色协作",
    description: "从两个角色对话开始，逐步实现规划、执行、审查、路由和完整流水线。",
    color: "#A74E4B",
  },
] as const;

export function courseMeta(slug?: string) {
  return breadCourses.find((course) => course.slug === slug);
}
