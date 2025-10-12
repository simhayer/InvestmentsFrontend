// --- Additions for portfolio summary ---

import { Connection } from "@/types/connection";
import { Holding } from "@/types/holding";

export type AllocationItem = {
  key: string;
  value: number;
  weight: number | null; // percentage (0-100) or null when not computable
};

export type PortfolioSummary = {
  asOf: number; // unix seconds
  currency: "USD" | "CAD";
  positionsCount: number;
  marketValue: number; // total
  costBasis: number; // total
  unrealizedPl: number | null; // abs
  unrealizedPlPct: number | null;
  dayPl: number | null; // abs
  dayPlPct: number | null;
  allocations: {
    byType: AllocationItem[];
    byAccount: AllocationItem[];
  };
  topPositions: Holding[];
  connections: Connection[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getPortfolioSummary = async (opts?: {
  currency?: "USD" | "CAD";
  signal?: AbortSignal;
}): Promise<PortfolioSummary> => {
  const currency = opts?.currency ?? "USD";
  const url = new URL(`${API_URL}/api/portfolio/summary`);
  url.searchParams.set("currency", currency);

  const res = await fetch(url.toString(), {
    credentials: "include",
    signal: opts?.signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio summary (${res.status})`);
  }

  return res.json();
};
