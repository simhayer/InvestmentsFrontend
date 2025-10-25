// components/investment/investment-overview.tsx
"use client";

import { useEffect } from "react";
import MarketOverviewGrid from "./market-overview-grid";
import { useMarketOverview } from "@/hooks/use-market-overview";
import { MarketSummary, MarketSummaryPanel } from "./market-summary";

export default function MarketOverview() {
  const {
    data,
    overviewLoading,
    overviewError,
    fetchOverview,
    fetchMarketSummary,
  } = useMarketOverview();
  const items = data?.top_items || [];

  useEffect(() => {
    fetchOverview();
    fetchMarketSummary();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <MarketOverviewGrid
        compact={true}
        items={items}
        isLoading={overviewLoading}
        error={overviewError}
      />
      {/* AI Summary */}
      <MarketSummaryPanel />
    </div>
  );
}
