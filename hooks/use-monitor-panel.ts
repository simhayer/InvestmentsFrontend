"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AIInsightCardProps,
  FocusNewsGroup,
  InlineInsights,
  MonitorPanelData,
  MonitorPanelResponse,
  PersonalizedMonitorData,
  PortfolioSnapshot,
  WatchlistSummary,
} from "@/types/monitor-panel";
import { ApiError, API_URL, authedFetch } from "@/utils/authService";

type UseMonitorPanelOptions = {
  personalized?: boolean;
  watchlistId?: number | null;
  enabled?: boolean;
};

const normalizeAiInsight = (item: any): AIInsightCardProps => ({
  title: typeof item?.title === "string" ? item.title : "Insight",
  summary: typeof item?.summary === "string" ? item.summary : "",
  signal:
    item?.signal === "bullish" || item?.signal === "bearish" || item?.signal === "neutral"
      ? item.signal
      : "neutral",
  time_horizon: typeof item?.time_horizon === "string" ? item.time_horizon : "Current session",
});

const normalizeNewsItem = (item: any) => ({
  title: typeof item?.title === "string" ? item.title : null,
  url: typeof item?.url === "string" ? item.url : null,
  source: typeof item?.source === "string" ? item.source : null,
  published_at: typeof item?.published_at === "string" ? item.published_at : null,
  snippet: typeof item?.snippet === "string" ? item.snippet : null,
  image: typeof item?.image === "string" ? item.image : null,
});

const normalizeWatchlist = (value: any): WatchlistSummary | null => {
  if (!value || typeof value !== "object") return null;
  if (typeof value.id !== "number" || typeof value.name !== "string") return null;
  return {
    id: value.id,
    name: value.name,
    is_default: Boolean(value.is_default),
  };
};

const normalizeInlineInsights = (value: any): InlineInsights | null => {
  if (!value || typeof value !== "object") return null;
  return {
    healthBadge: typeof value.healthBadge === "string" ? value.healthBadge : null,
    performanceNote: typeof value.performanceNote === "string" ? value.performanceNote : null,
    riskFlag: typeof value.riskFlag === "string" ? value.riskFlag : null,
    topPerformer: typeof value.topPerformer === "string" ? value.topPerformer : null,
    actionNeeded: typeof value.actionNeeded === "string" ? value.actionNeeded : null,
  };
};

const normalizePortfolioSnapshot = (value: any): PortfolioSnapshot | null => {
  if (!value || typeof value !== "object") return null;
  if (typeof value.market_value !== "number" || typeof value.currency !== "string") return null;
  return {
    positions_count: typeof value.positions_count === "number" ? value.positions_count : 0,
    market_value: value.market_value,
    day_pl: typeof value.day_pl === "number" ? value.day_pl : 0,
    day_pl_pct: typeof value.day_pl_pct === "number" ? value.day_pl_pct : 0,
    currency: value.currency,
  };
};

const normalizeFocusNews = (value: any): FocusNewsGroup[] =>
  Array.isArray(value)
    ? value.map((group) => ({
        symbol: typeof group?.symbol === "string" ? group.symbol : "Symbol",
        items: Array.isArray(group?.items) ? group.items.map(normalizeNewsItem) : [],
      }))
    : [];

const normalizePersonalization = (value: any): PersonalizedMonitorData => {
  const scope =
    value?.scope === "portfolio" || value?.scope === "watchlist" || value?.scope === "global_fallback"
      ? value.scope
      : "global_fallback";

  return {
    scope,
    currency: typeof value?.currency === "string" ? value.currency : "USD",
    symbols: Array.isArray(value?.symbols) ? value.symbols.filter((item: unknown): item is string => typeof item === "string") : [],
    watchlist: normalizeWatchlist(value?.watchlist),
    top_positions: Array.isArray(value?.top_positions)
      ? value.top_positions
          .filter((item: any) => item && typeof item.symbol === "string")
          .map((item: any) => ({
            symbol: item.symbol,
            name: typeof item.name === "string" ? item.name : item.symbol,
            weight: typeof item.weight === "number" ? item.weight : 0,
            current_value: typeof item.current_value === "number" ? item.current_value : 0,
            unrealized_pl_pct:
              typeof item.unrealized_pl_pct === "number" ? item.unrealized_pl_pct : 0,
            current_price: typeof item.current_price === "number" ? item.current_price : 0,
            currency: typeof item.currency === "string" ? item.currency : "USD",
          }))
      : [],
    portfolio_snapshot: normalizePortfolioSnapshot(value?.portfolio_snapshot),
    inline_insights: normalizeInlineInsights(value?.inline_insights),
    insight_cards: Array.isArray(value?.insight_cards) ? value.insight_cards.map(normalizeAiInsight) : [],
    focus_news: normalizeFocusNews(value?.focus_news),
    empty_state: typeof value?.empty_state === "string" ? value.empty_state : null,
  };
};

const normalizeMonitorPanel = (payload: any, scope: "global" | "personalized"): MonitorPanelResponse | null => {
  const data = payload?.data;
  if (!data || typeof data !== "object") return null;

  const normalized: MonitorPanelData = {
    as_of: typeof data.as_of === "string" ? data.as_of : new Date().toISOString(),
    title: typeof data.title === "string" ? data.title : "Global Finance Monitor",
    subtitle:
      typeof data.subtitle === "string"
        ? data.subtitle
        : "World brief, AI signals, market pulse, and themed news streams.",
    outlook: typeof data.outlook === "string" ? data.outlook : null,
    sections: {
      world_brief: {
        market:
          typeof data.sections?.world_brief?.market === "string"
            ? data.sections.world_brief.market
            : "Global Markets",
        sections: Array.isArray(data.sections?.world_brief?.sections)
          ? data.sections.world_brief.sections.map((section: any) => ({
              headline: typeof section?.headline === "string" ? section.headline : "World Brief",
              cause: typeof section?.cause === "string" ? section.cause : "",
              impact: typeof section?.impact === "string" ? section.impact : "",
            }))
          : [],
      },
      ai_insights: Array.isArray(data.sections?.ai_insights)
        ? data.sections.ai_insights.map(normalizeAiInsight)
        : [],
      market_pulse: Array.isArray(data.sections?.market_pulse)
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
                  sparkline: Array.isArray(item?.sparkline) ? item.sparkline.filter((n: unknown): n is number => typeof n === "number") : [],
                  lastUpdated: typeof item?.lastUpdated === "string" ? item.lastUpdated : undefined,
                  error: typeof item?.error === "string" ? item.error : undefined,
                }))
              : [],
          }))
        : [],
      news_streams: Array.isArray(data.sections?.news_streams)
        ? data.sections.news_streams.map((group: any) => ({
            key: typeof group?.key === "string" ? group.key : "general",
            label: typeof group?.label === "string" ? group.label : "News Stream",
            items: Array.isArray(group?.items) ? group.items.map(normalizeNewsItem) : [],
          }))
        : [],
    },
    meta: {
      sources: Array.isArray(data.meta?.sources)
        ? data.meta.sources.filter((source: unknown): source is string => typeof source === "string")
        : [],
      generated_at:
        typeof data.meta?.generated_at === "string" ? data.meta.generated_at : new Date().toISOString(),
      news_categories: Array.isArray(data.meta?.news_categories)
        ? data.meta.news_categories.filter((item: unknown): item is string => typeof item === "string")
        : [],
    },
    personalization:
      scope === "personalized"
        ? normalizePersonalization(data.personalization)
        : {
            scope: "global_fallback",
            currency: "USD",
            symbols: [],
            watchlist: null,
            top_positions: [],
            portfolio_snapshot: null,
            inline_insights: null,
            insight_cards: [],
            focus_news: [],
            empty_state: null,
          },
  };

  return {
    message: typeof payload?.message === "string" ? payload.message : undefined,
    data: normalized,
  };
};

export function useMonitorPanel({
  personalized = false,
  watchlistId = null,
  enabled = true,
}: UseMonitorPanelOptions) {
  const [data, setData] = useState<MonitorPanelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPanel = useCallback(async () => {
    if (!enabled) return null;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const path = personalized
        ? `/api/market/monitor-panel/personalized${watchlistId ? `?watchlist_id=${watchlistId}` : ""}`
        : "/api/market/monitor-panel";

      const res = personalized
        ? await authedFetch(path, {
            method: "GET",
            signal: controller.signal,
          })
        : await fetch(`${API_URL}${path}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });

      if (!res.ok) throw new Error("Failed to load monitor panel");
      const json = await res.json();
      const normalized = normalizeMonitorPanel(json, personalized ? "personalized" : "global");
      if (!normalized) {
        throw new Error("Invalid monitor panel response");
      }

      setData(normalized.data);
      return normalized.data;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        if (err instanceof ApiError && personalized && (err.status === 401 || err.status === 403)) {
          setError("Couldn't load your personalized monitor.");
        } else {
          setError("Couldn't load monitor panel.");
        }
        setData(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, personalized, watchlistId]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    fetchPanel();

    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, fetchPanel]);

  return {
    data,
    loading,
    error,
    refetch: fetchPanel,
  };
}
