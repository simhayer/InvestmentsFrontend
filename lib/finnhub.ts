import type { Investment } from "@/types/holding";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = `${API_URL}/api/finnhub`;

// Send list of symbols to backend and get latest prices
export async function fetchLivePricesForList(
  invList: Investment[]
): Promise<Investment[]> {
  if (!invList.length) return invList;

  const symbols = invList.map((inv) => inv.symbol);
  const types = invList.map((inv) => inv.type); // Extract type for each investment

  const filteredSymbols = symbols.filter((s) => s); // Remove any empty symbols
  const filteredTypes = types.filter((_, idx) => symbols[idx]); // Keep types in sync

  console.log("Fetching live prices for symbols:", filteredSymbols);

  const res = await fetch(`${BACKEND_URL}/prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      symbols: filteredSymbols,
      types: filteredTypes,
      currency: "USD",
    }),
  });

  if (!res.ok) {
    console.error("Failed to fetch live prices", await res.text());
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
  const res = await fetch(
    `${BACKEND_URL}/search?query=${encodeURIComponent(query)}`,
    {
      credentials: "include",
    }
  );
  const data = await res.json();
  return data;
}

export async function fetchQuote(symbol: string) {
  const res = await fetch(`${BACKEND_URL}/quote?symbol=${symbol}`, {
    credentials: "include",
  });
  return res.json();
}

export async function fetchProfile(symbol: string) {
  const res = await fetch(`${BACKEND_URL}/profile?symbol=${symbol}`, {
    credentials: "include",
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
