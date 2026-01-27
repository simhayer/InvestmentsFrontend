
export type PeerScores = {
  valuation: number;
  growth: number;
  quality: number;
  financial_health: number;
  overall: number;
};

export type PeerStatMetric = {
  company: number;
  peer_median: number;
  company_percentile: number;
  peer_count: number;
  higher_is_better: boolean;
};

export type PeerKeyStats = {
  pe_ttm: PeerStatMetric;
  revenue_growth_yoy: PeerStatMetric;
  operating_margin: PeerStatMetric;
  debt_to_equity: PeerStatMetric;
  gross_margin: PeerStatMetric;
};

export type PeerComparison = {
  peers_used: string[];
  scores: PeerScores;
  key_stats: PeerKeyStats;
};

// Update the main StockAnalysis type
export type StockAnalysis = {
  symbol: string;
  key_insights: KeyInsight[];
  current_performance: { bullets: string[] } | string; // Updated to handle object or string
  key_risks: string[];
  price_outlook: { bullets: string[] } | string; // Updated
  recommendation: string;
  confidence: number;
  is_priced_in: boolean;
  unified_thesis: { bullets: string[] } | string; // Updated
  thesis_points: ThesisPoint[];
  upcoming_catalysts: Catalyst[];
  scenarios: Scenario[];
  market_expectations?: string[];
  key_debates?: KeyDebate[];
  what_to_watch_next: string[];
  data_quality_notes: string[];
  market_edge?: MarketEdge | null;
  pricing_assessment?: PricingAssessment | null;
  // NEW FIELD
  peer_comparison?: PeerComparison;
  peer_comparison_summary?: string[];
};

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
