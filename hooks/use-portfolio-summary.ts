import { authedFetch } from "@/utils/authService";
import { useCallback, useState } from "react";

export type PortfolioSummary = {
  summary: string;
  highlights: string[];
  risks: string[];
  per_symbol: Record<string, string>;
  sentiment: number; // -1..1
  sources: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/ai`;

export function usePortfolioSummary() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (symbols: string[], daysBack = 7) => {
    setLoading(true);
    setError(null);
    const path = `/news-summary?days_back=${daysBack}`;
    try {
      const res = await authedFetch(path, {
        method: "POST",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const js = await res.json();
      setData(js);
      return js as PortfolioSummary;
    } catch (e: any) {
      setError("Couldn’t load portfolio summary.");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, data, error, fetchSummary };
}
