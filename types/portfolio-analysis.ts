// types/portfolio-analysis.ts

export type PortfolioHealth = "Excellent" | "Good" | "Fair" | "Needs Attention";
export type RiskLevel = "Low" | "Moderate" | "High" | "Very High";
export type DiversificationAssessment = "Well Diversified" | "Adequate" | "Concentrated" | "Highly Concentrated";
export type PerformanceAssessment = "Strong" | "Moderate" | "Weak" | "Mixed";
export type RiskAssessment = "Conservative" | "Balanced" | "Aggressive" | "Speculative";

export interface AssessmentSection {
  assessment: string;
  detail: string;
}

export interface PositionInsight {
  symbol: string;
  reasoning?: string;
  issue?: string;
}

export interface ActionItem {
  action: "reduce" | "add" | "hold" | "sell" | "buy";
  symbol?: string;
  reasoning: string;
}

export interface PortfolioReport {
  summary: string;
  health: PortfolioHealth;
  riskLevel: RiskLevel;
  diversification: AssessmentSection;
  performance: AssessmentSection;
  riskExposure: AssessmentSection;
  topConviction: PositionInsight[];
  concerns: PositionInsight[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  rebalancingSuggestions: string[];
  actionItems: ActionItem[];
}

export interface PortfolioInlineInsights {
  healthBadge: string;
  performanceNote: string;
  riskFlag?: string | null;
  topPerformer: string;
  actionNeeded?: string | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPL: number;
  totalPLPct: number;
  dayPL: number;
  positionCount: number;
  currency: string;
}

export interface BenchmarkMetrics {
  symbol: string;
  annualized_return?: number | null;
  volatility?: number | null;
  max_drawdown?: number | null;
  sharpe_ratio?: number | null;
}

export interface SymbolRiskMetrics {
  volatility_annualized?: number | null;
  max_drawdown?: number | null;
  sharpe_ratio?: number | null;
  sortino_ratio?: number | null;
  beta?: number | null;
  trading_days?: number | null;
}

export interface PortfolioRiskMetrics {
  portfolio_beta?: number | null;
  portfolio_volatility_weighted?: number | null;
  hhi_concentration?: number | null;
  avg_correlation_top_holdings?: number | null;
  symbols_analyzed?: number | null;
  per_symbol?: Record<string, SymbolRiskMetrics> | null;
  benchmark?: BenchmarkMetrics | null;
}

export interface PortfolioAnalysisResponse {
  report: PortfolioReport;
  inline?: PortfolioInlineInsights;
  portfolioSummary: PortfolioSummary;
  riskMetrics?: PortfolioRiskMetrics | null;
  dataGaps: string[];
  cached?: boolean | null;
  lastAnalyzedAt?: string | null;
}

export interface QuickPortfolioSummary {
  summary: string;
  health: PortfolioHealth;
}

// Helper functions
export function getHealthColor(health: PortfolioHealth) {
  switch (health) {
    case "Excellent":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "Good":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "Fair":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "Needs Attention":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
  }
}

export function getRiskColor(risk: RiskLevel) {
  switch (risk) {
    case "Low":
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    case "Moderate":
      return { bg: "bg-blue-100", text: "text-blue-700" };
    case "High":
      return { bg: "bg-amber-100", text: "text-amber-700" };
    case "Very High":
      return { bg: "bg-rose-100", text: "text-rose-700" };
  }
}