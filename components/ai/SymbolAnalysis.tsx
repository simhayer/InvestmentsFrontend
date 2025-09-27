// components/ai/AIPanel.tsx
"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Info,
} from "lucide-react";

// ---- Types
type Citation = { title: string; url: string };
type Rationale = { text: string; source_idx: number };
type RangeVal = { low: number; high: number };
type Highlight = {
  label: string;
  value: string | number | RangeVal;
  as_of?: string | null;
  source_idx: number;
};
type Risk = { title: string; detail: string; source_idx: number };

type Insight = {
  schema_version: string;
  symbol: string;
  headline: string;
  recommendation: "buy" | "hold" | "sell" | "neutral" | string;
  conviction: number;
  rationale: Rationale[];
  highlights: Highlight[];
  risks: Risk[];
  citations: Citation[];
  [k: string]: unknown;
};

// ---- Helpers
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    Object.getPrototypeOf(v) === Object.prototype
  );
}

function parseJsonLoose(input: string): any {
  // tolerant parse for string inputs (handles extra text wrapping the JSON)
  const s = input.indexOf("{");
  const e = input.lastIndexOf("}");
  if (s >= 0 && e > s) {
    try {
      return JSON.parse(input.slice(s, e + 1));
    } catch {}
  }
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function coerceInsight(input: unknown): Insight | null {
  if (!input) return null;
  if (typeof input === "string") {
    const parsed = parseJsonLoose(input);
    return parsed && isPlainObject(parsed) ? (parsed as Insight) : null;
  }
  if (isPlainObject(input)) {
    return input as Insight;
  }
  return null;
}

function recColor(rec: string) {
  const r = (rec || "").toLowerCase();
  if (r === "buy") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (r === "sell") return "bg-rose-100 text-rose-700 border-rose-200";
  if (r === "hold" || r === "neutral")
    return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    n
  );
}

function formatValue(v: Highlight["value"]) {
  if (v == null) return "—";
  if (typeof v === "number") return formatNumber(v);
  if (typeof v === "string") return v; // keep strings like "3.54T" / "-4%" / "trillion USD"
  return `${formatNumber(v.low)} – ${formatNumber(v.high)}`; // range
}

function SourcePill({
  idx,
  citations,
}: {
  idx: number | undefined;
  citations: Citation[];
}) {
  if (idx == null || idx <= 0 || idx > citations.length) return null;
  const c = citations[idx - 1];
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
      title={c.title}
    >
      <ExternalLink className="h-3 w-3" />
      <span>[{idx}]</span>
    </a>
  );
}

// ---- Component
export function SymbolAnalysis({
  symbol,
  name,
  holdingAnalysis,
}: {
  symbol: string;
  name?: string | null;
  // Accept both string or object now:
  holdingAnalysis: unknown;
}) {
  const data: Insight | null = useMemo(
    () => coerceInsight(holdingAnalysis),
    [holdingAnalysis]
  );

  if (!holdingAnalysis) return null;

  // Fallback if JSON parsing/shape fails
  if (!data) {
    return (
      <div className="mt-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-900">
              AI Analysis
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">
            {typeof holdingAnalysis === "string"
              ? holdingAnalysis
              : JSON.stringify(holdingAnalysis, null, 2)}
          </pre>
        </Card>
      </div>
    );
  }

  const {
    headline,
    recommendation,
    conviction,
    rationale = [],
    highlights = [],
    risks = [],
    citations = [],
  } = data;
  const convPct = Math.max(0, Math.min(1, Number(conviction || 0))) * 100;

  return (
    <div className="mt-4">
      <Card className="p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <div className="text-sm font-medium text-slate-900">
              AI Analysis {name ? `• ${name}` : ""} ({symbol.toUpperCase()})
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`border ${recColor(recommendation || "")}`}
              variant="outline"
            >
              {String(recommendation || "—").toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 min-w-[180px]">
              <div className="text-xs text-slate-500">Conviction</div>
              <div className="w-36 h-2 rounded bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${convPct}%` }}
                  aria-label={`Conviction ${convPct.toFixed(0)}%`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        {headline ? (
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 text-slate-500" />
            <p className="text-sm text-slate-800">{headline}</p>
          </div>
        ) : null}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Highlights
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highlights.map((h, i) => (
                <div
                  key={`${h.label}-${i}`}
                  className="rounded-xl border border-slate-200 p-3 bg-white"
                >
                  <div className="text-xs text-slate-500">{h.label}</div>
                  <div className="text-sm font-medium text-slate-900">
                    {formatValue(h.value)}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      {h.as_of ? `as of ${h.as_of}` : ""}
                    </div>
                    <SourcePill idx={h.source_idx} citations={citations} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rationale */}
        {rationale.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Why this view
            </div>
            <ul className="space-y-2">
              {rationale.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-slate-500" />
                  <div className="text-sm text-slate-800">
                    {r.text}{" "}
                    <SourcePill idx={r.source_idx} citations={citations} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {risks.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Key risks
            </div>
            <ul className="space-y-2">
              {risks.map((rk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                  <div className="text-sm">
                    <span className="font-medium text-slate-900">
                      {rk.title}:
                    </span>{" "}
                    <span className="text-slate-800">{rk.detail}</span>{" "}
                    <SourcePill idx={rk.source_idx} citations={citations} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sources
            </div>
            <ul className="text-sm space-y-1">
              {citations.map((c, i) => (
                <li key={i}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 underline underline-offset-4"
                  >
                    <span className="text-xs text-slate-500">[{i + 1}]</span>
                    <span>{c.title}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
