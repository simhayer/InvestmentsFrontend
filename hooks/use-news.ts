import { authedFetch } from "@/utils/authService";

export async function fetchNewsForUser(): Promise<any> {
  const path = `/api/news/latest-for-user`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (res.status === 401 || res.status === 403) {
    console.warn("News request unauthorized; returning empty feed.");
    return {};
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch news (${res.status})`);
  }

  return res.json();
}

export async function fetchNewsForSymbol(symbol: string): Promise<any> {
  const path = `/api/news/latest-for-symbol?symbol=${encodeURIComponent(
    symbol
  )}`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (res.status === 401 || res.status === 403) {
    console.warn("News-by-symbol request unauthorized; returning empty list.");
    return [];
  }
  if (!res.ok) {
    throw new Error(
      `Failed to fetch news for symbol ${symbol} (${res.status})`
    );
  }
  return res.json();
}
