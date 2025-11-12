// utils/aiService.ts
import { Holding } from "@/types/holding";

import type {
  PortfolioAnalysisResponse,
  PerSymbolMetrics,
  CatalystItem,
  LatestDevelopmentItem,
} from "@/types/portfolio-ai";

export async function getAiInsight(holding: Holding): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-holding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: holding.symbol,
          name: holding.name,
          quantity: holding.quantity,
          purchase_price: holding.avgPrice,
          current_price: holding.currentPrice,
          type: holding.type,
          institution: holding.institution || "Unknown",
          currency: holding.currency || "USD",
        }),
        credentials: "include",
      }
    );

    const data = await res.json();
    return data.insight || "No insight returned.";
  } catch (error) {
    console.error("AI insight fetch error:", error);
    return "Something went wrong while fetching AI insight.";
  }
}

export async function getAiInsightSymbol(symbol: string): Promise<string> {
  console.log("Fetching AI insight for symbol:", symbol);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-symbol`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
        credentials: "include",
      }
    );
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
  return Object.values(ai.metrics.per_symbol).sort(
    (a, b) => b.weight_pct - a.weight_pct
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
