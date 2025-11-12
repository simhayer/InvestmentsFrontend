import * as React from "react";
import type { MetricsLayer } from "@/types/portfolio-ai";

export function PortfolioMetricsTab({ data }: { data: MetricsLayer }) {
  if (!data) return <Empty msg="No metrics available." />;
  const p = data.portfolio;
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          ["Total Value", p.total_value, "currency"],
          ["Cash", p.cash_value, "currency"],
          ["30D Vol", p.vol_30D_pct, "pct"],
          ["Positions", p.num_positions, "int"],
          ["Top 5 Concentration", p.concentration_top_5_pct, "pct"],
          ["Max DD (1Y)", p.max_drawdown_1Y_pct, "pct"],
        ].map(([label, val, type]) => (
          <Metric
            key={label as string}
            label={label as string}
            value={val as number}
            type={type as any}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <KVCard title="Region Weights" kv={data.portfolio.region_weights_pct} />
        <KVCard title="Sector Weights" kv={data.portfolio.sector_weights_pct} />
        <KVCard
          title="Asset Class Weights"
          kv={data.portfolio.asset_class_weights_pct}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: "pct" | "currency" | "int";
}) {
  const fmt =
    type === "pct"
      ? `${value.toFixed(2)}%`
      : type === "currency"
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : `${value}`;
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-lg font-semibold">{fmt}</div>
    </div>
  );
}

function KVCard({ title, kv }: { title: string; kv: Record<string, number> }) {
  const entries = Object.entries(kv).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <div className="text-sm">{k}</div>
            <div className="text-sm font-semibold">{v.toFixed(2)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
