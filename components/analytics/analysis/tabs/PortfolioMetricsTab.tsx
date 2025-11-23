import * as React from "react";
import type { MetricsLayer } from "@/types/portfolio-ai";

export function PortfolioMetricsTab({ data }: { data: MetricsLayer }) {
  if (!data) return <Empty msg="No metrics available." />;
  const p = data.portfolio;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
              Portfolio pulse
            </p>
            <p className="text-sm text-slate-600">
              Value, liquidity, volatility, and concentration
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 md:inline">
            Auto-updated from positions
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
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
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.06em] text-slate-500">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900">{fmt}</div>
    </div>
  );
}

function KVCard({ title, kv }: { title: string; kv: Record<string, number> }) {
  const entries = Object.entries(kv).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-3">{title}</div>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{k}</span>
              <span className="font-semibold text-slate-900">
                {v.toFixed(2)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900"
                style={{ width: `${Math.min(100, Math.max(0, v))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
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
