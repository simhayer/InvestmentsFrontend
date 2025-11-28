import * as React from "react";

export function RebalancePathsTab({
  data,
}: {
  data: Record<
    string,
    {
      actions: string[];
      summary: string;
      risk_flags: string[];
      allocation_notes: string[];
    }
  >;
}) {
  const entries = Object.entries(data ?? {});
  if (!entries.length) return <Empty msg="No rebalance paths available." />;
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
          Rebalance paths
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Scenario-based allocation options with actions, risk flags, and notes. Use these to
          scan diversification, concentration, and liquidity levers quickly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(([name, r]) => (
          <div
            key={name}
            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 capitalize">
                  {name.replaceAll("_", " ")}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed max-w-xl">
                  {r.summary}
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Path
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-3">
                <Section title="Actions" items={r.actions} />
                <Section title="Notes" items={r.allocation_notes} />
              </div>
              <Section title="Risk Flags" items={r.risk_flags} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  const tone =
    title === "Risk Flags"
      ? "border-amber-200 bg-amber-50/70 text-amber-900"
      : "border-slate-200 bg-slate-50/60 text-slate-800";
  return (
    <div
      className={`rounded-2xl border ${tone} p-3 shadow-sm`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.08em] mb-2">
        {title}
      </div>
      <ul className="space-y-1.5 text-sm leading-relaxed">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {msg}
    </div>
  );
}
