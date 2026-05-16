"use client";

import { useState } from "react";
import { Lightbulb, MonitorPlay } from "lucide-react";
import {
  ArticleMap,
  SimulatorProvider,
  useSimulator,
} from "./SimulatorContext";
import { Explainer } from "./Explainer";
import { Terminal } from "./Terminal";

export function Simulator({ articleMap }: { articleMap?: ArticleMap }) {
  return (
    <SimulatorProvider articleMap={articleMap}>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/40">
        {/* 桌面 ≥ md：左终端右原理 60/40 */}
        <div className="hidden md:grid md:grid-cols-[3fr_2fr]">
          <div className="h-[640px] border-r border-slate-800">
            <Terminal />
          </div>
          <div className="h-[640px]">
            <Explainer />
          </div>
        </div>

        {/* 移动 < md：tab 切换 */}
        <div className="md:hidden">
          <MobileTabs />
        </div>
      </div>
    </SimulatorProvider>
  );
}

function MobileTabs() {
  const [tab, setTab] = useState<"terminal" | "explainer">("terminal");
  const state = useSimulator();
  const explainHasUpdate =
    tab === "terminal" &&
    !!(state.pinnedExplainId ?? state.explainId);

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col">
      <div className="flex border-b border-slate-800 bg-slate-950/80">
        <TabButton
          active={tab === "terminal"}
          onClick={() => setTab("terminal")}
          icon={<MonitorPlay className="h-3.5 w-3.5" />}
          label="终端"
        />
        <TabButton
          active={tab === "explainer"}
          onClick={() => setTab("explainer")}
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          label="为什么"
          dot={explainHasUpdate}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "terminal" ? <Terminal /> : <Explainer />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs transition-colors ${
        active
          ? "border-b-2 border-amber-400 text-amber-300"
          : "border-b-2 border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {icon}
      {label}
      {dot && (
        <span className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
      )}
    </button>
  );
}
