// types/crypto_analysis.ts

export type Verdict = "Bullish" | "Bearish" | "Neutral";
export type Confidence = "High" | "Medium" | "Low";
export type MarketPositionAssessment = "Leader" | "Mid-Cap" | "Small-Cap" | "Micro-Cap";
export type RiskAssessment = "Conservative" | "Moderate" | "Aggressive" | "Speculative";
export type PriceTrend = "Uptrend" | "Downtrend" | "Sideways" | "Recovery";

export interface AssessmentSection {
  assessment: string;
  reasoning: string;
}

export interface PriceActionSection {
  trend: PriceTrend;
  reasoning: string;
}

export interface CryptoAnalysisReport {
  symbol: string;
  summary: string;
  verdict: Verdict;
  confidence: Confidence;
  marketPosition: AssessmentSection;
  riskProfile: AssessmentSection;
  priceAction: PriceActionSection;
  bullCase: string[];
  bearCase: string[];
  risks: string[];
  catalysts: string[];
  technicalNotes?: string | null;
}

export interface CryptoInlineInsights {
  marketCapBadge: string;
  volatilityCallout: string;
  trendSignal: string;
  riskFlag?: string | null;
  momentumNote: string;
}

export interface CryptoMarketData {
  currentPrice?: number | null;
  dayChangePct?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  high52w?: number | null;
  low52w?: number | null;
}

export interface CryptoRiskMetrics {
  volatility_annualized?: number | null;
  max_drawdown?: number | null;
  sharpe_ratio?: number | null;
  sortino_ratio?: number | null;
  beta?: number | null;
  trading_days?: number | null;
}

export interface CryptoAnalysisResponse {
  symbol: string;
  report: CryptoAnalysisReport;
  inline?: CryptoInlineInsights | null;
  riskMetrics?: CryptoRiskMetrics | null;
  marketData?: CryptoMarketData | null;
  dataGaps: string[];
  cached?: boolean | null;
  lastAnalyzedAt?: string | null;
}

// Helper to get verdict color
export function getVerdictColor(verdict: Verdict) {
  switch (verdict) {
    case "Bullish":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "Bearish":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    case "Neutral":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  }
}

// Helper to get risk profile styling
export function getRiskProfileStyle(assessment: string) {
  switch (assessment) {
    case "Conservative":
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    case "Moderate":
      return { bg: "bg-amber-100", text: "text-amber-700" };
    case "Aggressive":
      return { bg: "bg-orange-100", text: "text-orange-700" };
    case "Speculative":
      return { bg: "bg-rose-100", text: "text-rose-700" };
    default:
      return { bg: "bg-neutral-100", text: "text-neutral-700" };
  }
}

// Helper to get market position styling
export function getMarketPositionStyle(assessment: string) {
  switch (assessment) {
    case "Leader":
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    case "Mid-Cap":
      return { bg: "bg-blue-100", text: "text-blue-700" };
    case "Small-Cap":
      return { bg: "bg-amber-100", text: "text-amber-700" };
    case "Micro-Cap":
      return { bg: "bg-rose-100", text: "text-rose-700" };
    default:
      return { bg: "bg-neutral-100", text: "text-neutral-700" };
  }
}
