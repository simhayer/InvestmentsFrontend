// utils/aiService.ts

import type {
  StockAnalysisResponse,
  InlineInsights,
  QuickSummaryResponse,
} from "@/types/symbol_analysis";
import { authedFetch } from "@/utils/authService";

// ============================================================================
// SYMBOL ANALYSIS (NEW)
// ============================================================================

/**
 * Get full AI analysis for a symbol.
 * Includes report + inline insights.
 */
export async function getFullAnalysis(
  symbol: string,
  includeInline: boolean = true
): Promise<StockAnalysisResponse> {
  const url = `/api/analyze/symbol/full/${symbol}?include_inline=${includeInline}`;
  
  const res = await authedFetch(url, { method: "GET" });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Analysis failed: ${error}`);
  }
  
  return res.json();
}

/**
 * Get only inline insights (faster, cheaper).
 * Use for badges/callouts on the page.
 */
export async function getInlineInsights(
  symbol: string
): Promise<InlineInsights> {
  const res = await authedFetch(`/api/analyze/symbol/inline/${symbol}`, {
    method: "GET",
  });
  
  if (!res.ok) {
    throw new Error(`Inline insights failed: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Get quick summary only (fastest option).
 */
export async function getQuickSummary(
  symbol: string
): Promise<QuickSummaryResponse> {
  const res = await authedFetch(`/api/analyze/summary/${symbol}`, {
    method: "GET",
  });
  
  if (!res.ok) {
    throw new Error(`Summary failed: ${res.status}`);
  }
  
  return res.json();
}

// ============================================================================
// LEGACY POLLING API (if you still need it)
// ============================================================================

type TaskResp = { task_id: string; status: string };
type StatusResp =
  | { status: "processing"; data: null }
  | { status: "complete"; data: { report: any; total_seconds: number } }
  | { status: "failed"; data: { error: string; total_seconds?: number } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Legacy polling-based analysis (if backend still uses task queue).
 * Consider migrating to getFullAnalysis() for simpler flow.
 */
export async function getAiInsightSymbolPolling(symbol: string) {
  const startRes = await authedFetch(`/api/analyze/${symbol}`, {
    method: "POST",
  });

  if (!startRes.ok) throw new Error(`Start failed: ${startRes.status}`);
  const startData = (await startRes.json()) as TaskResp;

  const taskId = startData.task_id;
  const maxWaitMs = 60_000;
  const intervalMs = 1200;
  const t0 = Date.now();

  while (Date.now() - t0 < maxWaitMs) {
    const statusRes = await authedFetch(`/api/v2/ai/status/${taskId}?debug=1`, {
      method: "GET",
    });
    if (!statusRes.ok) throw new Error(`Status failed: ${statusRes.status}`);

    const statusData = (await statusRes.json()) as StatusResp;

    if (statusData.status === "complete") {
      return statusData.data.report;
    }
    if (statusData.status === "failed") {
      throw new Error(statusData.data.error || "Analysis failed");
    }

    await sleep(intervalMs);
  }

  throw new Error("Timed out waiting for analysis");
}

// ============================================================================
// PORTFOLIO ANALYSIS (existing)
// ============================================================================

import type {
  PortfolioAnalysisResponse,
  PerSymbolMetrics,
  CatalystItem,
  LatestDevelopmentItem,
} from "@/types/portfolio-ai";

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