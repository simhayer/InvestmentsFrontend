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
  Building2,
  Briefcase,
  Scale,
  HelpCircle,
  BarChart3,
  Gauge,
} from "lucide-react";

/* =========================
   Types for the NEW schema
========================= */

type CompanyProfile = {
  name: string;
  sector?: string;
  industry?: string;
  country?: string;
  business_model?: string;
  key_products_services?: string[];
  revenue_drivers?: string[];
  moat_and_competitive_advantages?: string;
  cyclicality?: string;
  capital_intensity?: string;
};

type FinancialSummary = {
  top_line_trend?: string;
  profitability_trend?: string;
  balance_sheet_health?: string;
  cash_flow_and_capex?: string;
  capital_allocation?: string;
};

type CompetitivePositioning = {
  peer_set?: string[];
  position_vs_peers?: string;
  structural_tailwinds?: string[];
  structural_headwinds?: string[];
};

type RecentDev = {
  headline: string;
  date?: string;
  source?: string;
  url?: string;
  summary?: string;
  impact?: string;
};

type SentimentDriver = {
  theme: string;
  tone?: string;
  commentary?: string;
};

type SentimentSnapshot = {
  overall_sentiment?: "bullish" | "bearish" | "neutral" | string;
  drivers?: SentimentDriver[];
  sources_considered?: string[];
};

type Thesis = {
  bull_case?: string;
  base_case?: string;
  bear_case?: string;
  key_drivers?: string[];
  typical_time_horizon?: string;
};

type RiskItem = {
  risk: string;
  why_it_matters?: string;
  how_to_monitor?: string;
};

type ValuationContext = {
  relative_positioning?: string;
  key_multiples_mentioned?: string[];
  valuation_narrative?: string;
};

type Scenarios = {
  bull?: string;
  base?: string;
  bear?: string;
  probabilities?: {
    bull?: number;
    base?: number;
    bear?: number;
  };
};

type FAQItem = {
  question: string;
  answer: string;
};

type SectionConfidence = Record<string, number>;

type Explainability = {
  assumptions?: string[];
  limitations?: string[];
  section_confidence?: SectionConfidence;
  confidence_overall?: number;
};

export type StockAnalysisDoc = {
  symbol: string;
  company_profile: CompanyProfile;
  financial_and_operating_summary?: FinancialSummary;
  competitive_positioning?: CompetitivePositioning;
  recent_developments?: RecentDev[];
  sentiment_snapshot?: SentimentSnapshot;
  thesis?: Thesis;
  risks?: RiskItem[];
  valuation_context?: ValuationContext;
  scenarios?: Scenarios;
  faq?: FAQItem[];
  explainability?: Explainability;
  disclaimer?: string;
};

/* =========================
   Helpers
========================= */

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

function sentimentBadgeClasses(sentiment?: string) {
  const s = (sentiment || "").toLowerCase();
  if (s === "bullish")
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  if (s === "bearish")
    return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300";
  if (s === "neutral")
    return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  return "border-border bg-secondary text-secondary-foreground";
}

function fmtPct(v?: number) {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return `${Math.round(v * 100)}%`;
}

type Citation = { title: string; url: string };

function makeCitations(devs: RecentDev[] | undefined): Citation[] {
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

// Parsing from unknown / string / array
function parseStockAnalysis(
  analysis: unknown,
  symbol?: string
): StockAnalysisDoc | null {
  let raw: unknown = analysis;

  if (typeof analysis === "string") {
    try {
      raw = JSON.parse(analysis);
    } catch {
      return null;
    }
  }

  if (Array.isArray(raw)) {
    if (symbol) {
      const match = raw.find(
        (item: any) =>
          item &&
          typeof item === "object" &&
          "symbol" in item &&
          String(item.symbol).toUpperCase() === symbol.toUpperCase()
      );
      if (match) return match as StockAnalysisDoc;
    }
    return raw[0] as StockAnalysisDoc;
  }

  if (raw && typeof raw === "object" && "symbol" in raw) {
    return raw as StockAnalysisDoc;
  }

  return null;
}

/* =========================
   Main Component (NEW UI)
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
  const doc = useMemo(
    () => parseStockAnalysis(analysis, symbol),
    [analysis, symbol]
  );

  if (!analysis) return null;

  if (!doc) {
    // Fallback: raw dump
    return (
      <div className="mt-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              AI Analysis {name ? `• ${name}` : ""} ({symbol.toUpperCase()})
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
            {typeof analysis === "string"
              ? analysis
              : JSON.stringify(analysis, null, 2)}
          </pre>
        </Card>
      </div>
    );
  }

  const {
    company_profile,
    financial_and_operating_summary,
    competitive_positioning,
    recent_developments = [],
    sentiment_snapshot,
    thesis,
    risks = [],
    valuation_context,
    scenarios,
    faq = [],
    explainability,
    disclaimer,
  } = doc;

  const citations = makeCitations(recent_developments);
  const overallSentiment = sentiment_snapshot?.overall_sentiment;
  const overallConfidence = explainability?.confidence_overall;

  const bullProb = scenarios?.probabilities?.bull;
  const baseProb = scenarios?.probabilities?.base;
  const bearProb = scenarios?.probabilities?.bear;

  return (
    <div className="mt-4">
      <Card className="p-4 md:p-5 space-y-5 bg-card text-card-foreground">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium">
                AI Stock Deep Dive • {company_profile.name} (
                {symbol.toUpperCase()})
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {company_profile.sector && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <Building2 className="h-3 w-3" />
                  <span>{company_profile.sector}</span>
                </span>
              )}
              {company_profile.industry && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <Briefcase className="h-3 w-3" />
                  <span>{company_profile.industry}</span>
                </span>
              )}
              {company_profile.country && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <span>{company_profile.country}</span>
                </span>
              )}
              {thesis?.typical_time_horizon && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>{thesis.typical_time_horizon}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {overallSentiment && (
              <Badge
                variant="outline"
                className={`border text-xs ${sentimentBadgeClasses(
                  overallSentiment
                )}`}
              >
                Sentiment: {overallSentiment.toUpperCase()}
              </Badge>
            )}
            {overallConfidence != null && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                <span>Model confidence</span>
                <div className="w-24 h-1.5 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round(overallConfidence * 100)}%` }}
                  />
                </div>
                <span className="tabular-nums">
                  {fmtPct(overallConfidence)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main layout grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left column: company + thesis + financials */}
          <div className="space-y-4 lg:col-span-2">
            {/* Company snapshot */}
            <Section
              title="Company snapshot"
              icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
            >
              <div className="rounded-xl border border-border p-3 space-y-3 bg-card/50">
                {company_profile.business_model && (
                  <p className="text-sm text-foreground">
                    {company_profile.business_model}
                  </p>
                )}

                <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm">
                  {company_profile.key_products_services?.length ? (
                    <div>
                      <div className="font-medium mb-1 text-muted-foreground">
                        Key products & services
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        {company_profile.key_products_services.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {company_profile.revenue_drivers?.length ? (
                    <div>
                      <div className="font-medium mb-1 text-muted-foreground">
                        Revenue drivers
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        {company_profile.revenue_drivers.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {(company_profile.moat_and_competitive_advantages ||
                  company_profile.cyclicality ||
                  company_profile.capital_intensity) && (
                  <div className="grid gap-3 md:grid-cols-3 text-xs md:text-sm">
                    {company_profile.moat_and_competitive_advantages && (
                      <div>
                        <div className="font-medium mb-1 text-muted-foreground">
                          Moat
                        </div>
                        <p className="text-muted-foreground line-clamp-5">
                          {company_profile.moat_and_competitive_advantages}
                        </p>
                      </div>
                    )}
                    {company_profile.cyclicality && (
                      <div>
                        <div className="font-medium mb-1 text-muted-foreground">
                          Cyclicality
                        </div>
                        <p className="text-muted-foreground">
                          {company_profile.cyclicality}
                        </p>
                      </div>
                    )}
                    {company_profile.capital_intensity && (
                      <div>
                        <div className="font-medium mb-1 text-muted-foreground">
                          Capital intensity
                        </div>
                        <p className="text-muted-foreground">
                          {company_profile.capital_intensity}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {/* Thesis */}
            {thesis &&
            (thesis.bull_case || thesis.base_case || thesis.bear_case) ? (
              <Section
                title="Investment thesis"
                icon={
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                }
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {thesis.bull_case && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-semibold text-emerald-500 uppercase mb-1">
                        Bull case
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {thesis.bull_case}
                      </p>
                    </div>
                  )}
                  {thesis.base_case && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-semibold text-primary uppercase mb-1">
                        Base case
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {thesis.base_case}
                      </p>
                    </div>
                  )}
                  {thesis.bear_case && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-semibold text-rose-500 uppercase mb-1">
                        Bear case
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {thesis.bear_case}
                      </p>
                    </div>
                  )}
                </div>

                {thesis.key_drivers?.length ? (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-3 bg-background/50">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Key drivers to watch
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {thesis.key_drivers.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Section>
            ) : null}

            {/* Financial & operating summary */}
            {financial_and_operating_summary && (
              <Section
                title="Financial & operating summary"
                icon={
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                }
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {financial_and_operating_summary.top_line_trend && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Top line
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financial_and_operating_summary.top_line_trend}
                      </p>
                    </div>
                  )}
                  {financial_and_operating_summary.profitability_trend && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Profitability
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financial_and_operating_summary.profitability_trend}
                      </p>
                    </div>
                  )}
                  {financial_and_operating_summary.balance_sheet_health && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Balance sheet
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financial_and_operating_summary.balance_sheet_health}
                      </p>
                    </div>
                  )}
                  {financial_and_operating_summary.cash_flow_and_capex && (
                    <div className="rounded-xl border border-border p-3 bg-card/50">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Cash flow & capex
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financial_and_operating_summary.cash_flow_and_capex}
                      </p>
                    </div>
                  )}
                  {financial_and_operating_summary.capital_allocation && (
                    <div className="rounded-xl border border-border p-3 bg-card/50 md:col-span-2">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Capital allocation
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financial_and_operating_summary.capital_allocation}
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Recent developments */}
            {recent_developments.length > 0 ? (
              <Section
                title="Recent developments"
                icon={
                  <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recent_developments.map((d, i) => {
                    const citeIdx =
                      citations.findIndex(
                        (c) => c.url === d.url || c.title === d.headline
                      ) + 1 || undefined;
                    return (
                      <div
                        key={String(d.url || d.headline || i)}
                        className="rounded-xl border border-border p-3 bg-card/50 flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium">
                            {d.headline}
                          </div>
                          <div className="text-[10px] text-muted-foreground shrink-0">
                            {shortDate(d.date)}
                          </div>
                        </div>
                        {d.summary && (
                          <p className="text-xs text-muted-foreground">
                            {d.summary}
                          </p>
                        )}
                        {d.impact && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Impact:
                            </span>{" "}
                            {d.impact}
                          </p>
                        )}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {d.source}
                          </span>
                          <SourcePill idx={citeIdx} cites={citations} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            ) : null}
          </div>

          {/* Right column: sentiment, risks, scenarios, FAQ, explainability */}
          <div className="space-y-4">
            {/* Sentiment snapshot */}
            {sentiment_snapshot && (
              <Section
                title="Sentiment snapshot"
                icon={<Scale className="h-3.5 w-3.5 text-muted-foreground" />}
              >
                <div className="rounded-xl border border-border p-3 bg-card/50 space-y-2">
                  {sentiment_snapshot.drivers?.map((d) => (
                    <div
                      key={d.theme}
                      className="border border-border/70 rounded-lg px-2.5 py-2 text-xs space-y-0.5 bg-background/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{d.theme}</span>
                        {d.tone && (
                          <span className="text-[10px] rounded-full border px-1.5 py-0.5 uppercase tracking-wide text-muted-foreground">
                            {d.tone}
                          </span>
                        )}
                      </div>
                      {d.commentary && (
                        <p className="text-[11px] text-muted-foreground">
                          {d.commentary}
                        </p>
                      )}
                    </div>
                  ))}

                  {sentiment_snapshot.sources_considered?.length ? (
                    <div className="pt-1 border-t border-dashed border-border/50 mt-2">
                      <div className="text-[10px] text-muted-foreground mb-1">
                        Sources sampled
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sentiment_snapshot.sources_considered.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            )}

            {/* Competitive positioning + valuation */}
            {(competitive_positioning || valuation_context) && (
              <Section
                title="Competitive & valuation context"
                icon={
                  <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
                }
              >
                <div className="space-y-3">
                  {competitive_positioning && (
                    <div className="rounded-xl border border-border p-3 bg-card/50 space-y-2 text-xs">
                      {competitive_positioning.position_vs_peers && (
                        <p className="text-muted-foreground text-sm">
                          {competitive_positioning.position_vs_peers}
                        </p>
                      )}
                      {competitive_positioning.peer_set?.length ? (
                        <div>
                          <div className="text-[11px] font-medium text-muted-foreground mb-0.5">
                            Peer set
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {competitive_positioning.peer_set.join(", ")}
                          </p>
                        </div>
                      ) : null}
                      {(competitive_positioning.structural_tailwinds?.length ||
                        competitive_positioning.structural_headwinds
                          ?.length) && (
                        <div className="grid gap-2">
                          {competitive_positioning.structural_tailwinds
                            ?.length && (
                            <div>
                              <div className="text-[11px] font-medium text-emerald-500 mb-0.5">
                                Tailwinds
                              </div>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                                {competitive_positioning.structural_tailwinds.map(
                                  (t) => (
                                    <li key={t}>{t}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {competitive_positioning.structural_headwinds
                            ?.length && (
                            <div>
                              <div className="text-[11px] font-medium text-rose-500 mb-0.5">
                                Headwinds
                              </div>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                                {competitive_positioning.structural_headwinds.map(
                                  (h) => (
                                    <li key={h}>{h}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {valuation_context && (
                    <div className="rounded-xl border border-border p-3 bg-card/50 space-y-1.5 text-xs">
                      {valuation_context.relative_positioning && (
                        <p className="text-sm text-muted-foreground">
                          {valuation_context.relative_positioning}
                        </p>
                      )}
                      {valuation_context.key_multiples_mentioned?.length && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Key multiples:&nbsp;
                          </span>
                          {valuation_context.key_multiples_mentioned.join(", ")}
                        </p>
                      )}
                      {valuation_context.valuation_narrative && (
                        <p className="text-[11px] text-muted-foreground">
                          {valuation_context.valuation_narrative}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Risks */}
            {risks.length > 0 && (
              <Section
                title="Key risks"
                icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
              >
                <div className="rounded-xl border border-border p-3 bg-card/50 space-y-2 text-xs">
                  {risks.map((r) => (
                    <div key={r.risk} className="flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">
                          {r.risk}
                        </div>
                        {r.why_it_matters && (
                          <p className="text-[11px] text-muted-foreground">
                            {r.why_it_matters}
                          </p>
                        )}
                        {r.how_to_monitor && (
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Monitor:
                            </span>{" "}
                            {r.how_to_monitor}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Scenarios */}
            {scenarios &&
              (scenarios.bull || scenarios.base || scenarios.bear) && (
                <Section
                  title="Scenario map"
                  icon={
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  }
                >
                  <div className="rounded-xl border border-border p-3 bg-card/50 space-y-3 text-xs">
                    <div className="grid gap-2">
                      {scenarios.bull && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-500 uppercase">
                              Bull
                            </span>
                            {bullProb != null && (
                              <span className="text-[11px] text-muted-foreground">
                                {fmtPct(bullProb)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {scenarios.bull}
                          </p>
                        </div>
                      )}
                      {scenarios.base && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-primary uppercase">
                              Base
                            </span>
                            {baseProb != null && (
                              <span className="text-[11px] text-muted-foreground">
                                {fmtPct(baseProb)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {scenarios.base}
                          </p>
                        </div>
                      )}
                      {scenarios.bear && (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-rose-500 uppercase">
                              Bear
                            </span>
                            {bearProb != null && (
                              <span className="text-[11px] text-muted-foreground">
                                {fmtPct(bearProb)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {scenarios.bear}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              )}

            {/* FAQ */}
            {faq.length > 0 && (
              <Section
                title="FAQ"
                icon={
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                }
              >
                <div className="rounded-xl border border-border p-3 bg-card/50 space-y-2 text-xs">
                  {faq.map((f) => (
                    <div key={f.question} className="space-y-0.5">
                      <div className="font-medium text-foreground">
                        {f.question}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {f.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Explainability */}
            {explainability && (
              <Section
                title="Explainability"
                icon={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
              >
                <div className="rounded-xl border border-border p-3 bg-card/50 space-y-3 text-xs">
                  {explainability.assumptions?.length && (
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground mb-0.5">
                        Key assumptions
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                        {explainability.assumptions.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {explainability.limitations?.length && (
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground mb-0.5">
                        Limitations
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                        {explainability.limitations.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* Sources */}
        {citations.length > 0 && (
          <Section
            title="Sources"
            icon={
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            }
          >
            <ul className="text-xs space-y-1.5">
              {citations.map((c, i) => (
                <li key={i}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 underline underline-offset-4 text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-[11px] text-muted-foreground">
                      [{i + 1}]
                    </span>
                    <span>{c.title}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Disclaimer */}
        {disclaimer && (
          <div className="border-t border-dashed border-border/60 pt-3 mt-1">
            <p className="text-[10px] leading-snug text-muted-foreground">
              {disclaimer}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SymbolAnalysis;
