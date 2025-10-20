import { useState } from "react";
import type {
  MarketIndexKey,
  MarketIndexItem,
  MarketOverviewData,
} from "@/types/market-overview";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/market`;

export async function fetchMarketOverview(): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/overview`);
  if (!res.ok) {
    throw new Error("Failed to fetch market overview");
  }
  return res.json();
}

export function useMarketOverview() {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);

    setError(null);
    try {
      const overview = await fetchMarketOverview();
      setData(overview.data);
      return overview;
    } catch (e: any) {
      setError("Couldn't load market overview.");
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchOverview };
}
