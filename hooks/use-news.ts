const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/news`;

export async function fetchNewsForUser(): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/latest-for-user`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
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
  const res = await fetch(
    `${BACKEND_URL}/latest-for-symbol?symbol=${encodeURIComponent(symbol)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
    }
  );
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
