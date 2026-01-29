// utils/portfolioAiService.ts
import { authedFetch } from "@/utils/authService";


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
  // const force = opts?.force ?? false;
  const force = true

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
