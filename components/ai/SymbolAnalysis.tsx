"use client";

import React from "react";
import {
  Target,
  BarChart4,
  ShieldAlert,
  Zap,
  Info,
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
import { fmtAsOf, fmtCompact, fmtNum, fmtPct } from "@/utils/format";

type WhatChangedItem = {
  title: string;
  impact: string;
  explanation: string;
  sources: string[];
};

type FundamentalsSnapshot = {
  market_cap: number | null;
  pe_ttm: number | null;
  revenue_growth_yoy: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  free_cash_flow: number | null;
  debt_to_equity: number | null;
  summary: string;
};

type RiskItem = {
  title: string;
  severity: string;
  explanation: string;
  sources: string[];
};

type SentimentSnapshot = {
  overall: string;
  drivers: string[];
  sources: string[];
};

type ScenarioDetail = {
  thesis: string;
  key_assumptions: string[];
  watch_items: string[];
  sources: string[];
};

type Scenarios = {
  bull: ScenarioDetail;
  base: ScenarioDetail;
  bear: ScenarioDetail;
};

type Confidence = {
  score_0_100: number;
  rationale: string;
};

type Citation = {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string | null;
};

export type StockAnalysis = {
  symbol: string;
  as_of: string;
  quick_take: string;
  what_changed_recently: WhatChangedItem[];
  fundamentals_snapshot: FundamentalsSnapshot;
  catalysts_next_30_90d: string[];
  risks: RiskItem[];
  sentiment: SentimentSnapshot;
  scenarios: Scenarios;
  confidence: Confidence;
  citations: Citation[];
  data_gaps: string[];
};

interface StockAnalysisCardProps {
  stock: StockAnalysis;
}

type PillTone = "neutral" | "accent" | "positive" | "negative";

const toneFromSentiment = (value: string): PillTone => {
  if (value === "bullish" || value === "positive") return "positive";
  if (value === "bearish" || value === "negative") return "negative";
  return "neutral";
};

const toneFromImpact = (value: string): PillTone => {
  if (value === "bullish") return "positive";
  if (value === "bearish") return "negative";
  return "neutral";
};

const toneFromSeverity = (value: string): PillTone => {
  if (value === "high") return "negative";
  if (value === "medium") return "accent";
  return "neutral";
};

export const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({
  stock,
}) => {
  const asOfLabel = fmtAsOf(stock.as_of);
  const sentimentTone = toneFromSentiment(stock.sentiment.overall);
  const confidencePct = Math.max(
    0,
    Math.min(Math.round(stock.confidence.score_0_100), 100)
  );

  const citationsById = stock.citations.reduce<Record<string, Citation>>(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {}
  );

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
      <header className="p-8 bg-neutral-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                  AI Intelligence Report
                </span>
                {asOfLabel ? (
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    As of {asOfLabel}
                  </div>
                ) : null}
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {stock.symbol}{" "}
              <span className="text-white/40 font-light">Analysis</span>
            </h1>
            <p className="text-neutral-300 text-sm leading-relaxed italic">
              {stock.quick_take}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill tone={sentimentTone}>
              Sentiment: {stock.sentiment.overall}
            </Pill>
            <Pill tone="accent">Confidence: {confidencePct}%</Pill>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              <span>Overall AI Confidence</span>
              <span>{confidencePct}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-1000"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="summary">
        <TabList className="px-4 py-2 bg-neutral-50/50 border-b border-neutral-100 rounded-none ring-0">
          <TabTrigger value="summary" className="gap-2">
            <Target className="h-3.5 w-3.5" /> Summary
          </TabTrigger>
          <TabTrigger value="fundamentals" className="gap-2">
            <BarChart4 className="h-3.5 w-3.5" /> Fundamentals
          </TabTrigger>
          <TabTrigger value="scenarios" className="gap-2">
            <Zap className="h-3.5 w-3.5" /> Scenarios
          </TabTrigger>
          <TabTrigger value="risks" className="gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Risks & Sources
          </TabTrigger>
        </TabList>

        <TabPanels className="p-8">
          <TabPanel
            value="summary"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader
                  eyebrow="Recent Changes"
                  title="What Changed Recently"
                />
                <div className="space-y-4">
                  {stock.what_changed_recently.length ? (
                    stock.what_changed_recently.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-bold text-neutral-900">
                            {item.title}
                          </div>
                          <Pill tone={toneFromImpact(item.impact)}>
                            {item.impact}
                          </Pill>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {item.explanation}
                        </p>
                        <SourcesList
                          sourceIds={item.sources}
                          citationsById={citationsById}
                        />
                      </div>
                    ))
                  ) : (
                    <EmptyNote text="No recent changes provided." />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader eyebrow="Sentiment" title="Snapshot" />
                <div className="bg-neutral-900 rounded-2xl p-5 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      Overall
                    </span>
                    <Pill tone={sentimentTone}>
                      {stock.sentiment.overall}
                    </Pill>
                  </div>
                  <div className="space-y-2">
                    {stock.sentiment.drivers.length ? (
                      stock.sentiment.drivers.map((driver, index) => (
                        <div
                          key={`${driver}-${index}`}
                          className="text-sm text-neutral-200"
                        >
                          {driver}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-400">
                        No sentiment drivers provided.
                      </div>
                    )}
                  </div>
                  <SourcesList
                    sourceIds={stock.sentiment.sources}
                    citationsById={citationsById}
                    className="text-neutral-300"
                  />
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400">
                    <Info className="h-3.5 w-3.5 text-neutral-400" />
                    Confidence Rationale
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {stock.confidence.rationale}
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-black uppercase tracking-widest text-neutral-400">
                    Data Gaps
                  </div>
                  {stock.data_gaps.length ? (
                    <ul className="space-y-2 text-sm text-neutral-700">
                      {stock.data_gaps.map((gap, index) => (
                        <li key={`${gap}-${index}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-neutral-500">
                      No gaps reported.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="fundamentals" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Market Cap"
                value={fmtCompact(stock.fundamentals_snapshot.market_cap)}
              />
              <MetricCard
                label="P/E TTM"
                value={fmtNum(stock.fundamentals_snapshot.pe_ttm)}
              />
              <MetricCard
                label="Revenue Growth YoY"
                value={fmtPct(stock.fundamentals_snapshot.revenue_growth_yoy)}
              />
              <MetricCard
                label="Gross Margin"
                value={fmtPct(stock.fundamentals_snapshot.gross_margin)}
              />
              <MetricCard
                label="Operating Margin"
                value={fmtPct(stock.fundamentals_snapshot.operating_margin)}
              />
              <MetricCard
                label="Free Cash Flow"
                value={fmtCompact(stock.fundamentals_snapshot.free_cash_flow)}
              />
              <MetricCard
                label="Debt to Equity"
                value={fmtNum(stock.fundamentals_snapshot.debt_to_equity)}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <SectionHeader
                  eyebrow="Fundamentals"
                  title="Snapshot Summary"
                />
                <p className="text-neutral-600 text-sm leading-relaxed bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                  {stock.fundamentals_snapshot.summary}
                </p>
              </div>
              <div className="space-y-4">
                <SectionHeader
                  eyebrow="Upcoming"
                  title="Catalysts Next 30-90d"
                />
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                  {stock.catalysts_next_30_90d.length ? (
                    <ul className="space-y-3 text-sm text-neutral-700">
                      {stock.catalysts_next_30_90d.map((catalyst, index) => (
                        <li key={`${catalyst}-${index}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-neutral-500">
                      No catalysts listed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="scenarios" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <ScenarioCard
                tone="bull"
                title="Bull Case"
                scenario={stock.scenarios.bull}
                citationsById={citationsById}
              />
              <ScenarioCard
                tone="base"
                title="Base Case"
                scenario={stock.scenarios.base}
                citationsById={citationsById}
              />
              <ScenarioCard
                tone="bear"
                title="Bear Case"
                scenario={stock.scenarios.bear}
                citationsById={citationsById}
              />
            </div>
          </TabPanel>

          <TabPanel value="risks" className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionHeader
                eyebrow="Risk Assessment"
                title="Critical Watchpoints"
              />
              {stock.risks.length ? (
                stock.risks.map((risk, index) => (
                  <div
                    key={`${risk.title}-${index}`}
                    className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-rose-900 text-sm flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> {risk.title}
                      </div>
                      <Pill tone={toneFromSeverity(risk.severity)}>
                        {risk.severity}
                      </Pill>
                    </div>
                    <p className="text-xs text-rose-800/80 leading-relaxed">
                      {risk.explanation}
                    </p>
                    <SourcesList
                      sourceIds={risk.sources}
                      citationsById={citationsById}
                    />
                  </div>
                ))
              ) : (
                <EmptyNote text="No risks provided." />
              )}
            </div>

            <div className="space-y-4">
              <SectionHeader eyebrow="Sources" title="Citations" />
              <div className="space-y-3">
                {stock.citations.length ? (
                  stock.citations.map((citation) => {
                    const published = fmtAsOf(citation.published_at);
                    return (
                      <a
                        key={citation.id}
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-neutral-200 rounded-2xl p-4 bg-white shadow-sm hover:border-indigo-200 transition-colors"
                      >
                        <div className="text-sm font-semibold text-neutral-900">
                          {citation.title}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-2">
                          {(citation.source || "Unknown source") +
                            " - " +
                            citation.id +
                            (published ? ` - ${published}` : "")}
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <EmptyNote text="No citations provided." />
                )}
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

const scenarioStyles = {
  bull: {
    border: "border-emerald-100",
    bg: "bg-emerald-50/30",
    text: "text-emerald-700",
  },
  base: {
    border: "border-neutral-200",
    bg: "bg-neutral-50/30",
    text: "text-neutral-700",
  },
  bear: {
    border: "border-rose-100",
    bg: "bg-rose-50/30",
    text: "text-rose-700",
  },
} as const;

const ScenarioCard = ({
  tone,
  title,
  scenario,
  citationsById,
}: {
  tone: "bull" | "base" | "bear";
  title: string;
  scenario: ScenarioDetail;
  citationsById: Record<string, Citation>;
}) => {
  const s = scenarioStyles[tone];

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
      </div>

      <p className="text-sm leading-relaxed text-neutral-900 font-medium">
        {scenario.thesis}
      </p>

      <ScenarioList label="Key assumptions" items={scenario.key_assumptions} />
      <ScenarioList label="Watch items" items={scenario.watch_items} />
      <SourcesList sourceIds={scenario.sources} citationsById={citationsById} />
    </div>
  );
};

const ScenarioList = ({
  label,
  items,
}: {
  label: string;
  items: string[];
}) => {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <ul className="space-y-1 text-xs text-neutral-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2">
            <span className="mt-2 h-1 w-1 rounded-full bg-neutral-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
  tone?: PillTone;
}) => {
  const variants: Record<PillTone, string> = {
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

const SourcesList = ({
  sourceIds,
  citationsById,
  className,
}: {
  sourceIds?: string[];
  citationsById: Record<string, Citation>;
  className?: string;
}) => {
  if (!sourceIds || !sourceIds.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400",
        className
      )}
    >
      <span>Sources</span>
      {sourceIds.map((id, index) => {
        const citation = citationsById[id];
        const label = citation?.source ? `${citation.source} (${id})` : id;
        if (!citation?.url) {
          return (
            <span key={`${id}-${index}`} className="text-neutral-500">
              {label}
            </span>
          );
        }
        return (
          <a
            key={`${id}-${index}`}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700"
            title={citation.title}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
};

const EmptyNote = ({ text }: { text: string }) => (
  <div className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-xl p-4">
    {text}
  </div>
);
