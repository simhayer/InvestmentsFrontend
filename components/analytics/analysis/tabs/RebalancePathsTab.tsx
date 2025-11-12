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
    <div className="grid md:grid-cols-2 gap-3">
      {entries.map(([name, r]) => (
        <div key={name} className="rounded-xl border p-3">
          <div className="text-sm font-semibold mb-1 capitalize">
            {name.replaceAll("_", " ")}
          </div>
          <div className="text-xs opacity-70 mb-2">{r.summary}</div>
          <Section title="Actions" items={r.actions} />
          <Section title="Risk Flags" items={r.risk_flags} />
          <Section title="Notes" items={r.allocation_notes} />
        </div>
      ))}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <div className="text-xs font-medium mb-1">{title}</div>
      <ul className="list-disc list-inside text-sm opacity-90">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
