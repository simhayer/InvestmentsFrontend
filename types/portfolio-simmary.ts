export type AllocationItem = {
  key: string;
  value: number;
  weight: number;
};

export type TopPosition = {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  type: "equity" | "etf" | "cryptocurrency" | string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  value: number;
  currency: string;
  institution: string | null;
  account_name: string | null;
  source: string | null;
  external_id: string | null;
  previous_close: number | null;
  price_status: "live" | "unavailable" | "mixed" | string;
  day_pl: number | null;
  unrealized_pl: number | null;
  weight: number;
};

export type ConnectionSummary = {
  id: string;
  institutionName: string;
  institutionId: string;
  createdAt: string; // ISO string
  syncedAt: string | null;
};

export type PortfolioSummary = {
  asOf: number;
  requestedCurrency: string;
  priceStatus: "live" | "mixed" | "unavailable" | string;
  positionsCount: number;
  marketValue: number;
  costBasis: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
  dayPl: number;
  dayPlPct: number;
  allocations: {
    byType: AllocationItem[];
    byAccount: AllocationItem[];
  };
  topPositions: TopPosition[];
  connections: ConnectionSummary[];
};
