import * as React from "react";
import type { MetricsLayer } from "@/types/portfolio-ai";
import { fmtPct } from "@/utils/format";

export function PortfolioMetricsTab({ data }: { data: MetricsLayer }) {
  if (!data) return <Empty msg="No metrics available." />;

  const p = data.portfolio;

  // Biggest winner/loser by unrealized P/L %
  const symbols = Object.values(data.per_symbol || {});
  const withPL = symbols.filter(
    (s: any) => typeof s?.unrealized_pnl_pct === "number"
  );
  const biggestWinner = withPL.length
    ? [...withPL].sort(
        (a: any, b: any) => b.unrealized_pnl_pct - a.unrealized_pnl_pct
      )[0]
    : null;
  const biggestLoser = withPL.length
    ? [...withPL].sort(
        (a: any, b: any) => a.unrealized_pnl_pct - b.unrealized_pnl_pct
      )[0]
    : null;

  // Top position weight
  const topWeight = symbols.length
    ? Math.max(
        ...symbols.map((s: any) =>
          typeof s?.weight_pct === "number" ? s.weight_pct : 0
        )
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
              Portfolio overview
            </p>
            <p className="text-sm text-slate-600">
              Value, concentration, and mix
            </p>
          </div>
          <span className="hidden text-xs text-slate-500 md:inline">
            Based on live positions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="Total Value" value={p.total_value} type="currency" />
          <Metric label="Cash" value={p.cash_value} type="currency" />
          <Metric label="Positions" value={p.num_positions} type="int" />
          <Metric label="Top Position Weight" value={topWeight} type="pct" />
          <Metric
            label="Top 5 Concentration"
            value={p.concentration_top_5_pct}
            type="pct"
          />
          <Metric
            label="Biggest Winner"
            valueText={
              biggestWinner
                ? `${biggestWinner.symbol} (${fmtPct(
                    biggestWinner.unrealized_pnl_pct
                  )})`
                : "—"
            }
          />
          <Metric
            label="Biggest Loser"
            valueText={
              biggestLoser
                ? `${biggestLoser.symbol} (${fmtPct(
                    biggestLoser.unrealized_pnl_pct
                  )})`
                : "—"
            }
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <KVCard
          title="Asset Class Weights"
          kv={p.asset_class_weights_pct ?? {}}
        />
        <KVCard title="Sector Weights" kv={p.sector_weights_pct ?? {}} />
        <KVCard title="Region Weights" kv={p.region_weights_pct ?? {}} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  valueText,
  type,
}: {
  label: string;
  value?: number | null;
  valueText?: string;
  type?: "pct" | "currency" | "int";
}) {
  const fmt =
    valueText ??
    (value == null || !Number.isFinite(value)
      ? "—"
      : type === "pct"
      ? `${value.toFixed(2)}%`
      : type === "currency"
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : `${value}`);

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
  const entries = Object.entries(kv || {}).sort(
    (a, b) => (b[1] ?? 0) - (a[1] ?? 0)
  );
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900 mb-3">{title}</div>
        <div className="text-sm text-slate-600">—</div>
      </div>
    );
  }

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
