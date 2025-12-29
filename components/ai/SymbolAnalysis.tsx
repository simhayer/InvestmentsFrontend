"use client";

import React from "react";
import {
  Target,
  BarChart4,
  ShieldAlert,
  Zap,
  HelpCircle,
  Info,
  TrendingUp,
  Compass,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabPanels,
  TabPanel,
} from "@/components/investment/tabs/tabs";
import { cn } from "@/lib/utils";

// ... [Keep your Type Definitions here] ...

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

export const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({
  stock,
}) => {
  const { company_profile, thesis, explainability } = stock;

  const sentimentTone =
    stock.sentiment_snapshot.overall_sentiment === "bearish"
      ? "negative"
      : stock.sentiment_snapshot.overall_sentiment === "bullish"
      ? "positive"
      : "neutral";

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
      {/* 1. HEADER SECTION (Always Visible) */}
      <header className="p-8 bg-neutral-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                AI Intelligence Report
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {company_profile.name}{" "}
              <span className="text-white/40 font-light">Analysis</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed italic">
              "{thesis.base_case}"
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill tone={sentimentTone}>
              Sentiment: {stock.sentiment_snapshot.overall_sentiment}
            </Pill>
            <Pill tone="accent">Horizon: {thesis.typical_time_horizon}</Pill>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              <span>Overall AI Confidence</span>
              <span>
                {Math.round(explainability.confidence_overall * 100)}%
              </span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-1000"
                style={{ width: `${explainability.confidence_overall * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. TABBED NAVIGATION */}
      <Tabs defaultValue="summary">
        <TabList className="px-4 py-2 bg-neutral-50/50 border-b border-neutral-100 rounded-none ring-0">
          <TabTrigger value="summary" className="gap-2">
            <Target className="h-3.5 w-3.5" /> Summary
          </TabTrigger>
          <TabTrigger value="operations" className="gap-2">
            <BarChart4 className="h-3.5 w-3.5" /> Operations
          </TabTrigger>
          <TabTrigger value="thesis" className="gap-2">
            <Zap className="h-3.5 w-3.5" /> Thesis & Scenarios
          </TabTrigger>
          <TabTrigger value="risks" className="gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Risks & FAQ
          </TabTrigger>
        </TabList>

        <TabPanels className="p-8">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          <TabPanel
            value="summary"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Sector" value={company_profile.sector} />
              <MetricCard label="Country" value={company_profile.country} />
              <MetricCard
                label="Primary Moat"
                value={company_profile.moat_and_competitive_advantages
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
                hint="Key advantage"
              />
              <MetricCard
                label="Capital"
                value={company_profile.capital_intensity}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader eyebrow="Business Model" title="The Mechanics" />
                <p className="text-neutral-600 text-sm leading-relaxed bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                  {company_profile.business_model}
                </p>
              </div>
              <div className="space-y-4">
                <SectionHeader
                  eyebrow="Intelligence Basis"
                  title="Confidence Levels"
                />
                <div className="space-y-3">
                  {Object.entries(explainability.section_confidence).map(
                    ([section, value]) => (
                      <ConfidenceRow
                        key={section}
                        label={section}
                        value={value}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: OPERATIONS */}
          <TabPanel value="operations" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <DetailBox
                title="Financial Trends"
                items={[
                  {
                    label: "Top Line",
                    content:
                      stock.financial_and_operating_summary.top_line_trend,
                  },
                  {
                    label: "Profitability",
                    content:
                      stock.financial_and_operating_summary.profitability_trend,
                  },
                  {
                    label: "Health",
                    content:
                      stock.financial_and_operating_summary
                        .balance_sheet_health,
                  },
                ]}
              />
              <DetailBox
                title="Competitive Stance"
                items={[
                  {
                    label: "Peers",
                    content: stock.competitive_positioning.peer_set.join(", "),
                  },
                  {
                    label: "Positioning",
                    content: stock.competitive_positioning.position_vs_peers,
                  },
                ]}
              />
            </div>
          </TabPanel>

          {/* TAB 3: THESIS & SCENARIOS */}
          <TabPanel value="thesis" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <ScenarioCard
                tone="bull"
                title="Bull Case"
                body={thesis.bull_case}
                probability={stock.scenarios.probabilities.bull}
              />
              <ScenarioCard
                tone="base"
                title="Base Case"
                body={thesis.base_case}
                probability={stock.scenarios.probabilities.base}
              />
              <ScenarioCard
                tone="bear"
                title="Bear Case"
                body={thesis.bear_case}
                probability={stock.scenarios.probabilities.bear}
              />
            </div>
            <div className="bg-neutral-900 rounded-[24px] p-6 text-white">
              <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">
                Sentiment Drivers
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {stock.sentiment_snapshot.drivers.map((d) => (
                  <div
                    key={d.theme}
                    className="bg-white/5 border border-white/10 p-4 rounded-xl"
                  >
                    <span className="text-indigo-400 font-bold text-xs">
                      {d.theme}
                    </span>
                    <p className="text-sm text-neutral-300 mt-1">
                      {d.commentary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* TAB 4: RISKS & FAQ */}
          <TabPanel value="risks" className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Risk Assessment"
                title="Critical Watchpoints"
              />
              {stock.risks.map((r) => (
                <div
                  key={r.risk}
                  className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2"
                >
                  <div className="font-bold text-rose-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> {r.risk}
                  </div>
                  <p className="text-xs text-rose-800/80 leading-relaxed">
                    {r.why_it_matters}
                  </p>
                  <div className="text-[10px] font-bold text-rose-600 uppercase">
                    Monitor: {r.how_to_monitor}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <SectionHeader eyebrow="Common Questions" title="AI FAQ" />
              {stock.faq.map((f) => (
                <details
                  key={f.question}
                  className="group border-b border-neutral-100 pb-3"
                >
                  <summary className="list-none font-bold text-sm cursor-pointer flex justify-between items-center py-2 hover:text-indigo-600 transition-colors">
                    {f.question}
                    <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-sm text-neutral-500 pl-2 border-l-2 border-neutral-100 mt-2">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

// --- Small Helper Components ---

const DetailBox = ({
  title,
  items,
}: {
  title: string;
  items: { label: string; content: string }[];
}) => (
  <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-50 pb-2">
      {title}
    </h4>
    <div className="space-y-6">
      {items.map((i) => (
        <div key={i.label} className="space-y-1">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
            {i.label}
          </p>
          <p className="text-sm text-neutral-900 leading-relaxed">
            {i.content}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const scenarioStyles = {
  bull: {
    border: "border-emerald-100",
    bg: "bg-emerald-50/30",
    text: "text-emerald-700",
    fill: "bg-emerald-500",
  },
  base: {
    border: "border-neutral-200",
    bg: "bg-neutral-50/30",
    text: "text-neutral-700",
    fill: "bg-neutral-900",
  },
  bear: {
    border: "border-rose-100",
    bg: "bg-rose-50/30",
    text: "text-rose-700",
    fill: "bg-rose-500",
  },
} as const;

const ScenarioCard = ({
  tone,
  title,
  body,
  probability,
}: {
  tone: "bull" | "base" | "bear";
  title: string;
  body: string;
  probability?: number;
}) => {
  const s = scenarioStyles[tone];
  const pct = probability ? Math.round(probability * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-3 shadow-sm transition-all hover:shadow-md",
        s.border,
        s.bg
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            s.text
          )}
        >
          {title}
        </span>
        <span className={cn("text-xs font-bold", s.text)}>{pct}% Prob.</span>
      </div>

      <p className="text-sm leading-relaxed text-neutral-900 font-medium">
        {body}
      </p>

      <div className="pt-2">
        <div className="h-1 w-full bg-neutral-200/50 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-700", s.fill)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div className="space-y-1 mb-4">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70">
      {eyebrow}
    </p>
    <h3 className="text-xl font-bold tracking-tight text-neutral-900">
      {title}
    </h3>
  </div>
);

const Pill = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "positive" | "negative";
}) => {
  const variants = {
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
    accent: "bg-indigo-500 text-white border-indigo-400",
    positive: "bg-emerald-500 text-white border-emerald-400",
    negative: "bg-rose-500 text-white border-rose-400",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
        variants[tone]
      )}
    >
      {children}
    </span>
  );
};

const MetricCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm group hover:border-indigo-200 transition-all">
    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-bold text-neutral-900 tracking-tight">
        {value}
      </span>
      {hint && (
        <span className="text-[10px] text-neutral-400 font-medium italic">
          {hint}
        </span>
      )}
    </div>
  </div>
);

const ConfidenceRow = ({ label, value }: { label: string; value: number }) => {
  const pct = Math.max(0, Math.min(Math.round(value * 100), 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase">
        <span>{label.replace(/_/g, " ")}</span>
        <span className="text-neutral-900">{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
