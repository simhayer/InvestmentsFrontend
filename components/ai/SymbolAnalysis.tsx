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
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  const styles =
    tone === "accent"
      ? "bg-blue-50 text-blue-700 border border-blue-100"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  return <span className={`${base} ${styles}`}>{children}</span>;
};

/**
 * Simple section using native <details> for accessible accordion.
 */
const AccordionSection: React.FC<
  React.PropsWithChildren<{ title: string; defaultOpen?: boolean }>
> = ({ title, children, defaultOpen }) => {
  return (
    <details
      className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="ml-2 h-5 w-5 shrink-0 rounded-full border border-slate-300 text-xs text-slate-500 flex items-center justify-center">
          <span className="transition-transform group-open:rotate-90">›</span>
        </span>
      </summary>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-700 space-y-3">
        {children}
      </div>
    </details>
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
    <div className="max-w-3xl mx-auto rounded-2xl bg-slate-50 p-5 md:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl md:text-2xl font-semibold text-slate-900">
            {stock.symbol}
          </span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="text-sm md:text-base text-slate-700">
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
                  ? "text-green-600"
                  : sentiment === "bearish"
                  ? "text-red-600"
                  : "text-slate-700"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  sentiment === "bullish"
                    ? "bg-green-500"
                    : sentiment === "bearish"
                    ? "bg-red-500"
                    : "bg-slate-400"
                }`}
              />
              {sentiment}
            </span>
          </Chip>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Revenue growth
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {revenueGrowth ?? "—"}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Profit growth
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {profitGrowth ?? "—"}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Data center rev
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {dataCenterRev ?? "—"}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Time horizon
            </div>
            <div className="text-lg font-semibold text-slate-900 capitalize">
              {horizon}
            </div>
          </div>
        </div>
      </section>

      {/* Accordions */}
      <section className="space-y-3">
        <AccordionSection title="Company profile" defaultOpen>
          <p className="text-sm text-slate-700">
            {company_profile.business_model}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Key products & services
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {company_profile.key_products_services.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Revenue drivers
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {company_profile.revenue_drivers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Moat
              </h3>
              <p>{company_profile.moat_and_competitive_advantages}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Cyclicality
              </h3>
              <p>{company_profile.cyclicality}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Capital intensity
              </h3>
              <p>{company_profile.capital_intensity}</p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Financial & operating summary">
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Top line trend
              </h3>
              <p>{financial_and_operating_summary.top_line_trend}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Profitability
              </h3>
              <p>{financial_and_operating_summary.profitability_trend}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Balance sheet
                </h3>
                <p>{financial_and_operating_summary.balance_sheet_health}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Cash flow & capex
                </h3>
                <p>{financial_and_operating_summary.cash_flow_and_capex}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Capital allocation
                </h3>
                <p>{financial_and_operating_summary.capital_allocation}</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Competitive positioning">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Peer set
              </h3>
              <div className="flex flex-wrap gap-2">
                {stock.competitive_positioning.peer_set.map((peer) => (
                  <Chip key={peer}>{peer}</Chip>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Position vs peers
              </h3>
              <p>{stock.competitive_positioning.position_vs_peers}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">
                  Structural tailwinds
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {stock.competitive_positioning.structural_tailwinds.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">
                  Structural headwinds
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {stock.competitive_positioning.structural_headwinds.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Recent developments (news)">
          <div className="space-y-3">
            {stock.recent_developments.map((news) => (
              <article
                key={news.headline}
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {news.headline}
                  </a>
                  <span className="text-xs text-slate-500">
                    {news.source} • {news.date}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{news.summary}</p>
                <p className="mt-2 text-xs text-slate-700">
                  <span className="font-semibold">Impact: </span>
                  {news.impact}
                </p>
              </article>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Sentiment snapshot">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Overall sentiment
              </h3>
              <Chip tone="accent">
                {sentiment.charAt(0).toUpperCase()}
                {sentiment.slice(1)}
              </Chip>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Drivers
              </h3>
              <ul className="space-y-2">
                {stock.sentiment_snapshot.drivers.map((driver) => (
                  <li key={driver.theme}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {driver.theme} ({driver.tone})
                    </div>
                    <p>{driver.commentary}</p>
                  </li>
                ))}
              </ul>
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
          </div>
        </AccordionSection>

        <AccordionSection title="Thesis (bull / base / bear)" defaultOpen>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                  Bull case
                </div>
                <p className="text-sm text-emerald-900">
                  {stock.thesis.bull_case}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-1">
                  Base case
                </div>
                <p className="text-sm text-slate-900">
                  {stock.thesis.base_case}
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 mb-1">
                  Bear case
                </div>
                <p className="text-sm text-rose-900">
                  {stock.thesis.bear_case}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Key drivers
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {stock.thesis.key_drivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Typical time horizon
              </h3>
              <p className="text-sm capitalize">{horizon}</p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Risks">
          <ul className="space-y-3">
            {stock.risks.map((risk) => (
              <li
                key={risk.risk}
                className="rounded-lg border border-amber-200 bg-amber-50/80 p-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
                  {risk.risk}
                </div>
                <p className="text-sm text-slate-800 mb-1">
                  <span className="font-semibold">Why it matters: </span>
                  {risk.why_it_matters}
                </p>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">How to monitor: </span>
                  {risk.how_to_monitor}
                </p>
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection title="Valuation context">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Relative positioning
              </h3>
              <p>{stock.valuation_context.relative_positioning}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Key multiples mentioned
              </h3>
              <div className="flex flex-wrap gap-2">
                {stock.valuation_context.key_multiples_mentioned.map((m) => (
                  <Chip key={m}>{m}</Chip>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Narrative
              </h3>
              <p>{stock.valuation_context.valuation_narrative}</p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Scenarios & probabilities">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-white p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Bull
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatProb(probabilities.bull)}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{stock.scenarios.bull}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Base
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatProb(probabilities.base)}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{stock.scenarios.base}</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-white p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Bear
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatProb(probabilities.bear)}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{stock.scenarios.bear}</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="FAQ">
          <ul className="space-y-3">
            {stock.faq.map((faq) => (
              <li key={faq.question}>
                <div className="font-semibold text-sm text-slate-900">
                  {faq.question}
                </div>
                <p className="text-sm text-slate-700">{faq.answer}</p>
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection title="Explainability & confidence">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Assumptions
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {stock.explainability.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Limitations
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {stock.explainability.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
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
                      className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 border border-slate-200"
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
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Overall confidence
              </h3>
              <Chip tone="accent">
                {(stock.explainability.confidence_overall * 100).toFixed(0)}%
              </Chip>
            </div>
          </div>
        </AccordionSection>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-slate-200 pt-3">
        <p className="text-[11px] leading-relaxed text-slate-500">
          {stock.disclaimer}
        </p>
      </footer>
    </div>
  );
};
