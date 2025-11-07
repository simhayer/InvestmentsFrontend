// components/portfolio/PortfolioOverview.tsx
"use client";

import * as React from "react";
import { getPortfolioSummary } from "@/utils/portfolioService";
import { keysToCamel } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";
import { TopHoldings } from "@/components/holdings/top-holdings";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioSummary } from "@/types/portfolio-summary";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { PriceStatusBadge, StackedBar, KeyVal, TimeAgo } from "./_bits";
import { Badge } from "@/components/ui/badge";

type Props = { currency?: "USD" | "CAD" };

const currencyFmt = (n: number | null | undefined, ccy?: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: ccy || "USD",
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));

const pctFmt = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(2)}%`;

const plColor = (v: number | null | undefined) =>
  v == null
    ? undefined
    : v > 0
    ? "text-emerald-600"
    : v < 0
    ? "text-rose-600"
    : undefined;

export function PortfolioOverview({ currency = "USD" }: Props) {
  const [data, setData] = React.useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const raw = await getPortfolioSummary({ currency, signal });
        const summary = keysToCamel(raw) as unknown as PortfolioSummary;
        setData(summary);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        toast({
          title: "Error",
          description: "Failed to load portfolio overview.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [currency]
  );

  React.useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading && !data) {
    return (
      <section className="p-4">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-80 w-full rounded-md" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="p-4">
        <h2 className="mb-3 text-lg font-semibold">Portfolio Overview</h2>
        <div className="text-sm text-muted-foreground">—</div>
      </section>
    );
  }

  const ccy =
    (data as any).requestedCurrency || (data as any).currency || currency;
  const asOf = (data as any).asOf ? new Date((data as any).asOf * 1000) : null;

  return (
    <section className="grid gap-4">
      {/* Header & KPIs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle></CardTitle>
            <div className="flex items-center gap-2">
              <PriceStatusBadge status={(data as any).priceStatus} />
              <Badge variant="secondary">
                {asOf ? `As of ${asOf.toLocaleString()}` : "As of —"}
              </Badge>
              <Badge variant="outline">{ccy}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-3xl font-bold">
              {currencyFmt((data as any).marketValue, ccy)}
            </div>
            <div className="ml-auto grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
              <KPI
                label="Total Return"
                value={currencyFmt((data as any).unrealizedPl ?? 0, ccy)}
                sub={pctFmt((data as any).unrealizedPlPct)}
                className={plColor((data as any).unrealizedPl ?? 0)}
              />
              <KPI
                label="Today's Return"
                value={currencyFmt((data as any).dayPl ?? 0, ccy)}
                sub={pctFmt((data as any).dayPlPct)}
                className={plColor((data as any).dayPl ?? 0)}
              />
              <KPI
                label="Positions"
                value={String((data as any).positionsCount ?? 0)}
              />
            </div>
          </div>

          {/* Allocations */}
          <div className="grid md:grid-cols-2 gap-4">
            <AllocCard
              title="Allocation by Type"
              items={(data as any).allocations?.byType ?? []}
            />
            <AllocCard
              title="Allocation by Account"
              items={(data as any).allocations?.byAccount ?? []}
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Holdings */}
      <TopHoldings holdings={(data as any).topPositions} loading={loading} />

      {/* Connections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Connections</CardTitle>
          <CardDescription>Your linked institutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!(data as any).connections?.length && (
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              No connections yet. Connect an account to see live data.
            </div>
          )}
          {(data as any).connections?.map((c: any) => {
            // Treat "synced_at" older than 30 days as stale
            const stale =
              c.syncedAt &&
              Date.now() - new Date(c.syncedAt).getTime() >
                1000 * 60 * 60 * 24 * 30;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <div className="font-medium">{c.institutionName}</div>
                  <div className="text-xs text-muted-foreground">
                    Added <TimeAgo iso={c.createdAt} /> • Last sync{" "}
                    <TimeAgo iso={c.syncedAt} />
                  </div>
                </div>
                <Badge variant={stale ? "destructive" : "secondary"}>
                  {stale ? "Stale" : "Healthy"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

function KPI({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className="rounded-md border p-3 min-w-[10rem]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${className ?? ""}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function AllocCard({
  title,
  items,
}: {
  title: string;
  items: { key: string; value?: number; weight: number }[];
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <StackedBar
        items={items.map((i) => ({ key: i.key, weight: i.weight }))}
      />
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {items.map((i) => (
          <KeyVal key={i.key} k={i.key} v={`${i.weight.toFixed(2)}%`} />
        ))}
      </div>
    </div>
  );
}

export default PortfolioOverview;
