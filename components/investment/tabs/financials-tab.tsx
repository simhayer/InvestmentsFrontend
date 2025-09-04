"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCompact } from "@/utils/format";
import { useFinancials } from "@/hooks/use-fundamentals";

export default function FinancialsTab({ symbol }: { symbol: string }) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");
  const [stmt, setStmt] = useState<"income" | "balance" | "cash">("income");
  const { data, loading, error } = useFinancials(symbol, period);

  const rows = (() => {
    if (!data) return [] as any[];
    const src =
      stmt === "income"
        ? data.income_statement
        : stmt === "balance"
        ? data.balance_sheet
        : data.cash_flow;
    // Show latest 4 periods
    return (src || []).slice(0, 4);
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
          {(["annual", "quarterly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs ${
                period === p
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
          {(["income", "balance", "cash"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStmt(s)}
              className={`px-2.5 py-1 text-xs capitalize ${
                stmt === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">
            No financials available.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2">Metric</th>
                {rows.map((r, i) => (
                  <th
                    key={i}
                    className="text-right px-4 py-2 whitespace-nowrap"
                  >
                    {r.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stmt === "income" && (
                <>
                  <Tr
                    label="Revenue"
                    values={rows.map((r) => fmtCompact(r.revenue))}
                  />
                  <Tr
                    label="Gross Profit"
                    values={rows.map((r) => fmtCompact(r.gross_profit))}
                  />
                  <Tr
                    label="Operating Income"
                    values={rows.map((r) => fmtCompact(r.operating_income))}
                  />
                  <Tr
                    label="Net Income"
                    values={rows.map((r) => fmtCompact(r.net_income))}
                  />
                  <Tr label="EPS" values={rows.map((r) => r.eps ?? "—")} />
                </>
              )}
              {stmt === "balance" && (
                <>
                  <Tr
                    label="Total Assets"
                    values={rows.map((r) => fmtCompact(r.total_assets))}
                  />
                  <Tr
                    label="Total Liabilities"
                    values={rows.map((r) => fmtCompact(r.total_liabilities))}
                  />
                  <Tr
                    label="Total Equity"
                    values={rows.map((r) => fmtCompact(r.total_equity))}
                  />
                  <Tr
                    label="Cash & Equivalents"
                    values={rows.map((r) => fmtCompact(r.cash))}
                  />
                  <Tr
                    label="Inventory"
                    values={rows.map((r) => fmtCompact(r.inventory))}
                  />
                  <Tr
                    label="Long-term Debt"
                    values={rows.map((r) => fmtCompact(r.long_term_debt))}
                  />
                </>
              )}
              {stmt === "cash" && (
                <>
                  <Tr
                    label="Operating CF"
                    values={rows.map((r) => fmtCompact(r.operating_cash_flow))}
                  />
                  <Tr
                    label="Investing CF"
                    values={rows.map((r) => fmtCompact(r.investing_cash_flow))}
                  />
                  <Tr
                    label="Financing CF"
                    values={rows.map((r) => fmtCompact(r.financing_cash_flow))}
                  />
                  <Tr
                    label="Free Cash Flow"
                    values={rows.map((r) => fmtCompact(r.free_cash_flow))}
                  />
                </>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Tr({
  label,
  values,
}: {
  label: string;
  values: (string | number | null | undefined)[];
}) {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-2 text-slate-600">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-2 text-right">
          {v ?? "—"}
        </td>
      ))}
    </tr>
  );
}
