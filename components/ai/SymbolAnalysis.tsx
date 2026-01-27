"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Compass,
  Zap,
  BarChart3,
  Scale,
  Lightbulb,
  Target,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabPanels,
  TabPanel,
} from "@/components/investment/tabs/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn Button
import type { StockAnalysis } from "@/types/symbol_analysis";

interface StockAnalysisCardProps {
  stock: StockAnalysis;
}

export function StockAnalysisCard({ stock }: StockAnalysisCardProps) {
  // Helper: Bullet parsing
  const getBullets = (source: any): string[] => {
    if (!source) return [];
    if (Array.isArray(source)) return source;
    if (typeof source === "object" && Array.isArray(source.bullets))
      return source.bullets;
    return [String(source)];
  };

  const rec = stock.recommendation?.toLowerCase() || "hold";
  const recColor =
    rec === "buy" ? "emerald" : rec === "sell" ? "rose" : "amber";

  return (
    <div className="w-full space-y-6">
      {/* 1. MAIN CARD CONTAINER */}
      <div className="rounded-[32px] border border-neutral-200 bg-white shadow-sm overflow-hidden font-sans">
        
        {/* HEADER */}
        <header className="p-6 lg:p-8 border-b border-neutral-100 relative overflow-hidden">
          {/* Subtle background pattern/gradient for visual depth */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {stock.symbol} Intelligence
                  </h3>
                  <p className="text-[11px] font-medium text-neutral-500">
                    Live Analysis • v2.4 Model
                  </p>
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-3">
                  {stock.symbol}
                </h1>
                <div className="text-sm font-medium leading-relaxed text-neutral-600 max-w-xl">
                  {getBullets(stock.unified_thesis)[0]}
                </div>
              </div>
            </div>

            {/* Verdict Module */}
            <div className="flex flex-col items-start lg:items-end gap-3 min-w-[200px]">
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className={cn(
                     "rounded-full px-3 py-1 text-[10px] uppercase font-black tracking-widest border",
                     stock.is_priced_in ? "bg-neutral-50 text-neutral-500 border-neutral-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                 )}>
                    {stock.is_priced_in ? "Priced In" : "High Alpha Potential"}
                 </Badge>
              </div>
              
              <div className={cn(
                  "flex flex-col items-center justify-center rounded-[24px] px-10 py-5 w-full lg:w-auto border transition-all hover:scale-[1.02]",
                  recColor === "emerald" ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" :
                  recColor === "rose" ? "bg-rose-50/50 border-rose-100 text-rose-700" :
                  "bg-amber-50/50 border-amber-100 text-amber-700"
              )}>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                      Recommendation
                  </span>
                  <span className="text-3xl font-bold tracking-tight">
                      {stock.recommendation}
                  </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. TABS */}
        <Tabs defaultValue="insights">
          <TabList className="px-6 border-b border-neutral-100 bg-neutral-50/30">
            <TabTrigger value="insights" className="gap-2 py-4 text-xs font-bold uppercase tracking-wide">
              <Compass className="h-4 w-4" /> Deep Dive
            </TabTrigger>
            <TabTrigger value="financials" className="gap-2 py-4 text-xs font-bold uppercase tracking-wide">
              <BarChart3 className="h-4 w-4" /> Peers & Data
            </TabTrigger>
            <TabTrigger value="scenarios" className="gap-2 py-4 text-xs font-bold uppercase tracking-wide">
              <Scale className="h-4 w-4" /> Scenarios
            </TabTrigger>
            <TabTrigger value="catalysts" className="gap-2 py-4 text-xs font-bold uppercase tracking-wide">
              <Zap className="h-4 w-4" /> Timeline
            </TabTrigger>
          </TabList>

          <TabPanels className="p-6 lg:p-8 min-h-[500px]">
            
            {/* --- TAB 1: INSIGHTS --- */}
            <TabPanel value="insights" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid lg:grid-cols-[1fr_340px] gap-8">
                    {/* Main Narrative */}
                    <div className="space-y-8">
                        <section>
                            <SectionTitle icon={Lightbulb} title="Strategic Insights" />
                            <div className="space-y-6">
                                {(stock.key_insights || []).map((insight, i) => (
                                    <NarrativeBlock key={i} title={`Insight ${i+1}`} text={insight.insight}>
                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                            <div className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 border border-neutral-100">
                                                <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Evidence</span>
                                                {insight.evidence}
                                            </div>
                                            <div className="rounded-xl bg-indigo-50/50 p-3 text-xs text-indigo-900 border border-indigo-100/50">
                                                <span className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Implication</span>
                                                {insight.implication}
                                            </div>
                                        </div>
                                    </NarrativeBlock>
                                ))}
                            </div>
                        </section>

                        {/* V2 Enhancement: Interactive Market Edge */}
                        {stock.market_edge && (
                             <section className="relative overflow-hidden rounded-[32px] border border-amber-100 bg-amber-50/30 p-6 lg:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-amber-600" />
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-700">The Market Edge</h3>
                                    </div>
                                    <AgenticButton label="Ask AI to expand" />
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                    {/* Consensus */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-neutral-300" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Wall St. Consensus</p>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-600 leading-relaxed pl-4 border-l-2 border-neutral-200">
                                            {stock.market_edge.consensus_view}
                                        </p>
                                    </div>
                                    {/* Variant */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Our Variant View</p>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900 leading-relaxed pl-4 border-l-2 border-emerald-400">
                                            {stock.market_edge.variant_view}
                                        </p>
                                    </div>
                                </div>
                             </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <ConfidenceWidget score={stock.confidence} />
                        
                        <div className="rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-4">
                                Technical Setup
                            </h3>
                            <ul className="space-y-4">
                                {getBullets(stock.current_performance).map((pt, i) => (
                                    <li key={i} className="flex gap-3 text-xs font-medium text-neutral-600 leading-relaxed">
                                        <TrendingUp className="h-4 w-4 text-neutral-300 shrink-0" />
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </TabPanel>

            {/* --- TAB 2: FINANCIALS (RADAR ENHANCED) --- */}
            <TabPanel value="financials" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {stock.peer_comparison ? (
                    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                        
                        {/* LEFT: BENCHMARK TABLE */}
                        <div className="rounded-[32px] border border-neutral-200 bg-white overflow-hidden shadow-sm h-fit">
                            <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500">Fundamentals</span>
                                <span className="text-[10px] font-medium text-neutral-400">Benchmark: {stock.peer_comparison.peers_used.length} peers</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-white">
                                        <tr>
                                            <th className="px-6 py-4 font-black">Metric</th>
                                            <th className="px-6 py-4 text-right">{stock.symbol}</th>
                                            <th className="px-6 py-4 text-right">Median</th>
                                            <th className="px-6 py-4">Percentile</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        <StatRow label="P/E (TTM)" data={stock.peer_comparison.key_stats.pe_ttm} inverse />
                                        <StatRow label="Rev Growth" data={stock.peer_comparison.key_stats.revenue_growth_yoy} format={(v) => `${v}%`} />
                                        <StatRow label="Op Margin" data={stock.peer_comparison.key_stats.operating_margin} format={(v) => `${v}%`} />
                                        <StatRow label="Debt/Eq" data={stock.peer_comparison.key_stats.debt_to_equity} inverse />
                                        <StatRow label="Gross Margin" data={stock.peer_comparison.key_stats.gross_margin} format={(v) => `${v}%`} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* RIGHT: V2 RADAR CHART */}
                        <div className="space-y-6">
                            <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm flex flex-col items-center">
                                <div className="mb-2 w-full flex justify-between items-center">
                                     <SectionTitle icon={BarChart3} title="Factor Profile" />
                                     <Badge variant="secondary" className="text-[9px]">Relative to Peers</Badge>
                                </div>
                                
                                <PeerRadarChart scores={stock.peer_comparison.scores} />
                                
                                <div className="w-full mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Overall Score</span>
                                    <span className="text-xl font-bold text-indigo-600">{Math.round(stock.peer_comparison.scores.overall)}/100</span>
                                </div>
                            </div>

                             {/* Summary Points */}
                             <div className="space-y-2">
                                {(stock.peer_comparison_summary || []).map((sum, i) => (
                                    <div key={i} className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 text-xs text-neutral-600 shadow-sm leading-relaxed">
                                        <span className="text-indigo-500 mr-2">•</span> {sum}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Empty msg="No peer data available" />
                )}
            </TabPanel>

            {/* --- TAB 3: SCENARIOS --- */}
            <TabPanel value="scenarios" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* 3 Columns for Scenarios */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                     {(stock.scenarios || []).map((scen, i) => {
                         const type = scen.name.toLowerCase();
                         const color = type.includes('bull') ? 'emerald' : type.includes('bear') ? 'rose' : 'blue';
                         
                         return (
                            <motion.div
                                key={scen.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative flex flex-col rounded-[32px] border p-6 shadow-sm transition-all hover:shadow-md",
                                    color === "emerald" ? "border-emerald-100 bg-emerald-50/20" :
                                    color === "rose" ? "border-rose-100 bg-rose-50/20" :
                                    "border-neutral-200 bg-white"
                                )}
                            >
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
                                    {scen.name} Case
                                </h4>
                                <p className="text-sm font-medium leading-relaxed text-neutral-700 mb-6 flex-1">
                                    {scen.narrative}
                                </p>
                                
                                {scen.key_drivers && (
                                    <div className="space-y-2 pt-4 border-t border-neutral-200/50">
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-neutral-400">Drivers</span>
                                        <div className="flex flex-wrap gap-1">
                                            {scen.key_drivers.slice(0,3).map(d => (
                                                <span key={d} className="px-2 py-1 rounded-md bg-white/60 border border-neutral-200/50 text-[10px] text-neutral-600 font-medium">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                         )
                     })}
                </div>

                <div className="rounded-[32px] border border-neutral-200 bg-white p-8">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle icon={Scale} title="Thesis Points" />
                        <AgenticButton label="Challenge this thesis" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {(stock.thesis_points || []).map((tp, i) => (
                             <div key={i} className="group relative pl-6">
                                <div className="absolute left-0 top-1 h-full w-[2px] bg-neutral-100 group-hover:bg-indigo-500 transition-colors" />
                                <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-neutral-200 group-hover:bg-indigo-500 transition-colors" />
                                
                                <h5 className="text-xs font-bold text-neutral-900 mb-2">{tp.claim}</h5>
                                <p className="text-[13px] text-neutral-500 leading-relaxed mb-3">{tp.why_it_matters}</p>
                                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-600 italic">
                                    <Info className="h-3 w-3 mt-0.5" />
                                    <span>If {tp.what_would_change_my_mind} happens, this thesis breaks.</span>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            </TabPanel>

            {/* --- TAB 4: CATALYSTS (TIMELINE ENHANCED) --- */}
            <TabPanel value="catalysts" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                         <SectionTitle icon={Calendar} title="Event Timeline" />
                         <Badge variant="secondary" className="bg-neutral-100 text-neutral-500">Upcoming 12 Months</Badge>
                    </div>

                    <div className="relative border-l border-neutral-200 ml-4 space-y-8">
                        {(stock.upcoming_catalysts || []).map((cat, i) => (
                            <div key={i} className="relative pl-8">
                                {/* Timeline Node */}
                                <div className={cn(
                                    "absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full border-2 border-white ring-1",
                                    cat.magnitude === 'High' ? "bg-indigo-500 ring-indigo-200" : "bg-neutral-300 ring-neutral-200"
                                )} />
                                
                                <div className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-sm hover:border-indigo-200 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                                                {cat.window}
                                            </span>
                                            {cat.magnitude === 'High' && (
                                                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                                                    <Zap className="h-3 w-3" /> High Impact
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-neutral-400">
                                            {Math.round((cat.probability || 0) * 100)}% Probability
                                        </div>
                                    </div>

                                    <h4 className="text-base font-bold text-neutral-900 mb-2">{cat.name}</h4>
                                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                                        {cat.mechanism}
                                    </p>

                                    <div className="flex items-center gap-2 pt-4 border-t border-neutral-50">
                                        <ArrowRight className="h-3 w-3 text-neutral-400" />
                                        <span className="text-xs text-neutral-500">
                                            <strong className="text-neutral-700">Market Reaction:</strong> {cat.likely_market_reaction}
                                        </span>
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
    </div>
  );
}

// --- V2 SUB-COMPONENTS ---

function PeerRadarChart({ scores }: { scores: any }) {
    // Transform flat scores into array for Recharts
    const data = [
        { subject: 'Value', A: scores.valuation, fullMark: 100 },
        { subject: 'Growth', A: scores.growth, fullMark: 100 },
        { subject: 'Quality', A: scores.quality, fullMark: 100 },
        { subject: 'Health', A: scores.financial_health, fullMark: 100 },
    ];

    return (
        <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Stock"
                        dataKey="A"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="#6366f1"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        </div>
    )
}

function AgenticButton({ label }: { label: string }) {
    return (
        <Button variant="ghost" size="sm" className="h-7 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 text-[10px] uppercase font-bold tracking-wide px-3 gap-1.5 transition-colors">
            <Sparkles className="h-3 w-3" />
            {label}
        </Button>
    )
}

function NarrativeBlock({ title, text, children }: { title: string, text: string, children?: React.ReactNode }) {
    return (
        <div className="group relative pl-4">
            <div className="absolute left-0 top-1 h-full w-[2px] bg-neutral-100 group-hover:bg-indigo-500 transition-colors" />
            <h5 className="mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-indigo-500 transition-colors">
                {title}
            </h5>
            <p className="text-[14px] leading-relaxed text-neutral-700 font-medium">
                {text}
            </p>
            {children}
        </div>
    )
}

function ConfidenceWidget({ score }: { score: number }) {
    const pct = Math.round((score || 0) * 100);
    return (
        <div className="rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-neutral-900">AI Confidence</h3>
                <MessageSquare className="h-4 w-4 text-neutral-300" />
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight text-neutral-500">
                    <span>Certainty</span>
                    <span className="text-neutral-900 font-mono">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-neutral-900"
                    />
                </div>
            </div>
        </div>
    )
}

function StatRow({ label, data, format = (v) => v.toFixed(2), inverse = false }: { label: string, data: any, format?: (v: number) => string, inverse?: boolean }) {
    let isGood = inverse ? data.company_percentile < 40 : data.company_percentile > 60;
    
    return (
        <tr className="group hover:bg-neutral-50/50 transition-colors">
             <td className="px-6 py-4 font-medium text-neutral-700">{label}</td>
             <td className={cn("px-6 py-4 text-right font-bold tabular-nums", isGood ? "text-emerald-600" : "text-neutral-900")}>
                 {format(data.company)}
             </td>
             <td className="px-6 py-4 text-right text-neutral-500 tabular-nums">
                 {format(data.peer_median)}
             </td>
             <td className="px-6 py-4">
                 <div className="flex items-center gap-2">
                     <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden">
                         <div className="h-full bg-neutral-800" style={{ width: `${data.company_percentile}%`}} />
                     </div>
                     <span className="text-[10px] text-neutral-400 font-mono">{Math.round(data.company_percentile)}</span>
                 </div>
             </td>
        </tr>
    )
}

function Empty({ msg }: { msg: string }) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 py-16 text-center">
        <Info className="mb-3 h-8 w-8 text-neutral-200" />
        <p className="text-sm font-medium text-neutral-500 italic">{msg}</p>
      </div>
    );
}