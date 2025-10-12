import * as React from "react";
import {
  getPortfolioSummary,
  PortfolioSummary,
} from "@/utils/portfolioService";
import { keysToCamel } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";
import { TopHoldings } from "@/components/holdings/top-holdings";
import { Skeleton } from "../ui/skeleton";

type Props = {
  currency?: "USD" | "CAD";
};

const currencyFmt = (n: number | null | undefined, ccy: "USD" | "CAD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: ccy }).format(
    Number(n ?? 0)
  );

const pctFmt = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(2)}%`;

const plColor = (v: number | null | undefined) =>
  v == null
    ? undefined
    : v > 0
    ? "color: var(--pl-pos, #16a34a)"
    : v < 0
    ? "color: var(--pl-neg, #dc2626)"
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
        console.log("Fetched portfolio summary:", summary);
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

  const asOfStr = React.useMemo(() => {
    if (!data?.asOf) return "";
    const d = new Date(data.asOf * 1000);
    return d.toLocaleString();
  }, [data?.asOf]);

  if (loading && !data) {
    return (
      <section style={{ padding: 16 }}>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-80 w-full rounded-md" />
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: 16 }}>
        <h2 style={{ margin: "0 0 12px" }}>Portfolio Overview</h2>
        <div>—</div>
      </section>
    );
  }

  const ccy = data.currency;

  return (
    <section style={{ padding: 16, display: "grid", gap: 16 }}>
      {/* <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 12 }}>
          As of {asOfStr} · {ccy}
        </div>
      </header> */}

      {/* KPI Grid */}
      <div className="flex flex-wrap justify-between items-center px-6 sm:px-8 lg:px-10 lg:mr-20">
        <h1 className="m-0 font-bold text-3xl">
          {currencyFmt(data.marketValue, ccy)}
        </h1>
        <KPI
          label="Total Return"
          value={currencyFmt(data.unrealizedPl ?? 0, ccy)}
          sub={pctFmt(data.unrealizedPlPct)}
          style={plColor(data.unrealizedPl ?? 0)}
        />
        <KPI
          label="Today's Return"
          value={currencyFmt(data.dayPl ?? 0, ccy)}
          sub={pctFmt(data.dayPlPct)}
          style={plColor(data.dayPl ?? 0)}
        />
        {/* <KPI label="Positions" value={String(data.positionsCount)} /> */}
      </div>

      {/* Allocations */}
      <div>
        {/* <AllocationsPie
          data={data.allocations.byType}
          currency={ccy}
          className="md:col-span-2"
        /> */}
        {/* in future if we ever want to show bya account */}
        {/* <AllocationsPie
          data={data.allocations.byAccount}
          currency={ccy}
          className="md:col-span-2"
        /> */}
      </div>

      {/* Top Positions */}
      <TopHoldings holdings={data.topPositions} loading={loading} />
    </section>
  );
}

function KPI(props: {
  label: string;
  value: string;
  sub?: string;
  style?: string | React.CSSProperties;
}) {
  const style =
    typeof props.style === "string"
      ? parseInlineStyles(props.style)
      : props.style;
  return (
    <div
      style={{
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginTop: 4,
          ...(style || {}),
        }}
      >
        {props.value}
      </div>
      {props.sub && (
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
          {props.sub}
        </div>
      )}
    </div>
  );
}

function parseInlineStyles(s?: string): React.CSSProperties | undefined {
  if (!s) return undefined;
  // super small parser for "color: #hex" shape
  return s.split(";").reduce((acc, pair) => {
    const [k, v] = pair.split(":").map((x) => x?.trim());
    if (!k || !v) return acc;
    (acc as any)[k as any] = v;
    return acc;
  }, {} as React.CSSProperties);
}

export default PortfolioOverview;
