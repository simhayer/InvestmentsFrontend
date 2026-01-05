"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Link2 } from "lucide-react";

import { getPortfolioSummary } from "@/utils/portfolioService";
import { keysToCamel, fmtCurrency, fmtPct } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";

import { TopHoldings } from "@/components/holdings/top-holdings";
import { Skeleton } from "@/components/ui/skeleton";
import type { PortfolioSummary } from "@/types/portfolio-summary";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Page } from "@/components/layout/Page";
import { StackedBar, KeyVal, TimeAgo } from "./_bits";
import { AnalysisSummaryCard } from "./ai-summary-card";
import { Provider } from "@radix-ui/react-toast";
import ProviderAvatar from "../layout/ProviderAvatar";

export function PortfolioOverview() {
  const [data, setData] = React.useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(
    async (signal?: AbortSignal, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const raw = await getPortfolioSummary({ signal });
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
        if (!opts?.silent) setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading && !data) return <LoadingShell />;

  if (!data) {
    return (
      <Page>
        <EmptyState
          title="Portfolio Overview"
          description="We couldn't load your portfolio right now."
          actionLabel="Retry"
          onAction={() => load(undefined)}
        />
      </Page>
    );
  }

  const ccy = (data as any).currency || "USD";

  return (
    <Page className="space-y-6">
      {/* UNIFIED GRID SYSTEM 
          Using a consistent ratio (2.1 to 0.9) ensures all cards in the left 
          and right columns align perfectly.
      */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[2.1fr_0.9fr]">
        {/* Main Column (Hero + AI) */}
        <div className="flex flex-col gap-6 min-w-0">
          <PortfolioSummaryHero data={data} ccy={ccy} />
          <AnalysisSummaryCard />
        </div>

        {/* Sidebar Rail (Connections + Holdings + Allocation) */}
        <div className="flex flex-col gap-6">
          <ConnectionsCard connections={(data as any).connections} compact />

          <TopHoldings
            holdings={(data as any).topPositions}
            loading={loading}
            currency={ccy}
          />

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Portfolio Allocation
            </h3>
            <AllocationSection allocations={(data as any).allocations} />
          </div>
        </div>
      </div>
    </Page>
  );
}

// --- Sub-components remain largely the same, but with refined spacing ---

function LoadingShell() {
  return (
    <Page className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2.1fr_0.9fr]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </Page>
  );
}

function EmptyState({ title, description, actionLabel, onAction }: any) {
  return (
    <Card className="rounded-3xl border-neutral-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button onClick={onAction} className="rounded-xl">
          {actionLabel}
        </Button>
        <Button asChild variant="outline" className="rounded-xl bg-white">
          <Link href="/connections">Go to Connections</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PortfolioSummaryHero({
  data,
  ccy,
}: {
  data: PortfolioSummary;
  ccy: string;
}) {
  const totalReturn = (data as any).unrealizedPl ?? 0;
  const totalReturnPct = (data as any).unrealizedPlPct;
  const dayReturn = (data as any).dayPl ?? 0;
  const dayReturnPct = (data as any).dayPlPct;

  const toneClass = (v?: number | null) => {
    if (v == null) return "text-neutral-600";
    if (v > 0) return "text-emerald-700";
    if (v < 0) return "text-rose-700";
    return "text-neutral-700";
  };

  return (
    <Card className="relative rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1">
              Total Portfolio Value
            </div>
            <div className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {fmtCurrency((data as any).marketValue, ccy)}
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <MiniStat
              label="Total return"
              value={fmtCurrency(totalReturn, ccy)}
              delta={fmtPct(totalReturnPct)}
              deltaClass={toneClass(totalReturn)}
            />
            <div className="hidden sm:block h-8 w-px bg-neutral-200/70" />
            <MiniStat
              label="Today's Change"
              value={fmtCurrency(dayReturn, ccy)}
              delta={fmtPct(dayReturnPct)}
              deltaClass={toneClass(dayReturn)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, delta, deltaClass }: any) {
  return (
    <div className="flex items-baseline justify-between gap-3 sm:block">
      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold text-neutral-900">{value}</div>
        {delta && (
          <div className={cn("text-sm font-medium", deltaClass)}>{delta}</div>
        )}
      </div>
    </div>
  );
}

function AllocationSection({ allocations }: any) {
  const byType = allocations?.byType ?? [];
  const byAccount = allocations?.byAccount ?? [];
  return (
    <div className="grid gap-4 lg:grid-cols-1">
      <AllocCard title="By Asset Type" items={byType} />
      <AllocCard title="By Account" items={byAccount} />
    </div>
  );
}

function AllocCard({ title, items }: any) {
  const hasData = (items?.length ?? 0) > 0;
  return (
    <Card className="rounded-3xl border-neutral-200/80 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-neutral-900 mb-3">{title}</p>
        {hasData ? (
          <>
            <StackedBar
              items={items.map((i: any) => ({ key: i.key, weight: i.weight }))}
              height={10}
            />
            <div className="mt-3 space-y-1.5">
              {items.slice(0, 3).map((i: any) => (
                <div key={i.key} className="flex justify-between text-xs">
                  <span className="text-neutral-500">{i.key}</span>
                  <span className="font-medium text-neutral-900">
                    {i.weight.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-xs text-neutral-400 italic">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionsCard({ connections, compact }: any) {
  const hasConnections = (connections?.length ?? 0) > 0;
  return (
    <Card className="rounded-3xl border-neutral-200/80 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Connections
          </CardTitle>
          <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
            <Link href="/connections">Manage</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {!hasConnections && (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl border-dashed"
          >
            <Link href="/connections" className="text-xs">
              Connect Account
            </Link>
          </Button>
        )}
        {connections?.slice(0, 2).map((c: any) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ProviderAvatar name={c.institutionName} className="h-10 w-10" />
              <div className="truncate text-sm font-medium text-neutral-700">
                {c.institutionName}
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
