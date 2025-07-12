import type { Investment } from "@/types/investment";

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BACKEND_URL = `${API_URL}/api/finnhub`;

// Send list of symbols to backend and get latest prices
export async function fetchLivePricesForList(invList: Investment[], token: string): Promise<Investment[]> {
  if (!invList.length) return invList;

  const symbols = invList.map((inv) => inv.symbol);

  const res = await fetch(`${BACKEND_URL}/prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(symbols),
  });

  const data = await res.json();

  return invList.map((inv) => ({
    ...inv,
    currentPrice: data?.[inv.symbol]?.currentPrice ?? inv.currentPrice,
  }));
}

export async function searchSymbols(query: string, token: string) {
  if (!query) return [];
  const res = await fetch(`${BACKEND_URL}/search?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
}

export async function fetchQuote(symbol: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/quote?symbol=${symbol}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function fetchProfile(symbol: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/profile?symbol=${symbol}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export function mapFinnhubType(apiType: string): "stock" | "crypto" | "etf" | "bond" {
  const lower = apiType.toLowerCase();

  if (lower.includes("crypto")) return "crypto";
  if (lower.includes("etf")) return "etf";
  if (lower.includes("bond")) return "bond";

  return "stock";
}
