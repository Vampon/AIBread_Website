type Props = {
  value: string;
  label: string;
  hint?: string;
};

export function StatCard({ value, label, hint }: Props) {
  return (
    <div className="group rounded-2xl border border-bread-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-bread-300 hover:bg-bread-50">
      <div className="text-4xl font-bold tracking-tight text-bread-900 md:text-5xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-bread-900/70">{label}</div>
      {hint && (
        <div className="mt-1 text-xs text-bread-900/50">{hint}</div>
      )}
    </div>
  );
}
