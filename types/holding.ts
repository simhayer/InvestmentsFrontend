export type HoldingType = "stock" | "cryptocurrency" | "etf" | "bond";

export interface Holding {
  id: string; // keep as-is if you use DB ids; otherwise use externalId from API
  symbol: string;
  name: string;
  type: HoldingType;

  quantity: number; // units/shares
  currentPrice?: number | null; // per-unit live price (Finnhub); may be missing if quote unavailable

  /**
   * DEPRECATED: was ambiguous (sometimes total cost, sometimes unit).
   * Keep it for legacy reads, but treat it as **unit** price if present.
   */
  purchasePrice?: number;

  /**
   * New explicit cost-basis fields (from backend):
   */
  purchaseAmountTotal?: number | null; // TOTAL dollars spent (Plaid cost_basis)
  purchaseUnitPrice?: number | null; // purchaseAmountTotal / quantity (if both present)

  /**
   * Server-computed totals & P/L (recommended to display directly):
   */
  currentValue?: number | null; // currentPrice * quantity
  unrealizedPl?: number | null; // currentValue - purchaseAmountTotal
  unrealizedPlPct?: number | null; // (currentValue / purchaseAmountTotal - 1) * 100

  // Metadata
  purchaseDate?: string; // ISO
  avgPrice?: number; // If you already used it as unit avg, keep or replace with purchaseUnitPrice
  institution: string;
  currency: string;
  price_status?: "live" | "stale" | "unavailable" | "unrequested";

  // Source tracking
  source?: "plaid" | "manual" | string;

  // Optional ids from Plaid mapping
  externalId?: string;
  accountId?: string;
  accountName?: string;
}
