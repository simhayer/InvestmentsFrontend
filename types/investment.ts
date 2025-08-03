export type InvestmentType = "stock" | "crypto" | "etf" | "bond";

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string; // ISO format
  avgPrice: number
}