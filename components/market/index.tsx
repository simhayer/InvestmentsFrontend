// components/investment/investment-overview.tsx
"use client";

import { useEffect } from "react";
import MarketOverviewGrid from "./market-overview-grid";
import { useMarketOverview } from "@/hooks/use-market-overview";

export default function MarketOverview() {
  const { data, loading, error, fetchOverview } = useMarketOverview();
  const items = data?.top_items || [];

  useEffect(() => {
    fetchOverview();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <MarketOverviewGrid compact={true} items={items} />
    </div>
  );
}
