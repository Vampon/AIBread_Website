"use client";

import { useEffect, useRef } from "react";
import { useSimulator } from "./SimulatorContext";
import { Banner } from "./Banner";
import { MessageBubble } from "./MessageBubble";
import { PermissionDialog } from "./PermissionDialog";
import { ToolCallBlock } from "./ToolCallBlock";

export function MessageList() {
  const state = useSimulator();
  const ref = useRef<HTMLDivElement>(null);

  // 自动滚到底（消息数量、phase 队列长度、待决权限变化时）
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [
    state.messages.length,
    state.pendingPermission,
    state.phaseQueue.length,
  ]);

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{ scrollbarColor: "#475569 transparent" }}
    >
      <Banner />

      {state.messages.length === 0 && !state.pendingPermission && (
        <div className="mt-3 px-1 font-mono text-[11.5px] leading-6 text-slate-500">
          <span className="text-slate-600">※ </span>
          下面敲点什么，或点提示按钮开始体验。所有命令都是模拟，不会真的执行。
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {state.messages.map((msg) => {
          if (msg.kind === "tool-call") {
            return <ToolCallBlock key={msg.id} msg={msg} />;
          }
          return <MessageBubble key={msg.id} msg={msg} />;
        })}

        {state.pendingPermission && <PermissionDialog />}

        {state.isProcessing && !state.pendingPermission && <TypingIndicator />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-1 font-mono text-[12px] text-slate-500">
      <span className="animate-pulse text-amber-400/80">✻</span>
      <span className="italic">Thinking</span>
      <span className="inline-flex gap-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-slate-500" />
      </span>
    </div>
  );
}
