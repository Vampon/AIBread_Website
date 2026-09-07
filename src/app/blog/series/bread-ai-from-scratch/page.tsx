import { redirect } from "next/navigation";
import { BREAD_SERIES_PATH } from "@/lib/bread-series";

export const metadata = {
  title: "从零手写 AI 助手｜Agent 装配手册",
  description: "用 33 个可以直接运行的 Python 章节，从零手写 Agent、MCP、RAG、浏览器 Agent 与多 Agent 系统。",
};

export default function BreadSeriesPage() {
  redirect(BREAD_SERIES_PATH);
}
