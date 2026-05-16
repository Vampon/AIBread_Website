"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSimDispatch } from "./SimulatorContext";
import type { Message, ToolName } from "@/lib/cc/types";

type ToolCallMessage = Extract<Message, { kind: "tool-call" }>;

const STATUS_DOT: Record<string, string> = {
  pending: "text-slate-500 animate-pulse",
  done: "text-emerald-400",
  denied: "text-rose-500",
};

const TOOL_TINT: Record<ToolName, string> = {
  Read: "text-sky-300",
  Write: "text-amber-300",
  Edit: "text-amber-300",
  Bash: "text-rose-300",
  Glob: "text-violet-300",
  Grep: "text-violet-300",
};

function summarize(tool: ToolName, input: Record<string, unknown>): string {
  switch (tool) {
    case "Read":
    case "Edit":
    case "Write":
      return String(input.file_path ?? input.path ?? "");
    case "Bash":
      return String(input.command ?? "").slice(0, 80);
    case "Glob":
    case "Grep":
      return String(input.pattern ?? "");
    default:
      return "";
  }
}

function shortOutput(output: string | undefined): string {
  if (!output) return "(no output)";
  const lines = output.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return "(no output)";
  const first = lines[0].slice(0, 90);
  if (lines.length === 1) return first;
  const more = lines.length - 1;
  return `${first}  +${more} more line${more > 1 ? "s" : ""}`;
}

export function ToolCallBlock({ msg }: { msg: ToolCallMessage }) {
  const dispatch = useSimDispatch();
  const [open, setOpen] = useState(false);
  const summary = summarize(msg.tool, msg.input);

  const pin = () => {
    if (msg.explainId) {
      dispatch({ type: "PIN_EXPLAIN", explainId: msg.explainId });
    }
  };

  const tail =
    msg.status === "pending"
      ? "running…"
      : msg.status === "denied"
      ? "denied by user"
      : shortOutput(msg.output);

  return (
    <div className="font-mono text-[12.5px] leading-6">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group flex flex-1 items-center gap-2 text-left"
        >
          <span
            className={`flex-none select-none ${STATUS_DOT[msg.status]}`}
          >
            ⏺
          </span>
          <span className={TOOL_TINT[msg.tool] ?? "text-slate-200"}>
            {msg.tool}
          </span>
          {summary && (
            <span className="truncate text-slate-400">({summary})</span>
          )}
          {open ? (
            <ChevronDown className="ml-auto h-3 w-3 flex-none text-slate-600 group-hover:text-slate-400" />
          ) : (
            <ChevronRight className="ml-auto h-3 w-3 flex-none text-slate-600 group-hover:text-slate-400" />
          )}
        </button>
        {msg.explainId && (
          <button
            type="button"
            onClick={pin}
            className="rounded px-1.5 py-0.5 text-[10px] text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
            title="把原理面板锁到这一步"
          >
            原理
          </button>
        )}
      </div>

      <div className="ml-4 flex gap-2 text-slate-500">
        <span className="flex-none select-none">⎿</span>
        <span className="truncate">
          {msg.status === "denied" ? (
            <span className="text-rose-400/80">{tail}</span>
          ) : (
            tail
          )}
        </span>
      </div>

      {open && (
        <div className="mt-1 ml-4 space-y-2 rounded border border-slate-800 bg-slate-900/40 p-2">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
              input
            </div>
            <pre className="overflow-x-auto rounded bg-slate-950/60 p-2 text-[11px] leading-5 text-slate-300">
              {JSON.stringify(msg.input, null, 2)}
            </pre>
          </div>
          {msg.output !== undefined && (
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                output{" "}
                {msg.truncated && (
                  <span className="text-amber-400/80">(truncated)</span>
                )}
              </div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-slate-950/60 p-2 text-[11px] leading-5 text-slate-300">
                {msg.output || "(empty)"}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
