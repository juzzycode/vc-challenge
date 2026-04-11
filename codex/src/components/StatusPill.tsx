export function StatusPill({ tone, children }: { tone: "good" | "warn" | "bad" | "neutral"; children: React.ReactNode }) {
  const tones = {
    good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    warn: "bg-amber-50 text-amber-900 ring-amber-200",
    bad: "bg-red-50 text-red-800 ring-red-200",
    neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200"
  };
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>{children}</span>;
}
