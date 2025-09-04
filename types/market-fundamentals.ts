export type FinancialsResponse = {
  status: "ok" | "error";
  symbol: string;
  period: "annual" | "quarterly";
  income_statement: Array<{
    date: string;
    revenue?: number | null;
    gross_profit?: number | null;
    operating_income?: number | null;
    net_income?: number | null;
    eps?: number | null;
  }>;
  balance_sheet: Array<{
    date: string;
    total_assets?: number | null;
    total_liabilities?: number | null;
    total_equity?: number | null;
    cash?: number | null;
    inventory?: number | null;
    long_term_debt?: number | null;
  }>;
  cash_flow: Array<{
    date: string;
    operating_cash_flow?: number | null;
    investing_cash_flow?: number | null;
    financing_cash_flow?: number | null;
    free_cash_flow?: number | null;
  }>;
};

export type EarningsResponse = {
  status: "ok" | "error";
  symbol: string;
  next_earnings_date?: string | null;
  history: Array<{
    date: string; // report date
    period?: string; // e.g., Q2 2025
    actual?: number | null;
    estimate?: number | null;
    surprisePct?: number | null;
  }>;
};

export type AnalystResponse = {
  status: "ok" | "error";
  symbol: string;
  recommendation_key?: string | null;
  recommendation?: number | null; // 1..5 lower is better
  price_target_low?: number | null;
  price_target_mean?: number | null;
  price_target_high?: number | null;
  trend?: Array<{
    period: string; // e.g., 2025-08
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  }>;
};

export type ProfileResponse = {
  status: "ok" | "error";
  symbol: string;
  sector?: string | null;
  industry?: string | null;
  full_time_employees?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  long_business_summary?: string | null;
};
