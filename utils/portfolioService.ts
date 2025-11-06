// --- Additions for portfolio summary ---

import { Connection } from "@/types/connection";
import { Holding } from "@/types/holding";
import { PortfolioSummary } from "@/types/portfolio-simmary";

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
