import type { Holding } from "@/types/holding";
import { authedFetch } from "@/utils/authService";
import { logger } from "@/lib/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = `${API_URL}/api/finnhub`;

// Send list of symbols to backend and get latest prices
export async function fetchLivePricesForList(
  invList: Holding[]
): Promise<Holding[]> {
  if (!invList.length) return invList;

  const symbols = invList.map((inv) => inv.symbol);
  const types = invList.map((inv) => inv.type); // Extract type for each investment

  const filteredSymbols = symbols.filter((s) => s); // Remove any empty symbols
  const filteredTypes = types.filter((_, idx) => symbols[idx]); // Keep types in sync

  const path = `/prices`;
  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify({
      symbols: filteredSymbols,
      types: filteredTypes,
      currency: "USD",
    }),
  });

  if (!res.ok) {
    logger.error("Failed to fetch live prices", { body: await res.text() });
    return invList;
  }

  const data = await res.json();

  return invList.map((inv) => ({
    ...inv,
    currentPrice: data?.[inv.symbol]?.currentPrice ?? inv.currentPrice,
  }));
}

export async function searchSymbols(query: string) {
  if (!query) return [];
  // limit to 5 results
  const path = `/api/finnhub/search?query=${encodeURIComponent(query)}&limit=5`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  const data = await res.json();
  return data;
}

export async function fetchQuote(symbol: string) {
  const path = `/quote?symbol=${encodeURIComponent(symbol)}`;
  const res = await authedFetch(path, {
    method: "GET",
  });
  return res.json();
}

export async function fetchProfile(symbol: string) {
  const path = `/profile?symbol=${encodeURIComponent(symbol)}`;
  const res = await authedFetch(path, {
    method: "GET",
  });
  return res.json();
}

export function mapFinnhubType(
  apiType: string
): "stock" | "cryptocurrency" | "etf" | "bond" {
  const lower = apiType.toLowerCase();

  if (lower.includes("crypto")) return "cryptocurrency";
  if (lower.includes("etf")) return "etf";
  if (lower.includes("bond")) return "bond";

  return "stock";
}
