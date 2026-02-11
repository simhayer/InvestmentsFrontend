// types/stock-analysis.ts

export type Verdict = "Bullish" | "Bearish" | "Neutral";
export type Confidence = "High" | "Medium" | "Low";
export type Assessment = "Cheap" | "Fair" | "Expensive" | "Strong" | "Moderate" | "Weak" | "Solid" | "Adequate" | "Concerning";
export type EarningsTrend = "Beating" | "Mixed" | "Missing";
export type GrowthTrajectory = "Accelerating" | "Stable" | "Decelerating";

export interface AssessmentSection {
  assessment: Assessment;
  reasoning: string;
}

export interface MomentumSection {
  earningsTrend: EarningsTrend;
  growthTrajectory: GrowthTrajectory;
}

export interface AnalysisReport {
  symbol: string;
  summary: string;
  verdict: Verdict;
  confidence: Confidence;
  valuation: AssessmentSection;
  profitability: AssessmentSection;
  financialHealth: AssessmentSection;
  momentum: MomentumSection;
  bullCase: string[];
  bearCase: string[];
  risks: string[];
  catalysts: string[];
  technicalNotes?: string | null;
  peerComparison?: string | null;
}

export interface InlineInsights {
  valuationBadge: string;
  marginCallout: string;
  earningsFlag: string;
  healthNote: string;
  momentumSignal: string;
  riskFlag?: string | null;
}

export interface StockAnalysisResponse {
  symbol: string;
  report: AnalysisReport;
  inline?: InlineInsights;
  dataGaps: string[];
}

export interface QuickSummaryResponse {
  symbol: string;
  summary: string;
  verdict: Verdict;
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

// Helper to get confidence indicator
export function getConfidenceLevel(confidence: Confidence) {
  switch (confidence) {
    case "High":
      return { bars: 3, color: "bg-emerald-500" };
    case "Medium":
      return { bars: 2, color: "bg-amber-500" };
    case "Low":
      return { bars: 1, color: "bg-neutral-400" };
  }
}

// Helper to get assessment styling
export function getAssessmentStyle(assessment: Assessment) {
  const positive = ["Cheap", "Strong", "Solid"];
  const negative = ["Expensive", "Weak", "Concerning"];
  
  if (positive.includes(assessment)) {
    return { bg: "bg-emerald-100", text: "text-emerald-700" };
  }
  if (negative.includes(assessment)) {
    return { bg: "bg-rose-100", text: "text-rose-700" };
  }
  return { bg: "bg-amber-100", text: "text-amber-700" };
}