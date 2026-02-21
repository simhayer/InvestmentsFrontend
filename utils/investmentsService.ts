import { authedFetch } from "@/utils/authService";
import { analytics } from "@/lib/posthog";

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

  analytics.capture("holding_added", { symbol: data?.symbol, type: data?.type });
  return res.json();
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

    return res.json();
  } catch (error) {
    console.error("Error in getHoldings:", error);
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

  return res.json();
};

export const deleteHolding = async (holdingId: string) => {
  const path = `/holdings/${holdingId}`;

  const res = await authedFetch(path, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete holding");
  }

  analytics.capture("holding_deleted", { holdingId });
  return res.json();
};

export async function getInstitutions() {
  const path = `/api/plaid/institutions`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch institutions");
  return await res.json();
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
  return res.json();
}
