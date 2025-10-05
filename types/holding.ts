export type HoldingType = "stock" | "cryptocurrency" | "etf" | "bond";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: HoldingType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string; // ISO format
  avgPrice: number;
  institution: string; // Name of the institution
  currency: string; // Currency code (e.g., USD, EUR)
  price_status?: "live" | "stale" | "unavailable" | "unrequested";
}
