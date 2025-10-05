// hooks/use-ai-insight.ts
"use client";

import { useState, useCallback } from "react";
import { getAiInsight } from "@/utils/aiService";
import type { Investment } from "@/types/holding";
import type { LinkupPayload, HoldingAIAnalysis } from "@/types/ai";
import { isHoldingAnalysis } from "@/types/ai";

export function useAiInsight(investment: Investment) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optional: keep if you still sometimes return linkup news
  const [news, setNews] = useState<LinkupPayload | null>(null);

  // NEW: this is the object your backend returns from Perplexity
  const [holdingAnalysis, setHoldingAnalysis] =
    useState<HoldingAIAnalysis | null>(null);

  const [rawResponse, setRawResponse] = useState<unknown>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNews(null);
    setHoldingAnalysis(null);
    setRawResponse(null);

    try {
      let res: any = await getAiInsight(investment);
      setRawResponse(res);

      // If backend returns a JSON string, parse it
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch {
          /* ignore */
        }
      }

      // Combined response support: { holdingAnalysis, news } or { analysis, news }
      if (res && typeof res === "object") {
        // direct holding analysis
        if (isHoldingAnalysis(res)) {
          setHoldingAnalysis(res);
          return;
        }
        // nested
        if (isHoldingAnalysis(res.holdingAnalysis)) {
          setHoldingAnalysis(res.holdingAnalysis);
        } else if (isHoldingAnalysis(res.analysis)) {
          // some backends may still call it "analysis"
          setHoldingAnalysis(res.analysis);
        }

        if (Array.isArray(res.items)) {
          // plain Linkup payload
          setNews(res as LinkupPayload);
        } else if (res.news && Array.isArray(res.news.items)) {
          setNews(res.news as LinkupPayload);
        }

        if (
          !isHoldingAnalysis(res) &&
          !isHoldingAnalysis(res.holdingAnalysis ?? res.analysis) &&
          !res.items &&
          !res.news
        ) {
          setError("AI returned an unexpected shape.");
        }
      } else {
        setError("No insight available.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch AI insight.");
    } finally {
      setLoading(false);
    }
  }, [investment]);

  return {
    loading,
    error,
    news, // optional; safe to ignore in UI if null
    holdingAnalysis, // <- use this in your AIPanel
    rawResponse,
    fetch,
  };
}
