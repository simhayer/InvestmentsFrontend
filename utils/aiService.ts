// utils/aiService.ts

import type {
  PortfolioAnalysisResponse,
  PerSymbolMetrics,
  CatalystItem,
  LatestDevelopmentItem,
} from "@/types/portfolio-ai";
import { authedFetch } from "@/utils/authService";

// export async function getAiInsightSymbol(symbol: string): Promise<string> {
//   console.log("Fetching AI insight for symbol:", symbol);
//   // const path = "/api/ai/analyze-symbol";
//   const path = `/api/v2/ai/analyze/${symbol}`;
//   try {
//     const res = await authedFetch(path, {
//       method: "POST",
//       body: JSON.stringify({ symbol }),
//     });
//     const data = await res.json();
//     console.log("AI insight response data:", data);
//     return data || "No insight returned.";
//   } catch (error) {
//     console.error("AI insight fetch error:", error);
//     return "Something went wrong while fetching AI insight.";
//   }
// }

type TaskResp = { task_id: string; status: string };
type StatusResp =
  | { status: "processing"; data: null }
  | { status: "complete"; data: { report: any; total_seconds: number } }
  | { status: "failed"; data: { error: string; total_seconds?: number } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAiInsightSymbol(symbol: string) {
  const startRes = await authedFetch(`/api/v2/ai/analyze/${symbol}`, {
    method: "POST",
  });

  if (!startRes.ok) throw new Error(`Start failed: ${startRes.status}`);
  const startData = (await startRes.json()) as TaskResp;

  const taskId = startData.task_id;
  const maxWaitMs = 60_000; // 60s
  const intervalMs = 1200;
  const t0 = Date.now();

  while (Date.now() - t0 < maxWaitMs) {
    const statusRes = await authedFetch(`/api/v2/ai/status/${taskId}?debug=1`, {
      method: "GET",
    });
    if (!statusRes.ok) throw new Error(`Status failed: ${statusRes.status}`);

    const statusData = (await statusRes.json()) as StatusResp;

    if (statusData.status === "complete") {
      return statusData.data.report; // <-- your AnalysisReport JSON
    }
    if (statusData.status === "failed") {
      throw new Error(statusData.data.error || "Analysis failed");
    }

    await sleep(intervalMs);
  }

  throw new Error("Timed out waiting for analysis");
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
