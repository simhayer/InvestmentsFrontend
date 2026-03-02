export type HeaderCardProps = {
  title: string;
  subtitle: string;
  outlook: string | null;
  asOf: string;
};

export type AIInsightCardProps = {
  title: string;
  summary: string;
  signal: "bullish" | "bearish" | "neutral";
  time_horizon: string;
};

export type WorldBriefCardProps = {
  headline: string;
  cause: string;
  impact: string;
};

export type MarketPulseItemProps = {
  key: string;
  label: string;
  symbol?: string;
  price: number | null;
  changeAbs?: number | null;
  changePct: number | null;
  currency: string | null;
  sparkline?: number[];
  lastUpdated?: string;
  error?: string;
};

export type MarketPulseGroupProps = {
  key: "major_indices" | "crypto" | "risk_signals" | string;
  label: string;
  items: MarketPulseItemProps[];
};

export type NewsItemCardProps = {
  title: string | null;
  url: string | null;
  source: string | null;
  published_at: string | null;
  snippet: string | null;
  image: string | null;
};

export type NewsStreamGroupProps = {
  key: "general" | "merger" | "forex" | "crypto" | string;
  label: string;
  items: NewsItemCardProps[];
};

export type PersonalizationScope = "portfolio" | "watchlist" | "global_fallback";

export type WatchlistSummary = {
  id: number;
  name: string;
  is_default: boolean;
};

export type PersonalizedTopPosition = {
  symbol: string;
  name: string;
  weight: number;
  current_value: number;
  unrealized_pl_pct: number;
  current_price: number;
  currency: string;
};

export type PortfolioSnapshot = {
  positions_count: number;
  market_value: number;
  day_pl: number;
  day_pl_pct: number;
  currency: string;
};

export type InlineInsights = {
  healthBadge: string | null;
  performanceNote: string | null;
  riskFlag: string | null;
  topPerformer: string | null;
  actionNeeded: string | null;
};

export type FocusNewsGroup = {
  symbol: string;
  items: NewsItemCardProps[];
};

export type PersonalizedMonitorData = {
  scope: PersonalizationScope;
  currency: string;
  symbols: string[];
  watchlist: WatchlistSummary | null;
  top_positions: PersonalizedTopPosition[];
  portfolio_snapshot: PortfolioSnapshot | null;
  inline_insights: InlineInsights | null;
  insight_cards: AIInsightCardProps[];
  focus_news: FocusNewsGroup[];
  empty_state: string | null;
};

export type MonitorPanelData = {
  as_of: string;
  title: string;
  subtitle: string;
  outlook: string | null;
  sections: {
    world_brief: {
      market: string;
      sections: WorldBriefCardProps[];
    };
    ai_insights: AIInsightCardProps[];
    market_pulse: MarketPulseGroupProps[];
    news_streams: NewsStreamGroupProps[];
  };
  meta: {
    sources: string[];
      generated_at: string;
      news_categories: string[];
    };
  personalization?: PersonalizedMonitorData | null;
};

export type MonitorPanelResponse = {
  message?: string;
  data: MonitorPanelData;
};
