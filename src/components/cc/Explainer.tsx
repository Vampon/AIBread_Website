"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Lightbulb } from "lucide-react";
import { getConcept } from "@/data/cc/concepts";
import {
  useArticleMap,
  useSimDispatch,
  useSimulator,
} from "./SimulatorContext";
import { ExplainerMd } from "./explainerMd";
import { ToolUseLoopVisual } from "./visuals/ToolUseLoopVisual";
import { PermissionVisual } from "./visuals/PermissionVisual";
import { ContextWindowVisual } from "./visuals/ContextWindowVisual";
import { MemoryLayersVisual } from "./visuals/MemoryLayersVisual";
import { SlashRouteVisual } from "./visuals/SlashRouteVisual";
import { SubagentTreeVisual } from "./visuals/SubagentTreeVisual";
import { McpPluginsVisual } from "./visuals/McpPluginsVisual";
import { HooksTimelineVisual } from "./visuals/HooksTimelineVisual";
import { SkillsAutoloadVisual } from "./visuals/SkillsAutoloadVisual";
import { PlanModeVisual } from "./visuals/PlanModeVisual";
import { CostTrackingVisual } from "./visuals/CostTrackingVisual";
import { DoctorCheckVisual } from "./visuals/DoctorCheckVisual";
import { SessionResumeVisual } from "./visuals/SessionResumeVisual";
import { TodoWriteVisual } from "./visuals/TodoWriteVisual";

const VISUALS: Record<string, () => React.JSX.Element> = {
  "tool-use-loop": ToolUseLoopVisual,
  permission: PermissionVisual,
  "context-window": ContextWindowVisual,
  "memory-layers": MemoryLayersVisual,
  "slash-route": SlashRouteVisual,
  "subagent-tree": SubagentTreeVisual,
  "mcp-plugins": McpPluginsVisual,
  "hooks-timeline": HooksTimelineVisual,
  "skills-autoload": SkillsAutoloadVisual,
  "plan-mode": PlanModeVisual,
  "cost-tracking": CostTrackingVisual,
  "doctor-check": DoctorCheckVisual,
  "session-resume": SessionResumeVisual,
  "todo-write": TodoWriteVisual,
};

export function Explainer() {
  const state = useSimulator();
  const dispatch = useSimDispatch();

  const activeId = state.pinnedExplainId ?? state.explainId;
  const concept = getConcept(activeId);
  const isPinned = !!state.pinnedExplainId;

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          这背后发生了什么
        </span>
        {isPinned && (
          <button
            type="button"
            onClick={() => dispatch({ type: "UNPIN_EXPLAIN" })}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-0.5 text-[10.5px] text-slate-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <ArrowLeft className="h-2.5 w-2.5" />
            返回当前
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!concept && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-5 text-center text-[12.5px] text-slate-500">
            还没开始操作。
            <br />
            敲一个命令或点上面的快速命令试试，这里会同步告诉你背后是什么。
          </div>
        )}

        {concept && (
          <div key={concept.id} className="space-y-4">
            <h3 className="text-[15px] font-semibold text-slate-100">
              {concept.title}
            </h3>
            {concept.visual && VISUALS[concept.visual]
              ? (() => {
                  const Visual = VISUALS[concept.visual];
                  return <Visual />;
                })()
              : null}
            <ExplainerMd
              text={concept.markdown}
              className="text-[13px] text-slate-300"
            />
            <RelatedArticles slugs={concept.relatedSlugs} />
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedArticles({ slugs }: { slugs: string[] }) {
  const articleMap = useArticleMap();
  if (!slugs || slugs.length === 0) return null;
  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-slate-500">
        <BookOpen className="h-3 w-3" />
        延伸阅读
      </div>
      <ul className="space-y-1.5">
        {slugs.map((slug) => {
          const title = articleMap[slug];
          if (!title) {
            return (
              <li
                key={slug}
                className="rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-[12px] text-slate-500"
              >
                <span className="text-slate-400">{slug}</span>
                <span className="ml-2 rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-500">
                  草稿中
                </span>
              </li>
            );
          }
          return (
            <li key={slug}>
              <Link
                href={`/blog/${slug}`}
                className="block rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-200"
              >
                {title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
