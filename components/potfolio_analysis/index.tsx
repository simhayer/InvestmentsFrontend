"use client";
import { useMemo } from "react";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function pct(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(2)}%`;
}
function money(n?: number | null, currency = "USD") {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(n);
}

// simple color mapping
const ratingStyles: Record<string, string> = {
  strong: "bg-emerald-100 text-emerald-700",
  balanced: "bg-blue-100 text-blue-700",
  concentrated: "bg-amber-100 text-amber-700",
  risky: "bg-red-100 text-red-700",
  needs_rebalance: "bg-orange-100 text-orange-700",
};
const riskStyles: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-700",
};

export function PortfolioAnalysisCard() {
  const { data, loading, error, refetch, refetching } = usePortfolioAnalysis();

  // Detect a dominant currency for formatting totals (fallback to USD)
  const currency = useMemo(() => {
    if (!data || "error" in data) return "USD";
    const cur = data.exposures.by_currency?.[0]?.currency || "USD";
    try {
      // Validate currency code by formatting a test amount
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur,
      }).format(1);
      return cur;
    } catch {
      return "USD";
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Portfolio Analysis</CardTitle>
          <Button variant="outline" onClick={refetch} disabled={refetching}>
            {refetching ? "Retrying..." : "Retry"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            {error || "Failed to load portfolio analysis."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if ("error" in data) {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Portfolio Analysis</CardTitle>
          <Button variant="outline" onClick={refetch} disabled={refetching}>
            {refetching ? "Retrying..." : "Retry"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">Analyzer error: {data.error}</p>
          {data.raw ? (
            <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
              {data.raw}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const { totals, rating, risk_level, diversification_score, rationale } = data;

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>Portfolio Analysis</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("capitalize", ratingStyles[rating] || "")}>
              Rating: {rating.replace("_", " ")}
            </Badge>
            <Badge className={cn("capitalize", riskStyles[risk_level] || "")}>
              Risk: {risk_level}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              Diversification: {Math.round(diversification_score)}/100
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rationale}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={refetching}>
            {refetching ? "Refreshing…" : "Refresh analysis"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Totals */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Totals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Market Value</div>
              <div className="text-lg font-semibold">
                {money(totals.market_value, currency)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Cost Basis</div>
              <div className="text-lg font-semibold">
                {money(totals.cost_basis, currency)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">P&L (abs)</div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  (totals.pnl_abs ?? 0) >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                )}
              >
                {money(totals.pnl_abs, currency)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">P&L (%)</div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  (totals.pnl_pct ?? 0) >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                )}
              >
                {pct(totals.pnl_pct)}
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Exposures */}
        <section className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              By Type
            </h3>
            <ul className="space-y-1">
              {data.exposures.by_type.map((x) => (
                <li key={x.type} className="flex justify-between text-sm">
                  <span className="capitalize">{x.type}</span>
                  <span className="tabular-nums">{pct(x.weight_pct)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              By Currency
            </h3>
            <ul className="space-y-1">
              {data.exposures.by_currency.map((x) => (
                <li key={x.currency} className="flex justify-between text-sm">
                  <span className="uppercase">{x.currency}</span>
                  <span className="tabular-nums">{pct(x.weight_pct)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              By Institution
            </h3>
            <ul className="space-y-1">
              {data.exposures.by_institution.map((x) => (
                <li
                  key={x.institution}
                  className="flex justify-between text-sm"
                >
                  <span>{x.institution}</span>
                  <span className="tabular-nums">{pct(x.weight_pct)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Separator />

        {/* Top positions */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Top Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left font-medium py-2">Symbol</th>
                  <th className="text-right font-medium py-2">Weight</th>
                  <th className="text-right font-medium py-2">P&L (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.top_positions.map((p) => (
                  <tr key={p.symbol} className="border-t">
                    <td className="py-2">{p.symbol}</td>
                    <td className="py-2 text-right tabular-nums">
                      {pct(p.weight_pct)}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right tabular-nums",
                        (p.pnl_pct ?? 0) >= 0
                          ? "text-emerald-700"
                          : "text-red-700"
                      )}
                    >
                      {pct(p.pnl_pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Separator />

        {/* Suggestions & Notes */}
        <section className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Suggestions</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Data Notes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {data.data_notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
      </CardContent>
    </Card>
  );
}
