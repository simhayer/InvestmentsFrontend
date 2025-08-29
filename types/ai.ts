// types/ai.ts
export type Rating = "hold" | "sell" | "watch" | "diversify" | string;

export type LinkupItem = {
  title: string;
  url: string;
  snippet?: string | null;
  published_at?: string | null;
};

export type LinkupPayload = {
  items: LinkupItem[];
  answer?: string | null;
  rating?: Rating;
  raw?: unknown;
};

export type Scenario = {
  name: string;
  prob: number; // 0..1
  drivers: string[];
  watch: string[];
  invalidations: string[];
  urls?: string[];
};

export type ForecastEvent = {
  date: string;              // ISO-8601
  event: string;
  why: string;
  url?: string;
};

export type ForecastAnalysis = {
  confidence: number;        // 0..1
  scenarios: Scenario[];
  events: ForecastEvent[];
  notes?: string[];
  risk_level?: "low" | "moderate" | "high" | string;
  disclaimer?: string;
};

export type YahooSnapshot = {
  current_price?: number;
  day_change_pct?: number;
  low_52w?: number;
  high_52w?: number;
  distance_from_52w_high_pct?: number;
  distance_from_52w_low_pct?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  beta?: number;
  earnings_date_utc?: string;
  ex_dividend_date_utc?: string;
  currency?: string;
};

export type PositionContext = {
  weight_pct?: number;
  pnl_abs?: number;
  pnl_pct?: number;
};

export type CombinedInsight = {
  news?: LinkupPayload;
  analysis?: ForecastAnalysis;
  yahoo?: YahooSnapshot;
  position?: PositionContext;
};

// Type guard helpers
export const isLinkupPayload = (v: unknown): v is LinkupPayload =>
  !!v && typeof v === "object" && Array.isArray((v as any).items);

export const isForecast = (v: unknown): v is ForecastAnalysis =>
  !!v && typeof v === "object" && Array.isArray((v as any).scenarios);

export const isHoldingAnalysis = (v: any): v is HoldingAIAnalysis => {
  return (
    v &&
    typeof v === "object" &&
    typeof v.symbol === "string" &&
    typeof v.as_of_utc === "string" &&
    typeof v.rating === "string" &&
    typeof v.rationale === "string" &&
    Array.isArray(v.key_risks) &&
    Array.isArray(v.suggestions) &&
    typeof v.disclaimer === "string"
  );
};


export type HoldingAIAnalysis = {
  symbol: string;
  as_of_utc: string;
  rating: "hold" | "sell" | "watch" | "diversify";
  rationale: string;
  key_risks: string[];
  suggestions: string[];
  data_notes?: string[];
  disclaimer: string;
  sources?: { title?: string; url: string; host?: string }[];
  provider_used?: string;
  // optionally present (if you added them in the prompt)
  events?: { date?: string; label: string; url?: string }[];
  next_dates?: { earnings_date?: string; ex_dividend_date?: string };
};