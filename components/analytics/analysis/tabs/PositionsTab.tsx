import * as React from "react";
import type { AiLayers } from "@/types/portfolio-ai";
import { listPositions } from "@/utils/aiService";
import { fmtPct, fmtCurrency } from "@/utils/format";

export function PositionsTab({ data }: { data: AiLayers }) {
  const rows = listPositions(data);
  if (!rows.length) return <Empty msg="No positions to display." />;

  const badge = (status?: string | null) => {
    const s = (status || "").toLowerCase();
    const cls =
      s === "live"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-50 text-slate-600 border-slate-200";
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${cls}`}
      >
        {status || "unknown"}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
            Positions
          </p>
          <p className="text-sm text-slate-600">
            Weights, value, daily move, and profit/loss
          </p>
        </div>
        <span className="hidden text-xs text-slate-500 md:inline">
          Scroll to view all columns
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left sticky top-0 bg-slate-50">
            <tr className="border-b border-slate-200">
              {[
                "Symbol",
                "Name",
                "Type",
                "Weight",
                "Market Value",
                "Avg Cost",
                "Unrlzd P/L",
                "Unrlzd P/L %",
                "Day %",
                "Day P/L",
                "Price",
                "Status",
              ].map((h) => (
                <th key={h} className="py-2 px-3 font-semibold text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const up = r.unrealized_pnl_abs;
              const upp = r.unrealized_pnl_pct;
              const dayPct = r.return_1D_pct ?? null; // if you compute it; otherwise it stays —
              const dayPL = (r as any).day_pl ?? null; // if your listPositions includes day_pl

              const plColor =
                upp == null
                  ? "text-slate-600"
                  : upp >= 0
                  ? "text-emerald-600"
                  : "text-rose-600";
              const dayColor =
                dayPct == null
                  ? "text-slate-600"
                  : dayPct >= 0
                  ? "text-emerald-600"
                  : "text-rose-600";

              return (
                <tr
                  key={r.symbol}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {r.symbol}
                  </td>
                  <td className="py-2 px-3 text-slate-700">{r.name}</td>
                  <td className="py-2 px-3 text-slate-700">
                    {(r.asset_class || "other").toString()}
                  </td>

                  <td className="py-2 px-3">{fmtPct(r.weight_pct)}</td>
                  <td className="py-2 px-3">{fmtCurrency(r.market_value)}</td>

                  <td className="py-2 px-3">
                    {fmtCurrency((r as any).purchase_unit_price ?? null)}
                  </td>
                  <td className={`py-2 px-3 ${plColor}`}>{fmtCurrency(up)}</td>
                  <td className={`py-2 px-3 ${plColor}`}>{fmtPct(upp)}</td>

                  <td className={`py-2 px-3 ${dayColor}`}>{fmtPct(dayPct)}</td>
                  <td className={`py-2 px-3 ${dayColor}`}>
                    {fmtCurrency(dayPL)}
                  </td>
                  <td className="py-2 px-3">
                    {fmtCurrency((r as any).current_price ?? null)}
                  </td>
                  <td className="py-2 px-3">
                    {badge((r as any).price_status ?? null)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
