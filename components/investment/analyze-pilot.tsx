import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { authedFetch } from "@/utils/authService";

type AnalysisReport = {
  symbol: string;
  key_insights: string[];
  current_performance: string;
  stock_overflow_risks: string[];
  price_outlook: string;
  recommendation: string;
  confidence: number;
  is_priced_in: boolean;
};

type StatusResponse =
  | { status: "processing"; data: null }
  | {
      status: "complete";
      data: { report: AnalysisReport; total_seconds?: number };
    }
  | { status: "failed"; data: { error: string; total_seconds?: number } };

const Badge = ({ recommendation }: { recommendation: string }) => {
  const rec = (recommendation || "").toLowerCase();
  const cls =
    rec === "buy"
      ? "bg-green-600"
      : rec === "sell"
      ? "bg-red-600"
      : "bg-amber-600";
  return (
    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${cls}`}>
      {recommendation || "Hold"}
    </span>
  );
};

const StockAnalysis = ({ symbol }: { symbol: string }) => {
  const [task, setTask] = useState<string | null>(null);
  const [payload, setPayload] = useState<{
    report: AnalysisReport;
    total_seconds?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const report = payload?.report ?? null;

  const analyze = async () => {
    setIsStarting(true);
    setError(null);
    setPayload(null);
    try {
      const res = await authedFetch(
        `/api/v2/analyze-symbol/analyze/${encodeURIComponent(symbol)}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Failed to start analysis (${res.status})`);
      const data = await res.json();
      setTask(data.task_id);
    } catch (e: any) {
      setError(e?.message || "Failed to start analysis");
      setTask(null);
    } finally {
      setIsStarting(false);
    }
  };

  // Poll for status
  useEffect(() => {
    if (!task || payload || error) return;

    let stopped = false;
    const poll = async () => {
      try {
        const res = await authedFetch(`/api/v2/analyze-symbol/status/${task}`);
        if (!res.ok) throw new Error(`Status check failed (${res.status})`);
        const data: StatusResponse = await res.json();

        if (stopped) return;

        if (data.status === "complete") {
          setPayload(data.data);
          return;
        }
        if (data.status === "failed") {
          setError(data.data?.error || "Analysis failed");
          return;
        }
      } catch (e: any) {
        if (!stopped) setError(e?.message || "Polling failed");
      }
    };

    poll(); // immediate first poll
    const interval = setInterval(poll, 3000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [task, payload, error]);

  const confidencePct = useMemo(() => {
    if (!report) return null;
    const c = Number(report.confidence);
    if (!Number.isFinite(c)) return null;
    return Math.max(0, Math.min(100, Math.round(c * 100)));
  }, [report]);

  // UI states
  if (!task) {
    return (
      <button
        onClick={analyze}
        disabled={isStarting}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isStarting ? "Starting..." : `Analyze ${symbol}`}
      </button>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/30 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Analysis failed</p>
            <p className="text-sm text-red-200 mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setTask(null);
              setError(null);
              setPayload(null);
            }}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  if (!payload || !report) {
    return (
      <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="opacity-80" size={18} />
          <p className="animate-pulse">Agents researching {symbol}...</p>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          This can take ~30–90 seconds depending on search + reasoning.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{report.symbol} Analysis</h2>
          {typeof payload.total_seconds === "number" && (
            <p className="text-xs text-slate-400 mt-1">
              Completed in {payload.total_seconds.toFixed(1)}s
            </p>
          )}
        </div>
        <Badge recommendation={report.recommendation} />
      </div>

      {/* Stock Overview-ish (Current Performance) */}
      <div className="p-4 bg-slate-800 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <TrendingUp size={18} />{" "}
          <h3 className="font-semibold">Current Performance</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {report.current_performance}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="px-2 py-1 rounded-md bg-white/5">
            Confidence: {confidencePct ?? "—"}%
          </span>
          <span className="px-2 py-1 rounded-md bg-white/5">
            Priced In: {report.is_priced_in ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Key Insights + Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Sparkles size={18} />{" "}
            <h3 className="font-semibold">Key Insights</h3>
          </div>
          <ul className="text-sm space-y-2 text-slate-200">
            {(report.key_insights ?? []).map((x, i) => (
              <li key={i} className="leading-relaxed">
                • {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle size={18} />{" "}
            <h3 className="font-semibold">Stock Overflow Risks</h3>
          </div>
          <ul className="text-sm space-y-2 text-slate-200">
            {(report.stock_overflow_risks ?? []).map((r, i) => (
              <li key={i} className="leading-relaxed">
                • {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Price Outlook */}
      <div className="mt-4 p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-2 text-indigo-300 mb-2">
          <ShieldCheck size={18} />{" "}
          <h3 className="font-semibold">Price Outlook</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {report.price_outlook}
        </p>
      </div>

      {/* Critic note */}
      <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-500/40 rounded-lg flex gap-3">
        <ShieldCheck className="text-indigo-300 shrink-0" />
        <p className="text-xs italic text-slate-200">
          Reviewed by a skeptic agent for missing risks and weak reasoning.
          (Pilot)
        </p>
      </div>

      {/* Reset / rerun */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => {
            setTask(null);
            setPayload(null);
            setError(null);
          }}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
        >
          New analysis
        </button>

        <button
          onClick={analyze}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
        >
          Re-run
        </button>
      </div>
    </div>
  );
};

export default function AnalyzePilot({ symbol }: { symbol: string }) {
  return (
    <section className="mb-8">
      <StockAnalysis symbol={symbol} />
    </section>
  );
}
