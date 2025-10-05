import * as React from "react";
import {
  getPortfolioSummary,
  PortfolioSummary,
} from "@/utils/portfolioService";
import { keysToCamel } from "@/utils/format";
import { toast } from "@/components/ui/use-toast";

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

const barWidth = (w: number | null | undefined) =>
  `${Math.max(0, Math.min(100, Number(w ?? 0)))}%`;

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
        <h2 style={{ margin: "0 0 12px" }}>Portfolio Overview</h2>
        <div>Loading…</div>
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
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h2 style={{ margin: 0 }}>Portfolio Overview</h2>
        <div style={{ opacity: 0.7, fontSize: 12 }}>
          As of {asOfStr} · {ccy}
        </div>
      </header>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <KPI label="Market Value" value={currencyFmt(data.marketValue, ccy)} />
        <KPI
          label="Unrealized P/L"
          value={currencyFmt(data.unrealizedPl ?? 0, ccy)}
          sub={pctFmt(data.unrealizedPlPct)}
          style={plColor(data.unrealizedPl ?? 0)}
        />
        <KPI
          label="Day P/L"
          value={currencyFmt(data.dayPl ?? 0, ccy)}
          sub={pctFmt(data.dayPlPct)}
          style={plColor(data.dayPl ?? 0)}
        />
        <KPI label="Positions" value={String(data.positionsCount)} />
      </div>

      {/* Allocations */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        <AllocationCard
          title="Allocation by Type"
          items={data.allocations.byType}
          currency={ccy}
        />
        <AllocationCard
          title="Allocation by Account"
          items={data.allocations.byAccount}
          currency={ccy}
        />
      </div>

      {/* Top Positions */}
      <div
        style={{
          border: "1px solid var(--border, #e5e7eb)",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Top Positions</div>
        {data.topPositions.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No positions</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid var(--border, #e5e7eb)",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Symbol</th>
                  <th style={{ padding: "8px 6px" }}>Name</th>
                  <th style={{ padding: "8px 6px" }}>Type</th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>
                    Value
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>
                    Weight
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>
                    Unrealized P/L
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "right" }}>
                    Day P/L
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topPositions.map((p, idx) => (
                  <tr
                    key={`${p.symbol}-${idx}`}
                    style={{ borderBottom: "1px solid var(--border, #f3f4f6)" }}
                  >
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>
                      {p.symbol}
                    </td>
                    <td style={{ padding: "8px 6px" }}>{p.name ?? "—"}</td>
                    <td style={{ padding: "8px 6px" }}>{p.type ?? "—"}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right" }}>
                      {currencyFmt(p.value, ccy)}
                    </td>
                    <td style={{ padding: "8px 6px", textAlign: "right" }}>
                      {p.weight == null ? "—" : `${p.weight.toFixed(2)}%`}
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        textAlign: "right",
                        ...(plColor(p.unrealizedPl)
                          ? {
                              color: (plColor(p.unrealizedPl) as any).replace(
                                "color: ",
                                ""
                              ),
                            }
                          : {}),
                      }}
                    >
                      {currencyFmt(p.unrealizedPl ?? 0, ccy)}
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        textAlign: "right",
                        ...(plColor(p.dayPl)
                          ? {
                              color: (plColor(p.dayPl) as any).replace(
                                "color: ",
                                ""
                              ),
                            }
                          : {}),
                      }}
                    >
                      {currencyFmt(p.dayPl ?? 0, ccy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refresh */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => load()}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 6,
            background: "var(--btn, #f9fafb)",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
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

function AllocationCard({
  title,
  items,
  currency,
}: {
  title: string;
  items: PortfolioSummary["allocations"]["byType"];
  currency: "USD" | "CAD";
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No data</div>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: 8,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {items.map((it) => (
            <li key={it.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 600 }}>{it.key}</span>
                <span>
                  {currencyFmt(it.value, currency)}
                  {it.weight != null ? ` · ${it.weight.toFixed(2)}%` : ""}
                </span>
              </div>
              <div
                style={{ height: 8, background: "#f3f4f6", borderRadius: 999 }}
              >
                <div
                  style={{
                    height: "100%",
                    width: barWidth(it.weight),
                    background: "#3b82f6",
                    borderRadius: 999,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
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
