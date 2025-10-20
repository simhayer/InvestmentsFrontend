export type MarketIndexKey = "SPX" | "IXIC" | "TSX" | "BTC";

export type MarketIndexItem = {
  key: MarketIndexKey;
  label: string; // e.g., "S&P 500"
  symbol: string; // e.g., ^GSPC, ^IXIC, ^GSPTSE, BTC-USD
  price: number; // latest price/level
  changeAbs: number; // absolute change vs prev close
  changePct: number; // percent change vs prev close
  currency: "USD" | "CAD" | string;
  // Sparkline values ordered oldest -> newest. Provide 24h (crypto) or 5d (indices) etc.
  sparkline: number[];
  lastUpdated?: string; // ISO
};

export type MarketOverviewData = {
  top_items: MarketIndexItem[];
  // future expansion: sectors, commodities, forex, etc.
};
