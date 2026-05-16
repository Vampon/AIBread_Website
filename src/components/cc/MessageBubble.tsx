"use client";

import {
  ArrowDown,
  FileText,
  TrendingDown,
} from "lucide-react";
import { useSimDispatch } from "./SimulatorContext";
import { ExplainerMd } from "./explainerMd";
import type { Message } from "@/lib/cc/types";

function PinTrigger({
  explainId,
  className = "",
  children,
}: {
  explainId: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  const dispatch = useSimDispatch();
  if (!explainId) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "PIN_EXPLAIN", explainId })}
      className={`block w-full text-left ${className}`}
      title="原理面板看这一步"
    >
      {children}
    </button>
  );
}

export function MessageBubble({ msg }: { msg: Message }) {
  switch (msg.kind) {
    case "user":
      return (
        <div className="flex gap-2 py-0.5">
          <span className="flex-none select-none font-mono text-amber-400/90">
            &gt;
          </span>
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-7 text-slate-100">
            {msg.text}
          </pre>
        </div>
      );

    case "assistant-thinking":
      return (
        <PinTrigger explainId={msg.explainId}>
          <div className="flex gap-2 py-0.5">
            <span className="flex-none select-none animate-pulse text-amber-400/70">
              ✻
            </span>
            <ExplainerMd
              text={msg.text}
              className="font-mono text-[12.5px] italic leading-6 text-slate-500"
            />
          </div>
        </PinTrigger>
      );

    case "assistant-reply":
      return (
        <PinTrigger explainId={msg.explainId}>
          <div className="flex gap-2 py-1">
            <span className="flex-none select-none text-emerald-400">⏺</span>
            <ExplainerMd
              text={msg.text}
              className="font-mono text-[13px] leading-7 text-slate-200"
            />
          </div>
        </PinTrigger>
      );

    case "system-note": {
      const accent = msg.tone === "warn" ? "text-amber-400" : "text-sky-400/80";
      const textColor =
        msg.tone === "warn" ? "text-amber-200/90" : "text-slate-400";
      return (
        <PinTrigger explainId={msg.explainId} className="w-full">
          <div className="flex gap-2 py-0.5">
            <span className={`flex-none select-none ${accent}`}>※</span>
            <pre
              className={`whitespace-pre-wrap break-words font-mono text-[12px] leading-6 ${textColor}`}
            >
              {msg.text}
            </pre>
          </div>
        </PinTrigger>
      );
    }

    case "permission-record": {
      const denied = msg.resolution === "deny";
      const accent = denied ? "text-rose-400" : "text-emerald-400";
      const symbol = denied ? "✗" : "✓";
      const label = denied
        ? "denied"
        : msg.resolution === "allow-session"
        ? "allowed for session"
        : "allowed once";
      return (
        <PinTrigger explainId={msg.explainId} className="w-full">
          <div className="flex items-center gap-2 py-0.5 font-mono text-[12px]">
            <span className={`flex-none ${accent}`}>{symbol}</span>
            <span className="text-slate-300">{msg.tool}</span>
            <span className="text-slate-600">·</span>
            <span className={accent}>{label}</span>
          </div>
        </PinTrigger>
      );
    }

    case "context-effect":
      return (
        <PinTrigger explainId={msg.explainId} className="w-full">
          <div className="my-1 rounded border border-emerald-700/30 bg-emerald-900/10 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-emerald-300">
              <TrendingDown className="h-3 w-3" />
              <span>compacted context</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300">{msg.before}%</span>
              <ArrowDown className="h-3 w-3 -rotate-90 text-slate-500" />
              <span className="text-emerald-300">{msg.after}%</span>
            </div>
            <ExplainerMd
              text={msg.summaryText}
              className="mt-1.5 font-mono text-[12px] leading-6 text-slate-400"
            />
          </div>
        </PinTrigger>
      );

    case "memory-load":
      return (
        <PinTrigger explainId={msg.explainId} className="w-full">
          <div className="my-1">
            <div className="flex items-center gap-2 font-mono text-[12px] text-violet-300">
              <FileText className="h-3 w-3" />
              <span>loaded memory</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{msg.path}</span>
            </div>
            <pre className="mt-1 ml-5 max-h-48 overflow-auto whitespace-pre-wrap border-l-2 border-violet-700/40 pl-3 font-mono text-[11.5px] leading-6 text-slate-400">
              {msg.preview}
            </pre>
          </div>
        </PinTrigger>
      );

    default:
      return null;
  }
}
