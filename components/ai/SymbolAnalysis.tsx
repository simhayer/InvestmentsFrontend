import React from "react";

type CompanyProfile = {
  name: string;
  sector: string;
  industry: string;
  country: string;
  business_model: string;
  key_products_services: string[];
  revenue_drivers: string[];
  moat_and_competitive_advantages: string;
  cyclicality: string;
  capital_intensity: string;
};

type FinancialAndOperatingSummary = {
  top_line_trend: string;
  profitability_trend: string;
  balance_sheet_health: string;
  cash_flow_and_capex: string;
  capital_allocation: string;
};

type CompetitivePositioning = {
  peer_set: string[];
  position_vs_peers: string;
  structural_tailwinds: string[];
  structural_headwinds: string[];
};

type RecentDevelopment = {
  headline: string;
  date: string;
  source: string;
  url: string;
  summary: string;
  impact: string;
};

type SentimentDriver = {
  theme: string;
  tone: string;
  commentary: string;
};

type SentimentSnapshot = {
  overall_sentiment: string;
  drivers: SentimentDriver[];
  sources_considered: string[];
};

type Thesis = {
  bull_case: string;
  base_case: string;
  bear_case: string;
  key_drivers: string[];
  typical_time_horizon: string;
};

type RiskItem = {
  risk: string;
  why_it_matters: string;
  how_to_monitor: string;
};

type ValuationContext = {
  relative_positioning: string;
  key_multiples_mentioned: string[];
  valuation_narrative: string;
};

type ScenarioProbabilities = {
  bull: number;
  base: number;
  bear: number;
};

type Scenarios = {
  bull: string;
  base: string;
  bear: string;
  probabilities: ScenarioProbabilities;
};

type FAQItem = {
  question: string;
  answer: string;
};

type Explainability = {
  assumptions: string[];
  limitations: string[];
  section_confidence: Record<string, number>;
  confidence_overall: number;
};

export type StockAnalysis = {
  symbol: string;
  company_profile: CompanyProfile;
  financial_and_operating_summary: FinancialAndOperatingSummary;
  competitive_positioning: CompetitivePositioning;
  recent_developments: RecentDevelopment[];
  sentiment_snapshot: SentimentSnapshot;
  thesis: Thesis;
  risks: RiskItem[];
  valuation_context: ValuationContext;
  scenarios: Scenarios;
  faq: FAQItem[];
  explainability: Explainability;
  disclaimer: string;
};

interface StockAnalysisCardProps {
  stock: StockAnalysis;
}

const clampStyle: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/**
 * Helper: extract first percentage (e.g. "+62%") from a string.
 */
function extractFirstPercentage(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/([-+]?\d+(\.\d+)?)%/);
  return match ? `${match[1]}%` : null;
}

/**
 * Helper: extract a money figure like "$51.2 billion" from a string.
 */
function extractFirstMoneyFigure(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/\$[\d,.]+\s*\w+/);
  return match ? match[0] : null;
}

const Pill: React.FC<
  React.PropsWithChildren<{
    tone?: "neutral" | "accent" | "positive" | "negative";
  }>
> = ({ children, tone = "neutral" }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const toneMap = {
    neutral: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200",
    accent: "bg-neutral-900 text-white shadow-sm shadow-neutral-900/15",
    positive: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    negative: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  } as const;

  return <span className={`${base} ${toneMap[tone]}`}>{children}</span>;
};

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, rightSlot }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {subtitle ? (
        <p className="text-sm leading-relaxed text-neutral-600">{subtitle}</p>
      ) : null}
    </div>
    {rightSlot ? (
      <div className="text-xs text-neutral-500">{rightSlot}</div>
    ) : null}
  </div>
);

const CollapsibleCard: React.FC<
  React.PropsWithChildren<{
    title: string;
    preview?: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
  }>
> = ({ title, preview, children, defaultOpen, className }) => (
  <details
    open={defaultOpen}
    className={`group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ${className ?? ""}`}
  >
    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          {title}
        </p>
        {preview ? (
          <div className="text-sm text-neutral-600" style={clampStyle}>
            {preview}
          </div>
        ) : null}
      </div>
      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition group-open:rotate-45 group-open:bg-neutral-50">
        +
      </span>
    </summary>
    <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-4 text-sm text-neutral-800 sm:px-5 sm:py-5">
      <div className="space-y-3">{children}</div>
    </div>
  </details>
);

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
}> = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-neutral-200/90 bg-white px-4 py-3 shadow-sm">
    <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500 font-semibold">
      {label}
    </p>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-xl font-semibold text-neutral-900">{value}</span>
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
    </div>
  </div>
);

const scenarioStyles = {
  bull: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/80",
    text: "text-emerald-800",
    badge: "bg-white/80 text-emerald-700",
    fill: "bg-emerald-500",
    body: "text-emerald-900",
  },
  base: {
    border: "border-neutral-200",
    bg: "bg-white",
    text: "text-neutral-800",
    badge: "bg-neutral-100 text-neutral-800",
    fill: "bg-neutral-800",
    body: "text-neutral-800",
  },
  bear: {
    border: "border-rose-200",
    bg: "bg-rose-50/90",
    text: "text-rose-800",
    badge: "bg-white/80 text-rose-700",
    fill: "bg-rose-500",
    body: "text-rose-900",
  },
} as const;

const ScenarioCard: React.FC<{
  tone: "bull" | "base" | "bear";
  title: string;
  body: string;
  probability?: number;
  horizon?: string;
}> = ({ tone, title, body, probability, horizon }) => {
  const style = scenarioStyles[tone];
  const pct =
    typeof probability === "number"
      ? Math.max(0, Math.min(Math.round(probability * 100), 100))
      : null;

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={`text-xs font-semibold uppercase tracking-[0.12em] ${style.text}`}
        >
          {title}
        </div>
        {pct != null ? (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}
          >
            {pct}%
          </span>
        ) : null}
      </div>
      {horizon ? (
        <p className="mt-1 text-[11px] text-neutral-600">Horizon {horizon}</p>
      ) : null}
      <p className={`mt-2 text-sm leading-relaxed ${style.body}`}>{body}</p>
      {pct != null ? (
        <div className="mt-3 h-1.5 rounded-full bg-neutral-100">
          <span
            className={`block h-full rounded-full ${style.fill}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
};

const ConfidenceRow: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  const pct = Math.max(0, Math.min(Math.round(value * 100), 100));
  return (
    <div className="space-y-1 rounded-xl border border-neutral-200 bg-white px-3 py-2">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <span className="font-semibold text-neutral-800">
          {label.replace(/_/g, " ")}
        </span>
        <span className="font-semibold text-neutral-900">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100">
        <span
          className="block h-full rounded-full bg-neutral-800"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({
  stock,
}) => {
  const { company_profile, financial_and_operating_summary, thesis } = stock;

  const revenueGrowth = extractFirstPercentage(
    financial_and_operating_summary.top_line_trend
  );
  const profitGrowth = extractFirstPercentage(
    financial_and_operating_summary.profitability_trend
  );
  const dataCenterRev = extractFirstMoneyFigure(
    financial_and_operating_summary.top_line_trend
  );
  const horizon = thesis?.typical_time_horizon ?? "—";
  const sentiment = stock.sentiment_snapshot?.overall_sentiment ?? "—";
  const sentimentTone =
    sentiment === "bearish"
      ? "negative"
      : sentiment === "bullish"
      ? "positive"
      : "neutral";

  const probabilities = stock.scenarios?.probabilities ?? {
    bull: 0.3,
    base: 0.5,
    bear: 0.2,
  };

  const formatProb = (val: number | undefined) =>
    typeof val === "number" ? `${Math.round(val * 100)}%` : "—";
  const quickTakeaway =
    thesis?.base_case ?? financial_and_operating_summary.top_line_trend;
  const previewProducts = company_profile.key_products_services
    .slice(0, 3)
    .join(" • ");
  const previewDrivers = company_profile.revenue_drivers
    .slice(0, 3)
    .join(" • ");

  return (
    <div className="mx-auto w-full max-w-[1260px] space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)]">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-6 py-7 text-white sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr] lg:items-start">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                  Symbol analysis
                </p>
                <Pill tone="accent">AI-generated insight</Pill>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[32px]">
                    {stock.symbol} — {company_profile.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="accent">{company_profile.sector}</Pill>
                  <Pill tone="neutral">{company_profile.industry}</Pill>
                  <Pill tone="neutral">{company_profile.country}</Pill>
                  <Pill tone={sentimentTone}>Sentiment: {sentiment}</Pill>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                  Time horizon {horizon}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                  Base probability {formatProb(probabilities.base)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">
                    Time horizon
                  </p>
                  <p className="mt-1 text-lg font-semibold capitalize">
                    {horizon}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">
                    Base probability
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatProb(probabilities.base)}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner">
                <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">
                  Quick takeaway
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  {quickTakeaway}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick snapshot */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-5 sm:px-7 sm:py-6">
        <SectionHeader
          eyebrow="Quick snapshot"
          title="Key metrics at a glance"
          rightSlot={<span>High-level momentum checks</span>}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Revenue growth" value={revenueGrowth ?? "—"} />
          <MetricCard label="Profit growth" value={profitGrowth ?? "—"} />
          <MetricCard label="Data center key metric" value={dataCenterRev ?? "—"} hint="Last noted" />
          <MetricCard label="Time horizon" value={<span className="capitalize">{horizon}</span>} />
        </div>
      </section>

      {/* Business & Operations */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-6 sm:px-7 sm:py-7">
        <SectionHeader
          eyebrow="Business & Operations"
          title="How the company runs and makes money"
          subtitle="Concise previews with full detail on expand"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CollapsibleCard
            title="Company profile"
            preview={company_profile.business_model}
            defaultOpen
          >
            <p className="leading-relaxed">{company_profile.business_model}</p>
            <div className="flex flex-wrap gap-2">
              <Pill tone="neutral">Sector: {company_profile.sector}</Pill>
              <Pill tone="neutral">Industry: {company_profile.industry}</Pill>
              <Pill tone="neutral">Country: {company_profile.country}</Pill>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Financial & operating summary"
            preview={financial_and_operating_summary.top_line_trend}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Top line trend
                </p>
                <p className="leading-relaxed">
                  {financial_and_operating_summary.top_line_trend}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Profitability trend
                </p>
                <p className="leading-relaxed">
                  {financial_and_operating_summary.profitability_trend}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Balance sheet health
                </p>
                <p className="leading-relaxed">
                  {financial_and_operating_summary.balance_sheet_health}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Cash flow & capex
                </p>
                <p className="leading-relaxed">
                  {financial_and_operating_summary.cash_flow_and_capex}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Capital allocation
                </p>
                <p className="leading-relaxed">
                  {financial_and_operating_summary.capital_allocation}
                </p>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Key products & services"
            preview={previewProducts}
          >
            <ul className="list-disc list-inside space-y-1 text-neutral-800">
              {company_profile.key_products_services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CollapsibleCard>

          <CollapsibleCard title="Revenue drivers" preview={previewDrivers}>
            <ul className="list-disc list-inside space-y-1 text-neutral-800">
              {company_profile.revenue_drivers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CollapsibleCard>
        </div>
      </section>

      {/* Moat, Structure & Positioning */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-6 sm:px-7 sm:py-7">
        <SectionHeader
          eyebrow="Moat, Structure & Positioning"
          title="Durability, cyclicality, and peer context"
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <CollapsibleCard
            title="Moat"
            preview={company_profile.moat_and_competitive_advantages}
          >
            <p className="leading-relaxed">
              {company_profile.moat_and_competitive_advantages}
            </p>
          </CollapsibleCard>
          <CollapsibleCard
            title="Cyclicality"
            preview={company_profile.cyclicality}
          >
            <p className="leading-relaxed">{company_profile.cyclicality}</p>
          </CollapsibleCard>
          <CollapsibleCard
            title="Capital intensity"
            preview={company_profile.capital_intensity}
          >
            <p className="leading-relaxed">
              {company_profile.capital_intensity}
            </p>
          </CollapsibleCard>

          <CollapsibleCard
            title="Competitive positioning"
            preview={stock.competitive_positioning.position_vs_peers}
            defaultOpen
            className="lg:col-span-2"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Peer set
              </p>
              <div className="flex flex-wrap gap-2">
                {stock.competitive_positioning.peer_set.map((peer) => (
                  <Pill key={peer} tone="neutral">
                    {peer}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Position vs peers
              </p>
              <p className="leading-relaxed">
                {stock.competitive_positioning.position_vs_peers}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Structural tailwinds
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-800">
                  {stock.competitive_positioning.structural_tailwinds.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Structural headwinds
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-800">
                  {stock.competitive_positioning.structural_headwinds.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Recent developments"
            preview={stock.recent_developments[0]?.headline}
            className="lg:col-span-3"
          >
            <div className="space-y-3">
              {stock.recent_developments.map((news) => (
                <article
                  key={news.headline}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
                    >
                      {news.headline}
                    </a>
                    <span className="text-xs text-neutral-500">
                      {news.source} • {news.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {news.summary}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-neutral-400" />
                    Impact: {news.impact}
                  </div>
                </article>
              ))}
            </div>
          </CollapsibleCard>
        </div>
      </section>

      {/* Sentiment & Thesis */}
      <section className="rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-6 sm:px-7 sm:py-7">
        <SectionHeader
          eyebrow="Sentiment & AI Thesis"
          title="Tone in the market plus bull / base / bear narratives"
          subtitle="Core AI read-out; scenarios match the probability cards below"
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Pill tone={sentimentTone}>{sentiment}</Pill>
              <span className="text-xs text-neutral-600">
                Sentiment snapshot
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {stock.sentiment_snapshot.drivers.map((driver) => (
                <div
                  key={driver.theme}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600">
                    {driver.theme} ({driver.tone})
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-800">
                    {driver.commentary}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Sources considered
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {stock.sentiment_snapshot.sources_considered.map((source) => (
                  <Pill key={source} tone="neutral">
                    {source}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <ScenarioCard
                tone="bull"
                title="Bull case"
                body={stock.thesis.bull_case}
                horizon={horizon}
              />
              <ScenarioCard
                tone="base"
                title="Base case"
                body={stock.thesis.base_case}
                horizon={horizon}
              />
              <ScenarioCard
                tone="bear"
                title="Bear case"
                body={stock.thesis.bear_case}
                horizon={horizon}
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Key drivers
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-neutral-800">
                {stock.thesis.key_drivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Risk, Scenarios & Valuation */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-6 sm:px-7 sm:py-7">
        <SectionHeader
          eyebrow="Risks, Scenarios & Valuation"
          title="Watch-outs, weighted scenarios, and valuation framing"
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Risks
              </p>
              <div className="mt-2 space-y-3">
                {stock.risks.map((risk) => (
                  <div
                    key={risk.risk}
                    className="rounded-xl border border-amber-100 bg-amber-50/70 p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-800">
                      {risk.risk}
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-800">
                      <span className="font-semibold">Why it matters:</span>{" "}
                      {risk.why_it_matters}
                    </p>
                    <p className="text-xs text-neutral-700">
                      <span className="font-semibold">Monitor:</span>{" "}
                      {risk.how_to_monitor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Scenarios & probabilities
                </p>
                <span className="text-[11px] text-neutral-500">
                  Likelihood-weighted narratives
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <ScenarioCard
                  tone="bull"
                  title="Bull"
                  body={stock.scenarios.bull}
                  probability={probabilities.bull}
                />
                <ScenarioCard
                  tone="base"
                  title="Base"
                  body={stock.scenarios.base}
                  probability={probabilities.base}
                />
                <ScenarioCard
                  tone="bear"
                  title="Bear"
                  body={stock.scenarios.bear}
                  probability={probabilities.bear}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <CollapsibleCard
              title="Valuation context"
              preview={stock.valuation_context.relative_positioning}
              defaultOpen
            >
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Relative positioning
                </p>
                <p className="leading-relaxed">
                  {stock.valuation_context.relative_positioning}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Key multiples mentioned
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stock.valuation_context.key_multiples_mentioned.map((m) => (
                    <Pill key={m} tone="neutral">
                      {m}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Valuation narrative
                </p>
                <p className="leading-relaxed">
                  {stock.valuation_context.valuation_narrative}
                </p>
              </div>
            </CollapsibleCard>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
                FAQ
              </p>
              <div className="mt-3 space-y-2">
                {stock.faq.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-2"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-neutral-900">
                      {faq.question}
                      <span className="text-lg font-normal text-neutral-500 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explainability & Confidence */}
      <section className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] px-5 py-6 sm:px-7 sm:py-7">
        <SectionHeader
          eyebrow="Explainability & Confidence"
          title="Assumptions, constraints, and conviction levels"
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
              Assumptions
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-neutral-800">
              {stock.explainability.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
              Limitations
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-neutral-800">
              {stock.explainability.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(stock.explainability.section_confidence).map(
            ([section, value]) => (
              <ConfidenceRow key={section} label={section} value={value} />
            )
          )}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Overall confidence {formatProb(stock.explainability.confidence_overall)}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-[11px] leading-relaxed text-neutral-600">
        {stock.disclaimer}
      </div>
    </div>
  );
};
