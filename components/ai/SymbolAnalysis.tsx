// components/ai/AIPanel.tsx
"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ExternalLink,
  Newspaper,
  Info,
  AlertTriangle,
  LineChart,
  Calendar,
  Sparkles,
} from "lucide-react";

/* =========================
   Types for the NEW schema
========================= */

type LatestDev = {
  headline: string;
  date?: string;
  source?: string;
  url?: string;
  cause?: string;
  impact?: string;
  assets_affected?: string[];
};

type Catalyst = {
  date?: string;
  type?: string;
  description?: string;
  expected_direction?: string;
  magnitude_basis?: string;
  confidence?: number; // 0..1
};

type RiskItem = {
  risk: string;
  why_it_matters?: string;
  monitor?: string;
};

type Valuation = {
  multiples?: Record<string, number | string | null | undefined>;
  peer_set?: string[];
};

type Technicals = {
  trend?: string;
  levels?: { support?: number; resistance?: number };
  momentum?: { rsi?: number; comment?: string };
};

type KeyDate = { date?: string; event?: string };

type Scenarios = { bull?: string; base?: string; bear?: string };

type AnalysisShape = {
  summary?: string;
  latest_developments?: LatestDev[];
  catalysts?: Catalyst[];
  risks?: RiskItem[];
  valuation?: Valuation;
  technicals?: Technicals;
  key_dates?: KeyDate[];
  scenarios?: Scenarios;

  headline?: string;
  recommendation?: string;
  conviction?: number; // 0..1
};

/* =========================
   Helpers
========================= */

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function looseParse(input: unknown): AnalysisShape | null {
  if (isObj(input)) return input as AnalysisShape;
  if (typeof input === "string") {
    const s = input.indexOf("{");
    const e = input.lastIndexOf("}");
    const maybe = s >= 0 && e > s ? input.slice(s, e + 1) : input;
    try {
      const parsed = JSON.parse(maybe);
      return isObj(parsed) ? (parsed as AnalysisShape) : null;
    } catch {
      return null;
    }
  }
  return null;
}

function fmtNum(n: unknown) {
  const v = typeof n === "string" ? Number(n) : (n as number);
  if (typeof v === "number" && Number.isFinite(v)) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(v);
  }
  return String(n ?? "—");
}

function shortDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Citation = { title: string; url: string };
function makeCitations(devs: LatestDev[] | undefined): Citation[] {
  if (!Array.isArray(devs)) return [];
  const uniq = new Map<string, Citation>();
  for (const d of devs) {
    const key = d.url || d.headline || `${d.source}-${d.date}`;
    if (!key) continue;
    if (!uniq.has(key)) {
      uniq.set(key, {
        title: d.headline || d.source || "Source",
        url: d.url || "#",
      });
    }
  }
  return Array.from(uniq.values());
}

function SourcePill({ idx, cites }: { idx?: number; cites: Citation[] }) {
  if (!idx || idx < 1 || idx > cites.length) return null;
  const c = cites[idx - 1];
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      title={c.title}
    >
      <ExternalLink className="h-3 w-3" />
      <span>[{idx}]</span>
    </a>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function recBadgeClasses(rec?: string) {
  const r = (rec || "").toLowerCase();
  if (r === "buy")
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (r === "sell")
    return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
  if (r === "hold" || r === "neutral")
    return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "border-border bg-secondary text-secondary-foreground";
}

/* =========================
   Main Component
========================= */

export function SymbolAnalysis({
  symbol,
  name,
  analysis,
}: {
  symbol: string;
  name?: string | null;
  analysis: unknown;
}) {
  const data = useMemo(() => looseParse(analysis), [analysis]);

  if (!analysis) return null;

  if (!data) {
    return (
      <div className="mt-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">AI Analysis</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
            {typeof analysis === "string"
              ? analysis
              : JSON.stringify(analysis, null, 2)}
          </pre>
        </Card>
      </div>
    );
  }

  const {
    headline,
    recommendation,
    conviction,
    summary,
    latest_developments = [],
    catalysts = [],
    risks = [],
    valuation,
    technicals,
    key_dates = [],
    scenarios,
  } = data;

  const citations = makeCitations(latest_developments);
  const convictionPct =
    typeof conviction === "number" && conviction >= 0 && conviction <= 1
      ? Math.round(conviction * 100)
      : null;

  return (
    <div className="mt-4">
      <Card className="p-4 space-y-4 bg-card text-card-foreground">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium">
              AI Analysis {name ? `• ${name}` : ""} ({symbol?.toUpperCase?.()})
            </div>
          </div>
          <div className="flex items-center gap-3">
            {recommendation ? (
              <Badge
                variant="outline"
                className={`border ${recBadgeClasses(recommendation)}`}
              >
                {recommendation.toUpperCase()}
              </Badge>
            ) : null}
            {convictionPct !== null ? (
              <div className="flex items-center gap-2 min-w-[180px]">
                <div className="text-xs text-muted-foreground">Conviction</div>
                <div className="w-36 h-2 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${convictionPct}%` }}
                    aria-label={`Conviction ${convictionPct}%`}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Headline */}
        {headline ? (
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm">{headline}</p>
          </div>
        ) : null}

        {/* Summary */}
        {summary ? (
          <Section
            title="Summary"
            icon={<Newspaper className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="rounded-xl border border-border p-3 bg-card">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          </Section>
        ) : null}

        {/* Latest developments */}
        {latest_developments.length > 0 ? (
          <Section
            title="Latest developments"
            icon={<Newspaper className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {latest_developments.map((d, i) => {
                const citeIdx =
                  citations.findIndex(
                    (c) => c.url === d.url || c.title === d.headline
                  ) + 1 || undefined;
                return (
                  <div
                    key={String(d.url || d.headline || i) + "-" + i}
                    className="rounded-xl border border-border p-3 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{d.headline}</div>
                      <div className="text-[10px] text-muted-foreground shrink-0">
                        {shortDate(d.date)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground space-y-1">
                      {d.cause ? (
                        <div>
                          <span className="font-medium text-foreground">
                            Cause:
                          </span>{" "}
                          {d.cause}
                        </div>
                      ) : null}
                      {d.impact ? (
                        <div>
                          <span className="font-medium text-foreground">
                            Impact:
                          </span>{" "}
                          {d.impact}
                        </div>
                      ) : null}
                      {d.assets_affected?.length ? (
                        <div>
                          <span className="font-medium text-foreground">
                            Assets:
                          </span>{" "}
                          {d.assets_affected.join(", ")}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground">
                        {d.source || ""}
                      </div>
                      <SourcePill idx={citeIdx} cites={citations} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        ) : null}

        {/* Catalysts */}
        {catalysts.length > 0 ? (
          <Section
            title="Upcoming catalysts"
            icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {catalysts.map((c, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-3 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {c.type
                        ? c.type.charAt(0).toUpperCase() + c.type.slice(1)
                        : "Catalyst"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {shortDate(c.date)}
                    </div>
                  </div>
                  {c.description ? (
                    <div className="text-sm mt-1">{c.description}</div>
                  ) : null}
                  <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    {c.expected_direction ? (
                      <span>
                        <span className="font-medium text-foreground">
                          Direction:
                        </span>{" "}
                        {c.expected_direction}
                      </span>
                    ) : null}
                    {c.magnitude_basis ? (
                      <span>
                        <span className="font-medium text-foreground">
                          Basis:
                        </span>{" "}
                        {c.magnitude_basis}
                      </span>
                    ) : null}
                    {typeof c.confidence === "number" ? (
                      <span>
                        <span className="font-medium text-foreground">
                          Confidence:
                        </span>{" "}
                        {Math.round(c.confidence * 100)}%
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Risks */}
        {risks.length > 0 ? (
          <Section
            title="Key risks"
            icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
          >
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">{r.risk}:</span>{" "}
                    <span className="text-muted-foreground">
                      {[r.why_it_matters, r.monitor]
                        .filter(Boolean)
                        .join(" — ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* Valuation */}
        {valuation?.multiples || valuation?.peer_set ? (
          <Section
            title="Valuation"
            icon={<LineChart className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {valuation?.multiples ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Multiples
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {Object.entries(valuation.multiples).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {k.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <span className="font-medium">{fmtNum(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {valuation?.peer_set ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Peer set
                  </div>
                  <div className="text-sm">{valuation.peer_set.join(", ")}</div>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* Technicals */}
        {technicals ? (
          <Section
            title="Technicals"
            icon={<LineChart className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {technicals.trend ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Trend</div>
                  <div className="text-sm font-medium">{technicals.trend}</div>
                </div>
              ) : null}
              {technicals.levels ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Levels</div>
                  <div className="text-sm">
                    <span className="font-medium">Support:</span>{" "}
                    {fmtNum(technicals.levels.support)} &nbsp;•&nbsp;
                    <span className="font-medium">Resistance:</span>{" "}
                    {fmtNum(technicals.levels.resistance)}
                  </div>
                </div>
              ) : null}
              {technicals.momentum ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Momentum</div>
                  <div className="text-sm">
                    {technicals.momentum.rsi != null ? (
                      <>
                        <span className="font-medium">RSI:</span>{" "}
                        {fmtNum(technicals.momentum.rsi)}
                        {technicals.momentum.comment ? " — " : ""}
                      </>
                    ) : null}
                    {technicals.momentum.comment || ""}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* Key dates */}
        {key_dates.length > 0 ? (
          <Section
            title="Key dates"
            icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="rounded-xl border border-border p-3 bg-card">
              <ul className="text-sm space-y-1">
                {key_dates.map((k, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{k.event || "Event"}</span>
                    <span className="text-xs text-muted-foreground">
                      {shortDate(k.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        ) : null}

        {/* Scenarios */}
        {scenarios && (scenarios.bull || scenarios.base || scenarios.bear) ? (
          <Section
            title="Scenarios"
            icon={<Sparkles className="h-3.5 w-3.5 text-muted-foreground" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {scenarios.bull ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Bull</div>
                  <div className="text-sm">{scenarios.bull}</div>
                </div>
              ) : null}
              {scenarios.base ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Base</div>
                  <div className="text-sm">{scenarios.base}</div>
                </div>
              ) : null}
              {scenarios.bear ? (
                <div className="rounded-xl border border-border p-3 bg-card">
                  <div className="text-xs text-muted-foreground">Bear</div>
                  <div className="text-sm">{scenarios.bear}</div>
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {/* Sources */}
        {citations.length > 0 ? (
          <Section
            title="Sources"
            icon={
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            }
          >
            <ul className="text-sm space-y-1">
              {citations.map((c, i) => (
                <li key={i}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-foreground text-muted-foreground"
                  >
                    <span className="text-xs text-muted-foreground">
                      [{i + 1}]
                    </span>
                    <span>{c.title}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </Card>
    </div>
  );
}

export default SymbolAnalysis;
