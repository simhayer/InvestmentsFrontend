// utils/aiService.ts

import type {
  PortfolioAnalysisResponse,
  PerSymbolMetrics,
  CatalystItem,
  LatestDevelopmentItem,
} from "@/types/portfolio-ai";
import { authedFetch } from "@/utils/authService";

export async function getAiInsightSymbol(symbol: string): Promise<string> {
  console.log("Fetching AI insight for symbol:", symbol);
  const path = "/api/v2/analyze-symbol/analyze/" + encodeURIComponent(symbol);
  try {
    const res = await authedFetch(path, {
      method: "POST",
      body: JSON.stringify({ symbol }),
    });
    const data = await res.json();
    console.log("AI insight response data:", data);
    return data || "No insight returned.";
  } catch (error) {
    console.error("AI insight fetch error:", error);
    return "Something went wrong while fetching AI insight.";
  }
}
export function safeParseAnalysis(
  raw: unknown
): PortfolioAnalysisResponse | null {
  try {
    const obj = raw as PortfolioAnalysisResponse;
    if (!obj || obj.status !== "ok" || !obj.ai_layers) return null;
    return obj;
  } catch {
    return null;
  }
}

export function listPositions(
  ai: PortfolioAnalysisResponse["ai_layers"]
): PerSymbolMetrics[] {
  return Object.values(ai.metrics.per_symbol || {}).sort(
    (a, b) => (b.weight_pct ?? 0) - (a.weight_pct ?? 0)
  );
}

export function topNPositions(
  ai: PortfolioAnalysisResponse["ai_layers"],
  n = 5
) {
  return listPositions(ai).slice(0, n);
}

export function catalystsSorted(cats: CatalystItem[]): CatalystItem[] {
  return [...cats].sort(
    (a, b) =>
      new Date(a.date.split(" ")[0]).getTime() -
      new Date(b.date.split(" ")[0]).getTime()
  );
}

export function latestSorted(
  items: LatestDevelopmentItem[]
): LatestDevelopmentItem[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
