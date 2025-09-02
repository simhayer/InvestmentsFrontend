export type QuoteResponse = {
  status: "ok" | "error";
  symbol: string;
  name?: string;
  currency?: string;
  exchange?: string;
  quote_time_utc?: string | null;
  current_price?: number | null;
  previous_close?: number | null;
  day_change?: number | null; // absolute change
  day_change_pct?: number | null; // percent change (already in % units per your backend sample)
  ["52_week_high"]?: number | null;
  ["52_week_low"]?: number | null;
  distance_from_52w_high_pct?: number | null;
  distance_from_52w_low_pct?: number | null;
  market_cap?: number | null;
  pe_ratio?: number | null;
  forward_pe?: number | null;
  price_to_book?: number | null;
  beta?: number | null;
  dividend_yield?: number | null; // fraction, ex: 0.0045
  return_on_equity?: number | null; // fraction
  profit_margins?: number | null; // fraction
  earnings_growth?: number | null; // fraction
  revenue_growth?: number | null; // fraction
  recommendation?: number | null; // 1..5
  recommendation_key?: string | null; // buy/hold/sell
  target_price?: number | null;
  data_quality?: {
    source?: string;
    fetched_at_utc?: string;
    is_stale?: boolean;
    missing_fields?: string[];
  };
};

export type CandlePoint = {
  t: string | number; // ISO timestamp or epoch (ms/sec)
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
};

export type HistoryResponse = {
  status: "ok" | "error";
  symbol: string;
  period: string;
  interval: string;
  points: CandlePoint[];
};

export const RANGE_PRESETS: {
  label: string;
  period: string;
  interval: string;
}[] = [
  { label: "1D", period: "1d", interval: "5m" },
  { label: "5D", period: "5d", interval: "15m" },
  { label: "1M", period: "1mo", interval: "1h" },
  { label: "6M", period: "6mo", interval: "1d" },
  { label: "YTD", period: "ytd", interval: "1d" },
  { label: "1Y", period: "1y", interval: "1d" },
  { label: "5Y", period: "5y", interval: "1wk" },
  { label: "MAX", period: "max", interval: "1mo" },
];
