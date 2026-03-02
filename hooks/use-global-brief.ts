"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MonitorPanelResponse } from "@/types/monitor-panel";
import { API_URL } from "@/utils/authService";

type MonitorPanelMeta = {
  updated_at?: string;
  generated_at?: string;
};

type LegacyMarketSection = {
  headline?: string;
  cause?: string;
  impact?: string;
  sources?: string[];
};

type LegacyMarketSummaryData = {
  as_of?: string;
  market?: string;
  sections?: LegacyMarketSection[];
  outlook?: string | null;
};

const normalizeMonitorPanel = (json: any): MonitorPanelResponse | null => {
  const data = json?.data;
  if (!data || typeof data !== "object") return null;

  const metaFromData = data.meta && typeof data.meta === "object" ? data.meta : {};
  const metaFromEnvelope = json?.meta && typeof json.meta === "object" ? json.meta : {};

  if (data.sections && typeof data.sections === "object" && data.sections.world_brief) {
    return {
      as_of: typeof data.as_of === "string" ? data.as_of : new Date().toISOString(),
      title: typeof data.title === "string" ? data.title : "Finance World",
      subtitle:
        typeof data.subtitle === "string"
          ? data.subtitle
          : typeof data.sections.world_brief?.market === "string"
            ? data.sections.world_brief.market
            : "Global monitor panel",
      outlook: typeof data.outlook === "string" ? data.outlook : null,
      sections: {
        world_brief: {
          market:
            typeof data.sections.world_brief?.market === "string"
              ? data.sections.world_brief.market
              : "Global Markets",
          sections: Array.isArray(data.sections.world_brief?.sections)
            ? data.sections.world_brief.sections.map((section: any) => ({
                headline: typeof section?.headline === "string" ? section.headline : "World Brief",
                cause: typeof section?.cause === "string" ? section.cause : "",
                impact: typeof section?.impact === "string" ? section.impact : "",
              }))
            : [],
        },
        ai_insights: Array.isArray(data.sections.ai_insights)
          ? data.sections.ai_insights.map((item: any) => ({
              title: typeof item?.title === "string" ? item.title : "AI Insight",
              summary: typeof item?.summary === "string" ? item.summary : "",
              signal:
                item?.signal === "bullish" || item?.signal === "bearish" || item?.signal === "neutral"
                  ? item.signal
                  : "neutral",
              time_horizon:
                typeof item?.time_horizon === "string" ? item.time_horizon : "Current session",
            }))
          : [],
        market_pulse: Array.isArray(data.sections.market_pulse)
          ? data.sections.market_pulse.map((group: any) => ({
              key: typeof group?.key === "string" ? group.key : "market_pulse",
              label: typeof group?.label === "string" ? group.label : "Market Pulse",
              items: Array.isArray(group?.items)
                ? group.items.map((item: any, index: number) => ({
                    key:
                      typeof item?.key === "string"
                        ? item.key
                        : typeof item?.symbol === "string"
                          ? item.symbol
                          : `market-pulse-${index}`,
                    label: typeof item?.label === "string" ? item.label : "Instrument",
                    symbol: typeof item?.symbol === "string" ? item.symbol : undefined,
                    price: typeof item?.price === "number" ? item.price : null,
                    changeAbs: typeof item?.changeAbs === "number" ? item.changeAbs : null,
                    changePct: typeof item?.changePct === "number" ? item.changePct : null,
                    currency: typeof item?.currency === "string" ? item.currency : null,
                    sparkline: Array.isArray(item?.sparkline) ? item.sparkline : [],
                    lastUpdated: typeof item?.lastUpdated === "string" ? item.lastUpdated : undefined,
                    error: typeof item?.error === "string" ? item.error : undefined,
                  }))
                : [],
            }))
          : [],
        news_streams: Array.isArray(data.sections.news_streams)
          ? data.sections.news_streams.map((group: any) => ({
              key: typeof group?.key === "string" ? group.key : "general",
              label: typeof group?.label === "string" ? group.label : "News Stream",
              items: Array.isArray(group?.items)
                ? group.items.map((item: any) => ({
                    title: typeof item?.title === "string" ? item.title : null,
                    url: typeof item?.url === "string" ? item.url : null,
                    source: typeof item?.source === "string" ? item.source : null,
                    published_at:
                      typeof item?.published_at === "string" ? item.published_at : null,
                    snippet: typeof item?.snippet === "string" ? item.snippet : null,
                    image: typeof item?.image === "string" ? item.image : null,
                  }))
                : [],
            }))
          : [],
      },
      meta: {
        sources: Array.isArray(metaFromData.sources)
          ? metaFromData.sources.filter((source: unknown): source is string => typeof source === "string")
          : Array.isArray(metaFromEnvelope.sources)
            ? metaFromEnvelope.sources.filter((source: unknown): source is string => typeof source === "string")
            : [],
        generated_at:
          typeof metaFromData.generated_at === "string"
            ? metaFromData.generated_at
            : typeof metaFromEnvelope.generated_at === "string"
              ? metaFromEnvelope.generated_at
              : typeof data.as_of === "string"
                ? data.as_of
                : new Date().toISOString(),
        news_categories: Array.isArray(metaFromData.news_categories)
          ? metaFromData.news_categories.filter((item: unknown): item is string => typeof item === "string")
          : [],
      },
    };
  }

  const legacyData = data as LegacyMarketSummaryData;
  if (!Array.isArray(legacyData.sections)) return null;

  const legacySources = legacyData.sections.flatMap((section) =>
    Array.isArray(section.sources)
      ? section.sources.filter((source): source is string => typeof source === "string")
      : []
  );

  return {
    as_of: typeof legacyData.as_of === "string" ? legacyData.as_of : new Date().toISOString(),
    title: "Finance World",
    subtitle:
      typeof legacyData.market === "string" ? legacyData.market : "Global monitor panel",
    outlook: typeof legacyData.outlook === "string" ? legacyData.outlook : null,
    sections: {
      world_brief: {
        market:
          typeof legacyData.market === "string" ? legacyData.market : "Global Markets",
        sections: legacyData.sections.map((section) => ({
          headline: typeof section.headline === "string" ? section.headline : "World Brief",
          cause: typeof section.cause === "string" ? section.cause : "",
          impact: typeof section.impact === "string" ? section.impact : "",
        })),
      },
      ai_insights: [],
      market_pulse: [],
      news_streams: [],
    },
    meta: {
      sources: Array.from(new Set(legacySources)),
      generated_at:
        typeof metaFromEnvelope.generated_at === "string"
          ? metaFromEnvelope.generated_at
          : typeof legacyData.as_of === "string"
            ? legacyData.as_of
            : new Date().toISOString(),
      news_categories: [],
    },
  };
};

export function useGlobalBrief() {
  const [data, setData] = useState<MonitorPanelResponse | null>(null);
  const [meta, setMeta] = useState<MonitorPanelMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBrief = useCallback(async (forceRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const url = forceRefresh
        ? `${API_URL}/api/market/global-brief?refresh=true`
        : `${API_URL}/api/market/global-brief`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to load brief");
      const json = await res.json();
      const normalized = normalizeMonitorPanel(json);
      if (normalized) {
        setData(normalized);
        setMeta({
          updated_at:
            typeof json?.meta?.updated_at === "string"
              ? json.meta.updated_at
              : normalized.as_of,
          generated_at: normalized.meta.generated_at,
        });
      } else {
        setData(null);
        setMeta(null);
        throw new Error("Invalid brief response");
      }
      return json;
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setData(null);
        setMeta(null);
        setError("Couldn't load AI brief.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrief();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchBrief]);

  const refetch = useCallback(() => fetchBrief(true), [fetchBrief]);
  return { data, meta, loading, error, refetch, fetchBrief };
}
