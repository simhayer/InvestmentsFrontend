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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200">
          {(["annual", "quarterly"] as const).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200">
          {(["income", "balance", "cash"] as const).map((s) => {
            const active = stmt === s;
            return (
              <button
                key={s}
                onClick={() => setStmt(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  active
                    ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <Card className="p-0 overflow-x-auto rounded-2xl border border-neutral-200/70 shadow-sm">
        {loading ? (
          <div className="p-5 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="p-5 text-sm text-rose-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-5 text-sm text-neutral-600">
            No financials available.
          </div>
        ) : (
          <div className="min-w-full overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Metric</th>
                  {rows.map((r, i) => (
                    <th
                      key={i}
                      className="text-right px-4 py-3 font-semibold whitespace-nowrap"
                    >
                      {r.date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
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
                      values={rows.map((r) =>
                        fmtCompact(r.operating_cash_flow)
                      )}
                    />
                    <Tr
                      label="Investing CF"
                      values={rows.map((r) =>
                        fmtCompact(r.investing_cash_flow)
                      )}
                    />
                    <Tr
                      label="Financing CF"
                      values={rows.map((r) =>
                        fmtCompact(r.financing_cash_flow)
                      )}
                    />
                    <Tr
                      label="Free Cash Flow"
                      values={rows.map((r) => fmtCompact(r.free_cash_flow))}
                    />
                  </>
                )}
              </tbody>
            </table>
          </div>
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
    <tr className="even:bg-neutral-50/60">
      <td className="px-4 py-3 text-neutral-700 font-semibold">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-right text-neutral-800">
          {v ?? "—"}
        </td>
      ))}
    </tr>
  );
}
