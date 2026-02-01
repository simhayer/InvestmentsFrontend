// utils/portfolioAiService.ts
import { PortfolioSummary } from "@/types/portfolio-summary";
import { authedFetch } from "@/utils/authService";

export const getPortfolioSummary = async (opts?: {
  currency?: "USD" | "CAD";
  signal?: AbortSignal;
}): Promise<PortfolioSummary> => {
  const query = `/api/portfolio/summary`;

  const res = await authedFetch(query, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio summary (${res.status})`);

    }

  return res.json();
};

export type PortfolioAiReport = {
  user_id?: string;
  currency: "USD" | "CAD";
  as_of: number;
  market_value: number;
  classification_summary?: any;
  facts_pack?: any;
  core_analysis?: any;
};

export function safeParsePortfolioAiReport(raw: unknown): PortfolioAiReport | null {
  try {
    const obj = raw as PortfolioAiReport;
    if (!obj) return null;
    if (!obj.currency || typeof obj.as_of !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}

export function getCoreHoldingsBrief(report: PortfolioAiReport) {
  return (report.facts_pack?.core_holdings_brief ?? []) as Array<{
    symbol: string;
    weight_pct?: number;
    unrealized_pl_pct?: number | null;
    flags?: string[];
  }>;
}

export function getRiskHoldingsBrief(report: PortfolioAiReport) {
  return (report.facts_pack?.risk_holdings_brief ?? []) as Array<{
    symbol: string;
    weight_pct?: number;
    unrealized_pl_pct?: number | null;
    flags?: string[];
  }>;
}

type Currency = "USD" | "CAD";

type StartPortfolioTaskResp =
  | { task_id: string; status: "started" }
  // if your backend returns cached result when force=false
  | { task_id: null; status: "complete"; data: { report: any; cached?: boolean } };

type PortfolioStatusResp =
  | { status: "processing"; data: null }
  | { status: "complete"; data: { report: any; total_seconds: number } }
  | { status: "failed"; data: { error: string; total_seconds?: number } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Starts portfolio AI analysis (background task) and polls for completion.
 * Backend routes assumed:
 *  POST /api/v2/ai/analyze-portfolio?currency=USD&force=false
 *  GET  /api/v2/ai/portfolio-status/{task_id}?debug=1
 */
export async function getAiInsightPortfolio(opts?: {
  currency?: Currency;
  force?: boolean;
  signal?: AbortSignal;
  maxWaitMs?: number;   // default 60s
  intervalMs?: number;  // default 1200ms
}) {
  const currency = opts?.currency ?? "USD";
  const force = opts?.force ?? false;

  const maxWaitMs = opts?.maxWaitMs ?? 60_000;
  const intervalMs = opts?.intervalMs ?? 1200;

  // Start
  const startRes = await authedFetch(
    `/api/v2/ai/analyze-portfolio?currency=${encodeURIComponent(currency)}&force=${force ? "1" : "0"}`,
    { method: "POST", signal: opts?.signal }
  );

  if (!startRes.ok) throw new Error(`Start failed: ${startRes.status}`);

  const startData = (await startRes.json()) as StartPortfolioTaskResp;

  // If backend short-circuits with cached data
  if (startData.status === "complete" && startData.task_id === null) {
    return startData.data.report;
  }

  const taskId = (startData as any).task_id as string;
  if (!taskId) throw new Error("Missing task_id from portfolio start response");

  // Poll
  const t0 = Date.now();
  while (Date.now() - t0 < maxWaitMs) {
    const statusRes = await authedFetch(
      `/api/v2/ai/portfolio-status/${encodeURIComponent(taskId)}?debug=1`,
      { method: "GET", signal: opts?.signal }
    );
    if (!statusRes.ok) throw new Error(`Status failed: ${statusRes.status}`);

    const statusData = (await statusRes.json()) as PortfolioStatusResp;

    if (statusData.status === "complete") {
      return statusData.data.report;
    }
    if (statusData.status === "failed") {
      throw new Error(statusData.data.error || "Portfolio analysis failed");
    }

    await sleep(intervalMs);
  }

  throw new Error("Timed out waiting for portfolio analysis");
}


export type PortfolioHealthGrade = "A" | "B" | "C" | "D" | "F";
export type HealthBaseline = "balanced" | "growth" | "conservative";

export type PortfolioHealthSubscores = {
  diversification: number; // 0..60
  risk_balance: number; // 0..40
  sector_region: number; // 0..25
  quality: number; // 0..15
};

export type PortfolioHealthScore = {
  status: "ok";
  user_id: string;
  currency: Currency;
  as_of: number;

  score: number; // 0..100
  grade: PortfolioHealthGrade;
  baseline: HealthBaseline;

  subscores: PortfolioHealthSubscores;

  sector_weights_pct: Record<string, number>;
  region_weights_pct: Record<string, number>;

  insights: string[];
  suggestions: string[];
  notes: string[];
};

export function safeParsePortfolioHealthScore(raw: unknown): PortfolioHealthScore | null {
  try {
    const obj = raw as PortfolioHealthScore;
    if (!obj || obj.status !== "ok") return null;
    if (!obj.currency || typeof obj.as_of !== "number") return null;
    if (typeof obj.score !== "number" || !obj.grade) return null;
    if (!obj.subscores) return null;
    return obj;
  } catch {
    return null;
  }
}

export type PortfolioHealthExplainRequest = {
  health_score: PortfolioHealthScore | Record<string, unknown>;
};

export type PortfolioHealthExplainResponse = {
  summary: string;
  key_drivers: string[];
  what_helped: string[];
  what_hurt: string[];
  next_steps: string[];
};

export function safeParsePortfolioHealthExplain(raw: unknown): PortfolioHealthExplainResponse | null {
  try {
    const obj = raw as PortfolioHealthExplainResponse;
    if (!obj || typeof obj.summary !== "string") return null;
    if (!Array.isArray(obj.key_drivers)) return null;
    if (!Array.isArray(obj.what_helped)) return null;
    if (!Array.isArray(obj.what_hurt)) return null;
    if (!Array.isArray(obj.next_steps)) return null;
    return obj;
  } catch {
    return null;
  }
}

/**
 * Fetches the Portfolio Health Score (grading) endpoint.
 * Backend route assumed:
 *  GET /api/portfolio/health-score?currency=USD&baseline=balanced&fundamentals_top_n=10
 */
export async function getPortfolioHealthScore(opts?: {
  currency?: Currency;
  baseline?: HealthBaseline;
  fundamentalsTopN?: number; // default 10
  signal?: AbortSignal;
}) {
  const currency = opts?.currency ?? "USD";
  const baseline = opts?.baseline ?? "balanced";
  const fundamentalsTopN = Math.max(0, Math.min(50, opts?.fundamentalsTopN ?? 10));

  const res = await authedFetch(
    `/api/portfolio/health-score?currency=${encodeURIComponent(currency)}&baseline=${encodeURIComponent(
      baseline
    )}&fundamentals_top_n=${encodeURIComponent(String(fundamentalsTopN))}`,
    { method: "GET", signal: opts?.signal }
  );

  if (!res.ok) throw new Error(`Health score failed: ${res.status}`);

  const data = (await res.json()) as unknown;
  const parsed = safeParsePortfolioHealthScore(data);
  if (!parsed) {
    // still return raw for debugging if you want; throwing is safer
    throw new Error("Invalid health score response shape");
  }
  return parsed;
}

/**
 * Explains a previously computed Portfolio Health Score.
 * Backend route assumed:
 *  POST /api/portfolio/health-explain
 */
export async function getPortfolioHealthExplain(opts: {
  healthScore: PortfolioHealthScore | Record<string, unknown>;
  signal?: AbortSignal;
}) {
  const res = await authedFetch("/api/portfolio/health-explain", {
    method: "POST",
    signal: opts.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ health_score: opts.healthScore }),
  });

  if (!res.ok) throw new Error(`Health explain failed: ${res.status}`);

  const data = (await res.json()) as unknown;
  const parsed = safeParsePortfolioHealthExplain(data);
  if (!parsed) {
    throw new Error("Invalid health explain response shape");
  }
  return parsed;
}
