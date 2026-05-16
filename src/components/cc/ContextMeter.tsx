export function ContextMeter({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const color =
    clamped >= 80
      ? "bg-amber-400"
      : clamped >= 60
      ? "bg-amber-500"
      : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] uppercase tracking-wider text-slate-500">
        上下文
      </span>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-700 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-slate-400">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
