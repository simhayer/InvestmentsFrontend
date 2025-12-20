// --- Additions for portfolio summary ---
import { PortfolioSummary } from "@/types/portfolio-summary";
import { authedFetch } from "@/utils/authService";

export const getPortfolioSummary = async (opts?: {
  currency?: "USD" | "CAD";
  signal?: AbortSignal;
}): Promise<PortfolioSummary> => {
  const currency = opts?.currency ?? "USD";

  const query = `/api/portfolio/summary?currency=${encodeURIComponent(
    currency
  )}`;

  const res = await authedFetch(query, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio summary (${res.status})`);
  }

  return res.json();
};
