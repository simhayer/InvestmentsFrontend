import { authedFetch } from "@/utils/authService";
import { analytics } from "@/lib/posthog";
import { logger } from "@/lib/logger";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const addHolding = async (data: any) => {
  const path = `/holdings`;

  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to add holding");
  }

  const out = await res.json();
  logger.info("holding_added", { symbol: data?.symbol, type: data?.type });
  analytics.capture("holding_added", { symbol: data?.symbol, type: data?.type });
  return out;
};

export const getHoldings = async () => {
  try {
    const query = `/holdings?includePrices=true`;

    const res = await authedFetch(query, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch holdings");
    }

    const data = await res.json();
    logger.info("holdings_loaded", { count: data?.items?.length ?? 0 });
    return data;
  } catch (error) {
    logger.error("Error in getHoldings", { error: String(error) });
    throw error;
  }
};

export const updateHolding = async (holdingId: string, data: Record<string, unknown>) => {
  const path = `/holdings/${holdingId}`;

  const res = await authedFetch(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update holding" }));
    throw new Error(err.detail || "Failed to update holding");
  }

  const out = await res.json();
  logger.info("holding_updated", { holdingId });
  return out;
};

export const deleteHolding = async (holdingId: string) => {
  const path = `/holdings/${holdingId}`;

  const res = await authedFetch(path, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete holding");
  }

  logger.info("holding_deleted", { holdingId });
  analytics.capture("holding_deleted", { holdingId });
  return res.json();
};

export async function getInstitutions() {
  const path = `/api/plaid/institutions`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch institutions");
  const data = await res.json();
  logger.info("institutions_loaded", { count: Array.isArray(data) ? data.length : 0 });
  return data;
}

export type PortfolioHistoryPoint = { t: number; value: number };
export type PortfolioHistoryResponse = {
  points: PortfolioHistoryPoint[];
  currency: string;
};

export async function getPortfolioHistory(
  days: number = 7
): Promise<PortfolioHistoryResponse> {
  const res = await authedFetch(`/holdings/portfolio-history?days=${days}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch portfolio history");
  const data = await res.json();
  logger.info("portfolio_history_loaded", { days, points: data?.points?.length ?? 0 });
  return data;
}
