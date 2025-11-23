import * as React from "react";
import type { AiLayers } from "@/types/portfolio-ai";
import { listPositions } from "@/utils/aiService";

export function PositionsTab({ data }: { data: AiLayers }) {
  const rows = listPositions(data);
  if (!rows.length) return <Empty msg="No positions to display." />;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
            Positions
          </p>
          <p className="text-sm text-slate-600">Weights, performance, and risk</p>
        </div>
        <span className="hidden text-xs text-slate-500 md:inline">
          Scroll to view all columns
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left sticky top-0 bg-slate-50">
            <tr className="border-b border-slate-200">
              {[
                "Symbol",
                "Name",
                "Weight",
                "Market Value",
                "Unrlzd P/L %",
                "1D %",
                "1W %",
                "1M %",
                "1Y %",
                "Vol 30D",
                "Max DD (1Y)",
              ].map((h) => (
                <th key={h} className="py-2 px-3 font-semibold text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.symbol}
                className="border-b border-slate-100 transition hover:bg-slate-50"
              >
                <td className="py-2 px-3 font-semibold text-slate-900">
                  {r.symbol}
                </td>
                <td className="py-2 px-3 text-slate-700">{r.name}</td>
                <td className="py-2 px-3">{r.weight_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">${r.market_value.toLocaleString()}</td>
                <td
                  className={`py-2 px-3 ${
                    r.unrealized_pnl_pct >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {r.unrealized_pnl_pct.toFixed(2)}%
                </td>
                <td className="py-2 px-3">{r.return_1D_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">{r.return_1W_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">{r.return_1M_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">{r.return_1Y_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">{r.vol_30D_pct.toFixed(2)}%</td>
                <td className="py-2 px-3">{r.max_drawdown_1Y_pct.toFixed(2)}%</td>
              </tr>
            ))}
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
