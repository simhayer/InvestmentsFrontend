// app/hooks/use-portfolio-ai.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/ai/analyze-portfolio`;

/** ---------- Types matching your AI response ---------- */

export type ImpactLevel = "low" | "medium" | "high";
export type AlertStatus = "ok" | "triggered" | "snoozed";

export interface LatestDevelopment {
  headline: string;
  date: string; // ISO or YYYY-MM-DD
  source?: string;
  url?: string;
  cause?: string;
  impact?: string;
  assets_affected?: string[];
}

export interface Catalyst {
  date?: string;
  type?: string; // earnings, macro, product, vote
  description?: string;
  expected_direction?: "up" | "down" | "unclear";
  magnitude_basis?: string;
  confidence?: number; // 0..1
  assets_affected?: string[];
}

export interface Scenarios {
  bull?: string;
  base?: string;
  bear?: string;
  probabilities?: {
    bull?: number;
    base?: number;
    bear?: number;
  };
}

export interface ActionItem {
  title: string;
  rationale?: string;
  impact?: ImpactLevel;
  urgency?: ImpactLevel;
  effort?: ImpactLevel;
  targets?: string[];
  category?: "rebalance" | "alert" | "tax" | "hedge" | "research" | string;
}

export interface RiskItem {
  risk: string;
  why_it_matters?: string;
  monitor?: string;
  assets_affected?: string[];
}

export interface Explainability {
  assumptions?: string[];
  confidence_overall?: number; // 0..1
  limitations?: string[];
}

export interface SectionConfidence {
  scenarios?: number;
  news?: number;
  actions?: number;
}

export interface PortfolioAiData {
  latest_developments?: LatestDevelopment[];
  catalysts?: Catalyst[];
  scenarios?: Scenarios;
  actions?: ActionItem[];
  alerts?: { condition: string; status?: AlertStatus }[];
  risks_list?: RiskItem[];
  explainability?: Explainability;
  section_confidence?: SectionConfidence;
  summary?: string;
  disclaimer?: string;
}

export interface PortfolioAiResponseOk {
  status: "ok";
  user_id: number;
  ai_layers: { data: PortfolioAiData };
}

export type PortfolioAiResponse =
  | PortfolioAiResponseOk
  | { status: "error"; error?: string; detail?: string; [k: string]: any };

/** ---------- Narrow guards (defensive but light) ---------- */

function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
}
function arr<T = any>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

/** ---------- Hook ---------- */

export function usePortfolioAi(daysOfNews = 7) {
  const [data, setData] = useState<PortfolioAiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAi = useCallback(
    async (isRefetch = false) => {
      try {
        setError(null);
        isRefetch ? setRefetching(true) : setLoading(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
          // if you choose to accept daysOfNews server-side via body:
          // body: JSON.stringify({ days_of_news: daysOfNews }),
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const maybeErr = await res.json();
            if (isRecord(maybeErr)) {
              msg =
                (maybeErr.detail as string) ||
                (maybeErr.error as string) ||
                msg;
            }
          } catch {
            /* no-op */
          }
          throw new Error(msg);
        }

        const json: unknown = await res.json();

        // Expecting { status:"ok", user_id, ai_layers:{ data: {...} } }
        if (
          isRecord(json) &&
          json.status === "ok" &&
          isRecord(json.ai_layers) &&
          isRecord(json.ai_layers.data)
        ) {
          const d = json.ai_layers.data as PortfolioAiData;

          // defensive normalization (keeps UI stable)
          const normalized: PortfolioAiData = {
            latest_developments: arr<LatestDevelopment>(d.latest_developments),
            catalysts: arr<Catalyst>(d.catalysts),
            scenarios: isRecord(d.scenarios) ? (d.scenarios as Scenarios) : {},
            actions: arr<ActionItem>(d.actions),
            alerts: arr(d.alerts),
            risks_list: arr<RiskItem>(d.risks_list),
            explainability: isRecord(d.explainability)
              ? (d.explainability as Explainability)
              : {},
            section_confidence: isRecord(d.section_confidence)
              ? (d.section_confidence as SectionConfidence)
              : {},
            summary: typeof d.summary === "string" ? d.summary : "",
            disclaimer: typeof d.disclaimer === "string" ? d.disclaimer : "",
          };

          setData(normalized);
        } else {
          // surface backend error if present
          const msg =
            (isRecord(json) && (json.detail as string)) ||
            (isRecord(json) && (json.error as string)) ||
            "Unexpected response shape";
          setError(msg);
          setData(null);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load");
          setData(null);
        }
      } finally {
        isRefetch ? setRefetching(false) : setLoading(false);
      }
    },
    [daysOfNews]
  );

  useEffect(() => {
    fetchAi();
    return () => abortRef.current?.abort();
  }, [fetchAi]);

  return {
    data, // PortfolioAiData | null
    loading, // boolean (initial load)
    refetching, // boolean (subsequent refresh)
    error, // string | null
    refetch: () => fetchAi(true),
  };
}
