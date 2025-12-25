// =========================
// File: types.ts
// Schema types matching the new portfolio analysis payload
// =========================

export type SymbolKey = string;

export interface PortfolioMetrics {
  cash_value: number;
  total_value: number;
  num_positions: number;
  concentration_top_5_pct: number;

  asset_class_weights_pct: Record<string, number>;

  // optional breakdowns (may be absent depending on backend)
  region_weights_pct?: Record<string, number>;
  sector_weights_pct?: Record<string, number>;

  // optional risk (often null)
  vol_30D_pct?: number | null;
  max_drawdown_1Y_pct?: number | null;

  // optional classification buckets (you might not always compute)
  core_weight_pct?: number | null;
  speculative_weight_pct?: number | null;
  hedge_weight_pct?: number | null;

  // your extra fields
  base_currency?: string;
  usd_to_cad?: number | null;
}

export interface PerSymbolMetrics {
  symbol: string;
  name: string;
  asset_class: string;

  sector?: string;
  region?: string;

  weight_pct: number;
  market_value: number;
  cost_basis: number;

  unrealized_pnl_abs: number | null;
  unrealized_pnl_pct: number | null;

  // quote/fundamentals you currently return
  quote_currency?: string | null;
  price_status?: string | null;

  pe_ratio?: number | null;
  forward_pe?: number | null;
  market_cap?: number | null;
  dividend_yield?: number | null;
  price_to_book?: number | null;

  beta_1Y?: number | null;

  // optional perf/risk (often null if you don’t compute history)
  return_1D_pct?: number | null;
  return_1W_pct?: number | null;
  return_1M_pct?: number | null;
  return_3M_pct?: number | null;
  return_1Y_pct?: number | null;
  vol_30D_pct?: number | null;
  max_drawdown_1Y_pct?: number | null;

  is_leveraged?: boolean | null;

  // if you decide to merge holdings into UI rows later (recommended)
  current_price?: number | null;
  purchase_unit_price?: number | null;
  day_pl?: number | null;
}

export interface MetricsLayer {
  portfolio: PortfolioMetrics;
  per_symbol: Record<SymbolKey, PerSymbolMetrics>;
}

export interface SummaryExplainability {
  assumptions: string[];
  limitations: string[];
  confidence_overall: number;
  section_confidence: Record<string, number>;
}

export interface SummaryLayer {
  summary: string;
  disclaimer: string;
  explainability: SummaryExplainability;
}

export interface PredictionAsset {
  symbol: string;
  rationale: string;
  confidence: number; // 0..1 or 0..1?
  expected_direction: "up" | "down" | "neutral";
  expected_change_pct: number; // +/- percent
}

export interface PerformanceExplainability {
  assumptions: string[];
  limitations: string[];
  section_confidence: Record<string, number>;
}

export interface PerformanceAnalysis {
  leaders: string[];
  laggards: string[];
  notable_shifts: string[];
  summary: string;
}

export interface PerformanceLayer {
  predictions: {
    assets: PredictionAsset[];
    forecast_window: string;
  };
  explainability: PerformanceExplainability;
  performance_analysis: PerformanceAnalysis;
}

export interface CatalystItem {
  date: string; // ISO or range like "2025-11-18 to 2025-11-21"
  type: string; // earnings | event | dividend | etc
  confidence: number;
  description: string;
  assets_affected: string[];
  magnitude_basis: string;
  expected_direction: "up" | "down" | "neutral" | "unclear";
}

export interface SentimentDriver {
  tone: "positive" | "negative" | "neutral";
  theme: string;
  impact: string;
}

export interface LatestDevelopmentItem {
  url: string;
  date: string;
  cause: string;
  impact: string;
  source: string;
  headline: string;
  assets_affected: string[];
}

export interface NewsSentimentLayer {
  catalysts: CatalystItem[];
  sentiment: {
    drivers: SentimentDriver[];
    summary: string;
    overall_sentiment: "positive" | "negative" | "neutral";
    sources_considered: string[];
  };
  risks_list: Array<{
    risk: string;
    monitor: string;
    why_it_matters: string;
    assets_affected: string[];
  }>;
  explainability: {
    assumptions: string[];
    limitations: string[];
    section_confidence: Record<string, number>;
  };
  latest_developments: LatestDevelopmentItem[];
}

export interface ActionItem {
  title: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  targets: string[];
  urgency: "low" | "medium" | "high";
  category: string;
  rationale: string;
}

export interface ScenariosLayer {
  actions: ActionItem[];
  scenarios: {
    base: string;
    bear: string;
    bull: string;
    probabilities: { base: number; bear: number; bull: number };
  };
  explainability: {
    assumptions: string[];
    limitations: string[];
    section_confidence: Record<string, number>;
  };
  market_outlook: {
    key_risks: string[];
    short_term: string;
    medium_term: string;
    key_opportunities: string[];
  };
  rebalance_paths: Record<
    string,
    {
      actions: string[];
      summary: string;
      risk_flags: string[];
      allocation_notes: string[];
    }
  >;
}

export interface AiLayers {
  metrics: MetricsLayer;
  summary: SummaryLayer;
  performance: PerformanceLayer;
  news_sentiment: NewsSentimentLayer;
  scenarios_rebalance: ScenariosLayer;
}

export interface PortfolioAnalysisResponse {
  status: "ok" | "error";
  user_id: number;
  cached?: boolean;
  cached_at?: string;
  ttl_seconds_remaining?: number;
  ai_layers: AiLayers;
}
