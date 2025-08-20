export type InvestmentType = "stock" | "cryptocurrency" | "etf" | "bond";

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string; // ISO format
  avgPrice: number;
  institution: string; // Name of the institution
  currency: string; // Currency code (e.g., USD, EUR)
}