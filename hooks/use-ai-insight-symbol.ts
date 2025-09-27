// hooks/use-ai-insight.ts
"use client";

import { useState, useCallback } from "react";
import { getAiInsightSymbol } from "@/utils/aiService";
import investment from "@/components/investment";

export function useAiInsightSymbol(symbol: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRawResponse(null);

    try {
      let res: any = await getAiInsightSymbol(symbol);
      setRawResponse(res);
      setAnalysis(res);
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
    analysis,
    rawResponse,
    fetch,
  };
}
