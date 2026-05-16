"use client";

import { CommandHints } from "./CommandHints";
import { InputBar } from "./InputBar";
import { MessageList } from "./MessageList";

export function Terminal() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 font-mono text-slate-200">
      <MessageList />
      <CommandHints />
      <InputBar />
    </div>
  );
}
