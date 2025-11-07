/** ---------- Types matching your AI response ---------- */

export type ImpactLevel = "low" | "medium" | "high";
export type AlertStatus = "ok" | "triggered" | "snoozed";

export interface LatestDevelopment {
  headline: string;
  date: string; // ISO or YYYY-MM-DD
  source?: string;
  url?: string;
  cause?: string;
  impact?: string;
  assets_affected?: string[];
}

export interface Catalyst {
  date?: string;
  type?: string; // earnings, macro, product, vote
  description?: string;
  expected_direction?: "up" | "down" | "unclear";
  magnitude_basis?: string;
  confidence?: number; // 0..1
  assets_affected?: string[];
}

export interface Scenarios {
  bull?: string;
  base?: string;
  bear?: string;
  probabilities?: {
    bull?: number;
    base?: number;
    bear?: number;
  };
}

export interface ActionItem {
  title: string;
  rationale?: string;
  impact?: ImpactLevel;
  urgency?: ImpactLevel;
  effort?: ImpactLevel;
  targets?: string[];
  category?: "rebalance" | "alert" | "tax" | "hedge" | "research" | string;
}

export interface RiskItem {
  risk: string;
  why_it_matters?: string;
  monitor?: string;
  assets_affected?: string[];
}

export interface PortfolioAiData {
  latest_developments?: LatestDevelopment[];
  catalysts?: Catalyst[];
  scenarios?: Scenarios;
  actions?: ActionItem[];
  alerts?: { condition: string; status?: AlertStatus }[];
  risks_list?: RiskItem[];
  summary?: string;
  disclaimer?: string;
  // optional v2 sections
  predictions?: PredictionsBlock;
}

export interface PortfolioAiResponseOk {
  status: "ok";
  user_id: number;
  ai_layers: { data: PortfolioAiData };
}

export type PortfolioAiResponse =
  | PortfolioAiResponseOk
  | { status: "error"; error?: string; detail?: string; [k: string]: any };

// v2
export type Direction = "up" | "down" | "neutral";

export interface PredictionAsset {
  symbol: string;
  expected_direction: Direction;
  expected_change_pct?: number;
  confidence?: number; // 0..1
  rationale?: string;
}
export interface PredictionsBlock {
  forecast_window?: string; // "30D" | "90D"
  assets?: PredictionAsset[];
}
