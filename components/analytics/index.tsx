"use client";
import { useState } from "react";
import { AIInsights } from "../ai/AIInsights";
import { News } from "./news";
import { PortfolioNewsSummary } from "./portfolio-news-summary";
import { AnalysisContainer } from "./analysis/analysis-container";

export function Analytics() {
  const [refreshing, setRefreshing] = useState(false);
  const dummySymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background"
      aria-busy={refreshing}
      aria-live="polite"
    >
      <div
        className={`space-y-8 ${
          refreshing ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {/* <AIInsights /> */}
        <AnalysisContainer />
        {/* <PortfolioNewsSummary symbols={dummySymbols || []} /> */}
        <News />
      </div>
    </main>
  );
}
