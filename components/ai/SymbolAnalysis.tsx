"use client";

import React from "react";
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  Compass,
  BrainCircuit,
  AlertCircle,
  Clock,
  MessageSquare,
  Calendar,
  Lightbulb,
  Target,
  Activity,
} from "lucide-react";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabPanels,
  TabPanel,
} from "@/components/investment/tabs/tabs";
import { cn } from "@/lib/utils";

// --- Types aligned to backend schema (Pydantic) ---

export type KeyInsight = {
  insight: string;
  evidence?: string | null;
  implication?: string | null;
};

export type ThesisPoint = {
  claim: string;
  why_it_matters: string;
  what_would_change_my_mind: string;
};

export type Catalyst = {
  name: string;
  window: string;
  trigger: string;
  mechanism: string;
  likely_market_reaction: string;
  impact_channels: string[];
  probability: number;
  magnitude: string;
  priced_in: string;
  key_watch_items: string[];
  // evidence exists in your backend model (based on validator), but you didn't include it in TS.
  // Add if you want to render later:
  // evidence?: Array<{ source?: string; note?: string }>;
};

export type Scenario = {
  name: "Base" | "Bull" | "Bear" | string;
  narrative: string;
  key_drivers: string[];
  watch_items: string[];
};

export type KeyDebate = {
  debate: string;
  what_to_watch: string[];
};

export type MarketEdge = {
  consensus_view: string;
  variant_view: string;
  why_it_matters: string;
};

export type PricingAssessment = {
  market_expectation: string;
  variant_outcome: string;
  valuation_sensitivity: string;
};

export type StockAnalysis = {
  symbol: string;

  key_insights: KeyInsight[];
  current_performance: string;
  stock_overflow_risks: string[];
  price_outlook: string;

  recommendation: "Buy" | "Hold" | "Sell" | string;
  confidence: number;
  is_priced_in: boolean;

  unified_thesis: string;
  thesis_points: ThesisPoint[];
  upcoming_catalysts: Catalyst[];
  scenarios: Scenario[];

  market_expectations: string[];
  key_debates: KeyDebate[];
  what_to_watch_next: string[];

  data_quality_notes: string[];

  market_edge?: MarketEdge | null;
  pricing_assessment?: PricingAssessment | null;
};

interface StockAnalysisCardProps {
  stock: StockAnalysis;
}

// --- Main Component ---

export const StockAnalysisCard: React.FC<StockAnalysisCardProps> = ({
  stock,
}) => {
  const rec = stock.recommendation?.toLowerCase();
  const recTone =
    rec === "buy" ? "positive" : rec === "sell" ? "negative" : "neutral";

  const confidencePct = Number.isFinite(stock.confidence)
    ? Math.max(0, Math.min(1, stock.confidence))
    : 0;

  const hasDQ =
    Array.isArray(stock.data_quality_notes) &&
    stock.data_quality_notes.length > 0;
  const hasMarketEdge =
    !!stock.market_edge &&
    typeof stock.market_edge?.consensus_view === "string" &&
    typeof stock.market_edge?.variant_view === "string" &&
    typeof stock.market_edge?.why_it_matters === "string";

  const hasPricing =
    !!stock.pricing_assessment &&
    typeof stock.pricing_assessment?.market_expectation === "string" &&
    typeof stock.pricing_assessment?.variant_outcome === "string" &&
    typeof stock.pricing_assessment?.valuation_sensitivity === "string";

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
      {/* 1. HEADER SECTION */}
      <header className="p-8 bg-neutral-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                AI Financial Agent • {stock.symbol} Analysis
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {stock.symbol}{" "}
              <span className="text-white/40 font-light">Research Report</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed italic">
              "{stock.unified_thesis}"
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill tone={recTone}>Rec: {stock.recommendation}</Pill>
            <Pill tone={stock.is_priced_in ? "neutral" : "accent"}>
              {stock.is_priced_in ? "Fully Priced In" : "Alpha Opportunity"}
            </Pill>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              <span>Analysis Confidence Score</span>
              <span>{Math.round(confidencePct * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-1000"
                style={{ width: `${confidencePct * 100}%` }}
              />
            </div>

            {/* Data quality notes */}
            {hasDQ ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-amber-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Data quality notes
                  </p>
                </div>
                <ul className="space-y-1">
                  {stock.data_quality_notes.slice(0, 5).map((n, i) => (
                    <li
                      key={i}
                      className="text-xs text-white/70 leading-relaxed"
                    >
                      • {n}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* 2. TABBED NAVIGATION */}
      <Tabs defaultValue="insights">
        <TabList className="px-4 py-2 bg-neutral-50/50 border-b border-neutral-100 rounded-none ring-0">
          <TabTrigger value="insights" className="gap-2">
            <Compass className="h-3.5 w-3.5" /> Insights
          </TabTrigger>
          <TabTrigger value="thesis" className="gap-2">
            <Zap className="h-3.5 w-3.5" /> Thesis
          </TabTrigger>
          <TabTrigger value="catalysts" className="gap-2">
            <TrendingUp className="h-3.5 w-3.5" /> Catalysts
          </TabTrigger>
          <TabTrigger value="risks" className="gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Risks & Debates
          </TabTrigger>
        </TabList>

        <TabPanels className="p-8">
          {/* TAB 1: SUMMARY & INSIGHTS */}
          <TabPanel
            value="insights"
            className="space-y-8 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <SectionHeader
                    eyebrow="Performance Snapshot"
                    title="Current Momentum"
                  />
                  <div className="mt-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                    <p className="text-neutral-900 font-medium leading-relaxed">
                      {stock.current_performance}
                    </p>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {stock.price_outlook}
                    </p>
                  </div>
                </section>

                {/* Market expectations */}
                {Array.isArray(stock.market_expectations) &&
                stock.market_expectations.length > 0 ? (
                  <section>
                    <SectionHeader
                      eyebrow="What the market is pricing"
                      title="Market Expectations"
                    />
                    <div className="mt-4 p-6 bg-white border border-neutral-100 rounded-[24px] shadow-sm">
                      <ul className="space-y-2">
                        {stock.market_expectations.slice(0, 6).map((e, i) => (
                          <li
                            key={i}
                            className="text-sm text-neutral-700 leading-relaxed"
                          >
                            • {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                ) : null}

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                    Strategic Insights
                  </h4>
                  <div className="grid gap-6">
                    {stock.key_insights.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col p-6 bg-white border border-neutral-100 rounded-[24px] shadow-sm hover:border-indigo-100 transition-colors"
                      >
                        <div className="flex gap-4 items-start mb-4">
                          <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                            <Lightbulb className="h-4 w-4 text-indigo-600" />
                          </div>
                          <p className="text-neutral-900 font-bold leading-snug">
                            {item.insight}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-neutral-50">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">
                              Supporting Evidence
                            </span>
                            <p className="text-xs text-neutral-600 font-mono bg-neutral-50 p-2 rounded-md border border-neutral-100">
                              {item.evidence && item.evidence.trim().length > 0
                                ? item.evidence
                                : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                              Strategic Implication
                            </span>
                            <p className="text-xs text-indigo-900 font-medium italic">
                              {item.implication &&
                              item.implication.trim().length > 0
                                ? item.implication
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* THE MARKET EDGE (Variant View) */}
                {hasMarketEdge ? (
                  <section className="p-8 bg-indigo-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Target className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-indigo-300" />
                        <h3 className="text-xl font-bold">The Market Edge</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/70">
                            Consensus View
                          </p>
                          <p className="text-sm text-indigo-100/80 leading-relaxed">
                            {stock.market_edge!.consensus_view}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Variant View (Our Alpha)
                          </p>
                          <p className="text-sm text-white font-medium leading-relaxed">
                            {stock.market_edge!.variant_view}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <p className="text-xs text-indigo-200">
                          <span className="font-bold text-white mr-2">
                            Why it matters:
                          </span>
                          {stock.market_edge!.why_it_matters}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>

              {/* SIDEBAR */}
              <div className="space-y-6">
                <SectionHeader eyebrow="Market Signal" title="Next Watch" />
                <div className="bg-neutral-900 rounded-[24px] p-6 text-white space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-white/40 mb-4 tracking-widest">
                      Upcoming Watch Items
                    </h5>
                    <ul className="space-y-4">
                      {(stock.what_to_watch_next || [])
                        .slice(0, 10)
                        .map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Clock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                            <span className="text-neutral-300">{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Pricing assessment */}
                  {hasPricing ? (
                    <div className="pt-6 border-t border-white/10">
                      <h5 className="text-[10px] font-black uppercase text-white/40 mb-4 tracking-widest">
                        Pricing Assessment
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">
                            Market Expectation
                          </p>
                          <p className="text-xs text-neutral-300 italic leading-relaxed">
                            "{stock.pricing_assessment!.market_expectation}"
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-emerald-300 font-bold uppercase mb-1">
                            Variant Outcome
                          </p>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {stock.pricing_assessment!.variant_outcome}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-rose-300 font-bold uppercase mb-1">
                            Valuation Sensitivity
                          </p>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {stock.pricing_assessment!.valuation_sensitivity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: THE THESIS */}
          <TabPanel value="thesis" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {(stock.thesis_points || []).map((point, i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 p-6 rounded-[24px] space-y-4 shadow-sm"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-neutral-900 leading-snug">
                    {point.claim}
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {point.why_it_matters}
                  </p>
                  <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[10px] font-black text-rose-500 uppercase mb-1">
                      Invalidation Trigger
                    </p>
                    <p className="text-xs text-neutral-500 italic">
                      {point.what_would_change_my_mind}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {(stock.scenarios || []).map((scen) => (
                <div
                  key={scen.name}
                  className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100"
                >
                  <h5 className="font-black text-[10px] uppercase text-neutral-400 mb-2 tracking-widest">
                    {scen.name} Scenario
                  </h5>
                  <p className="text-sm text-neutral-900 font-medium mb-3">
                    {scen.narrative}
                  </p>

                  {Array.isArray(scen.key_drivers) &&
                  scen.key_drivers.length > 0 ? (
                    <>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">
                        Key drivers
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {scen.key_drivers.slice(0, 6).map((d) => (
                          <span
                            key={d}
                            className="text-[9px] px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-500"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {Array.isArray(scen.watch_items) &&
                  scen.watch_items.length > 0 ? (
                    <>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">
                        Watch items
                      </p>
                      <ul className="space-y-1">
                        {scen.watch_items.slice(0, 4).map((w, i) => (
                          <li
                            key={`${scen.name}-${i}`}
                            className="text-xs text-neutral-600"
                          >
                            • {w}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </TabPanel>

          {/* TAB 3: CATALYSTS */}
          <TabPanel value="catalysts" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(stock.upcoming_catalysts || []).map((cat, i) => (
                <div
                  key={i}
                  className="group p-6 border border-neutral-200 rounded-[24px] bg-white hover:border-indigo-300 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Calendar className="h-4 w-4 text-neutral-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-neutral-400 uppercase">
                        Probability
                      </div>
                      <div className="text-lg font-bold text-indigo-600">
                        {Math.round((cat.probability ?? 0) * 100)}%
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-neutral-900 mb-1">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] font-black text-indigo-500 uppercase mb-3">
                    {cat.window}
                  </p>

                  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                    {cat.mechanism}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-neutral-50">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">
                      Market reaction
                    </p>
                    <p className="text-xs font-medium text-neutral-700">
                      {cat.likely_market_reaction}
                    </p>
                  </div>

                  {/* Compact extras without clutter */}
                  <div className="mt-4 space-y-2">
                    {Array.isArray(cat.impact_channels) &&
                    cat.impact_channels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cat.impact_channels.slice(0, 3).map((ch) => (
                          <span
                            key={ch}
                            className="text-[9px] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-600"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {Array.isArray(cat.key_watch_items) &&
                    cat.key_watch_items.length > 0 ? (
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        <span className="font-semibold text-neutral-700">
                          Watch:
                        </span>{" "}
                        {cat.key_watch_items.slice(0, 3).join(", ")}
                      </p>
                    ) : null}

                    {cat.magnitude || cat.priced_in ? (
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {cat.magnitude ? (
                          <>
                            <span className="font-semibold text-neutral-700">
                              Magnitude:
                            </span>{" "}
                            {cat.magnitude}
                          </>
                        ) : null}
                        {cat.magnitude && cat.priced_in ? (
                          <span> · </span>
                        ) : null}
                        {cat.priced_in ? (
                          <>
                            <span className="font-semibold text-neutral-700">
                              Priced in:
                            </span>{" "}
                            {cat.priced_in}
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* TAB 4: RISKS & DEBATES */}
          <TabPanel value="risks" className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Risk Assessment"
                title="Critical Watchpoints"
              />
              <div className="space-y-3">
                {(stock.stock_overflow_risks || []).map((risk, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl"
                  >
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-900 font-medium leading-relaxed">
                      {risk}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <SectionHeader
                eyebrow="Intelligence Debate"
                title="Bull vs Bear"
              />
              <div className="space-y-4">
                {(stock.key_debates || []).map((kd, i) => (
                  <div
                    key={i}
                    className="p-6 border border-neutral-200 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-bold text-sm text-neutral-900">
                        {kd.debate}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                        Monitor these indicators
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(kd.what_to_watch || []).slice(0, 8).map((item) => (
                          <span
                            key={item}
                            className="text-xs px-3 py-1 bg-neutral-100 rounded-full text-neutral-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

// --- Private Components ---

const SectionHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div className="space-y-1">
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
        variants[tone],
      )}
    >
      {children}
    </span>
  );
};
