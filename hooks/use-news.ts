import { authedFetch } from "@/utils/authService";
import { logger } from "@/lib/logger";

export async function fetchNewsForSymbol(symbol: string): Promise<any> {
  const path = `/api/news/latest-for-symbol?symbol=${encodeURIComponent(
    symbol
  )}`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (res.status === 401 || res.status === 403) {
    logger.warn("News-by-symbol request unauthorized; returning empty list.", { symbol });
    return [];
  }
  if (!res.ok) {
    throw new Error(
      `Failed to fetch news for symbol ${symbol} (${res.status})`
    );
  }
  return res.json();
}
