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

/**
 * Simple badge chip.
 */
const Chip: React.FC<
  React.PropsWithChildren<{ tone?: "default" | "accent" }>
> = ({ children, tone = "default" }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm";
  const styles =
    tone === "accent"
      ? "bg-blue-50/90 text-blue-700 border border-blue-100"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  return <span className={`${base} ${styles}`}>{children}</span>;
};

/**
 * Section shell using native <details> for accessible accordion.
 */
const SectionCard: React.FC<
  React.PropsWithChildren<{
    title: string;
    description?: string;
    defaultOpen?: boolean;
  }>
> = ({ title, description, children, defaultOpen }) => {
  return (
    <details
      className="group self-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {title}
          </p>
          {description ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-45 group-open:border-slate-300 group-open:bg-slate-50">
          +
        </span>
      </summary>
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 text-sm text-slate-800">
        <div className="space-y-4">{children}</div>
      </div>
    </details>
  );
};

const StatTile: React.FC<
  React.PropsWithChildren<{ label: string; hint?: string }>
> = ({ label, hint, children }) => (
  <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 shadow-sm">
    <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
      {label}
    </p>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-xl font-semibold text-slate-900">{children}</span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  </div>
);

const ProbabilityCard: React.FC<{
  label: string;
  probability: number;
  narrative: string;
  tone: "bull" | "base" | "bear";
}> = ({ label, probability, narrative, tone }) => {
  const color =
    tone === "bull"
      ? "bg-emerald-500"
      : tone === "bear"
      ? "bg-rose-500"
      : "bg-slate-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
          {label}
        </div>
        <span className="text-xs font-semibold text-slate-900">
          {(probability * 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <span
          className={`block h-full rounded-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(probability * 100, 100))}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-relaxed">{narrative}</p>
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

  const probabilities = stock.scenarios?.probabilities ?? {
    bull: 0.3,
    base: 0.5,
    bear: 0.2,
  };

  const formatProb = (val: number | undefined) =>
    typeof val === "number" ? `${Math.round(val * 100)}%` : "—";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white md:px-8 md:py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/60">
                Symbol analysis
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-semibold leading-tight tracking-tight">
                  {stock.symbol}
                </span>
                <span className="text-lg text-white/80">
                  {company_profile.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="accent">{company_profile.sector}</Chip>
                <Chip>{company_profile.industry}</Chip>
                <Chip>{company_profile.country}</Chip>
                <Chip>
                  Sentiment:{" "}
                  <span
                    className={`ml-1 inline-flex items-center gap-1 capitalize ${
                      sentiment === "bullish"
                        ? "text-emerald-200"
                        : sentiment === "bearish"
                        ? "text-rose-200"
                        : "text-white"
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        sentiment === "bullish"
                          ? "bg-emerald-300"
                          : sentiment === "bearish"
                          ? "bg-rose-300"
                          : "bg-white"
                      }`}
                    />
                    {sentiment}
                  </span>
                </Chip>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white shadow-inner md:w-[320px]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">
                  Time horizon
                </p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {horizon}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">
                  Base probability
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatProb(probabilities.base)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">
                  Quick takeaway
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  {financial_and_operating_summary.top_line_trend}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6 bg-slate-50 px-5 py-6 md:px-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                Quick snapshot
              </h2>
              <span className="text-xs text-slate-500">
                High-level momentum checks
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatTile label="Revenue growth">{revenueGrowth ?? "—"}</StatTile>
              <StatTile label="Profit growth">{profitGrowth ?? "—"}</StatTile>
              <StatTile label="Data center rev" hint="Last noted">
                {dataCenterRev ?? "—"}
              </StatTile>
              <StatTile label="Time horizon">
                <span className="capitalize">{horizon}</span>
              </StatTile>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Company profile"
              description="What the business does and how it wins"
              defaultOpen
            >
              <p className="text-sm leading-relaxed text-slate-700">
                {company_profile.business_model}
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Key products & services
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {company_profile.key_products_services.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Revenue drivers
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {company_profile.revenue_drivers.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Moat
                  </h3>
                  <p className="leading-relaxed">
                    {company_profile.moat_and_competitive_advantages}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Cyclicality
                  </h3>
                  <p className="leading-relaxed">
                    {company_profile.cyclicality}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Capital intensity
                  </h3>
                  <p className="leading-relaxed">
                    {company_profile.capital_intensity}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Financial & operating summary"
              description="Momentum, cash profile, and allocation"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Top line trend
                  </h3>
                  <p className="leading-relaxed">
                    {financial_and_operating_summary.top_line_trend}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Profitability
                  </h3>
                  <p className="leading-relaxed">
                    {financial_and_operating_summary.profitability_trend}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Balance sheet
                  </h3>
                  <p className="leading-relaxed">
                    {financial_and_operating_summary.balance_sheet_health}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Cash flow & capex
                  </h3>
                  <p className="leading-relaxed">
                    {financial_and_operating_summary.cash_flow_and_capex}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Capital allocation
                  </h3>
                  <p className="leading-relaxed">
                    {financial_and_operating_summary.capital_allocation}
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Competitive positioning"
              description="How the company stacks up against peers"
              defaultOpen
            >
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="font-semibold text-slate-800 text-sm mb-1">
                  Peer set
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stock.competitive_positioning.peer_set.map((peer) => (
                    <Chip key={peer}>{peer}</Chip>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="font-semibold text-slate-800 text-sm mb-1">
                  Position vs peers
                </h3>
                <p className="leading-relaxed">
                  {stock.competitive_positioning.position_vs_peers}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">
                    Structural tailwinds
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {stock.competitive_positioning.structural_tailwinds.map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">
                    Structural headwinds
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {stock.competitive_positioning.structural_headwinds.map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Recent developments"
              description="Fresh headlines with impact call-outs"
            >
              <div className="space-y-3">
                {stock.recent_developments.map((news) => (
                  <article
                    key={news.headline}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        {news.headline}
                      </a>
                      <span className="text-xs text-slate-500">
                        {news.source} • {news.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {news.summary}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Impact: {news.impact}
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Sentiment snapshot"
              description="Tone, drivers, and sources"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="accent">
                  {sentiment.charAt(0).toUpperCase()}
                  {sentiment.slice(1)}
                </Chip>
                <span className="text-xs text-slate-600">
                  Overall sentiment flag
                </span>
              </div>
              <div className="space-y-2">
                {stock.sentiment_snapshot.drivers.map((driver) => (
                  <div
                    key={driver.theme}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {driver.theme} ({driver.tone})
                    </div>
                    <p className="leading-relaxed">{driver.commentary}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">
                  Sources considered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stock.sentiment_snapshot.sources_considered.map((source) => (
                    <Chip key={source}>{source}</Chip>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Thesis (bull / base / bear)"
              description="Core narratives by scenario"
              defaultOpen
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                    Bull case
                  </div>
                  <p className="text-sm text-emerald-900 leading-relaxed">
                    {stock.thesis.bull_case}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-1">
                    Base case
                  </div>
                  <p className="text-sm text-slate-900 leading-relaxed">
                    {stock.thesis.base_case}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 mb-1">
                    Bear case
                  </div>
                  <p className="text-sm text-rose-900 leading-relaxed">
                    {stock.thesis.bear_case}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Key drivers
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {stock.thesis.key_drivers.map((driver) => (
                    <li key={driver}>{driver}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Chip tone="accent">Typical horizon: {horizon}</Chip>
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Risks" description="Watch-outs and monitoring">
              <div className="grid gap-3">
                {stock.risks.map((risk) => (
                  <div
                    key={risk.risk}
                    className="rounded-xl border border-amber-200 bg-amber-50/80 p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
                      {risk.risk}
                    </div>
                    <p className="text-sm text-slate-800 mb-1 leading-relaxed">
                      <span className="font-semibold">Why it matters: </span>
                      {risk.why_it_matters}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold">How to monitor: </span>
                      {risk.how_to_monitor}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Valuation context"
              description="Where the market is pricing the story"
            >
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Relative positioning
                </h3>
                <p className="leading-relaxed">
                  {stock.valuation_context.relative_positioning}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Key multiples mentioned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stock.valuation_context.key_multiples_mentioned.map((m) => (
                    <Chip key={m}>{m}</Chip>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Narrative
                </h3>
                <p className="leading-relaxed">
                  {stock.valuation_context.valuation_narrative}
                </p>
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Scenarios & probabilities"
              description="Likelihood-weighted narratives"
              defaultOpen
            >
              <div className="grid gap-3 md:grid-cols-3">
                <ProbabilityCard
                  label="Bull"
                  probability={probabilities.bull}
                  narrative={stock.scenarios.bull}
                  tone="bull"
                />
                <ProbabilityCard
                  label="Base"
                  probability={probabilities.base}
                  narrative={stock.scenarios.base}
                  tone="base"
                />
                <ProbabilityCard
                  label="Bear"
                  probability={probabilities.bear}
                  narrative={stock.scenarios.bear}
                  tone="bear"
                />
              </div>
            </SectionCard>

            <SectionCard title="FAQ" description="Investor questions answered">
              <ul className="space-y-3">
                {stock.faq.map((faq) => (
                  <li
                    key={faq.question}
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="font-semibold text-sm text-slate-900">
                      {faq.question}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </section>

          <SectionCard
            title="Explainability & confidence"
            description="Assumptions, constraints, and confidence levels"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Assumptions
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {stock.explainability.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Limitations
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {stock.explainability.limitations.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Section confidence
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(stock.explainability.section_confidence).map(
                  ([section, value]) => (
                    <div
                      key={section}
                      className="flex items-center justify-between rounded-md bg-white px-3 py-2 border border-slate-200"
                    >
                      <span className="text-xs text-slate-600">
                        {section.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overall confidence
              </h3>
              <Chip tone="accent">
                {(stock.explainability.confidence_overall * 100).toFixed(0)}%
              </Chip>
            </div>
          </SectionCard>

          <footer className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[11px] leading-relaxed text-slate-600 shadow-sm">
            {stock.disclaimer}
          </footer>
        </div>
      </div>
    </div>
  );
};
