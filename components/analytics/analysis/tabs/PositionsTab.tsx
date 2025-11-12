import * as React from "react";
import type { AiLayers } from "@/types/portfolio-ai";
import { listPositions } from "@/utils/aiService";

export function PositionsTab({ data }: { data: AiLayers }) {
  const rows = listPositions(data);
  if (!rows.length) return <Empty msg="No positions to display." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left sticky top-0 bg-background">
          <tr className="border-b">
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
              <th key={h} className="py-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol} className="border-b hover:bg-muted/50">
              <td className="py-2 pr-4 font-medium">{r.symbol}</td>
              <td className="py-2 pr-4 opacity-80">{r.name}</td>
              <td className="py-2 pr-4">{r.weight_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">${r.market_value.toLocaleString()}</td>
              <td
                className={`py-2 pr-4 ${
                  r.unrealized_pnl_pct >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {r.unrealized_pnl_pct.toFixed(2)}%
              </td>
              <td className="py-2 pr-4">{r.return_1D_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">{r.return_1W_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">{r.return_1M_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">{r.return_1Y_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">{r.vol_30D_pct.toFixed(2)}%</td>
              <td className="py-2 pr-4">{r.max_drawdown_1Y_pct.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
