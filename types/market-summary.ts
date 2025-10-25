export interface MarketSection {
  headline: string;
  cause?: string;
  impact?: string;
  affected_assets?: string[];
  sources?: string[];
}

export interface MarketSummaryData {
  as_of: string;
  market: string;
  sections: MarketSection[];
}

export interface MarketSummaryResponse {
  message: string;
  data: MarketSummaryData;
  meta?: MarketSummaryMeta;
}

export interface MarketSummaryMeta {
  updated_at?: string; // server-side store time (ISO)
  generated_at?: string; // optional
}
