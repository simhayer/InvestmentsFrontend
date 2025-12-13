"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNewsForUser } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Newspaper, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsItem = {
  title: string;
  url: string;
  snippet?: string | null;
  published_at?: string | null; // ISO UTC
  source?: string | null;
  image?: string | null;
};

type NewsBySymbol = Record<string, NewsItem[]>;

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function domainFrom(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function SymbolChip({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-700 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.45)]">
      {symbol}
    </span>
  );
}

function NewsCard({ item, symbol }: { item: NewsItem; symbol: string }) {
  const when = timeAgo(item.published_at);
  const host = domainFrom(item.url);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] transition hover:shadow-[0_24px_70px_-46px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {item.source ? <span className="truncate">{item.source}</span> : null}
            {host && host !== item.source ? (
              <>
                <span aria-hidden="true">•</span>
                <span className="truncate">{host}</span>
              </>
            ) : null}
            {when ? (
              <>
                <span aria-hidden="true">•</span>
                <time dateTime={item.published_at || undefined}>{when}</time>
              </>
            ) : null}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-start gap-2 text-left"
            title={item.title}
          >
            <h3 className="text-base font-semibold leading-snug text-neutral-900 group-hover/link:underline group-hover/link:decoration-2 group-hover/link:underline-offset-4">
              {item.title}
            </h3>
            <ExternalLink className="mt-0.5 hidden h-4 w-4 text-neutral-400 transition group-hover/link:text-neutral-700 sm:block" />
          </a>
          {item.snippet ? (
            <p className="text-sm leading-relaxed text-neutral-600 line-clamp-3 sm:line-clamp-2">
              {item.snippet}
            </p>
          ) : null}
        </div>

        <div className="flex items-start sm:pl-4">
          <SymbolChip symbol={symbol} />
        </div>
      </div>
    </article>
  );
}

export function News({ className }: { className?: string }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Array<NewsItem & { symbol: string }>>([]);
  const hasLoaded = useRef(false);

  const fetchNews = useCallback(async () => {
    setLoading(!hasLoaded.current);
    setError(null);
    try {
      setRefreshing(true);
      const res = await fetchNewsForUser();
      const data = (res || {}) as NewsBySymbol;

      const flat: Array<NewsItem & { symbol: string }> = [];
      for (const [symbol, list] of Object.entries(data)) {
        for (const it of list || []) {
          flat.push({ symbol, ...it });
        }
      }

      flat.sort((a, b) => {
        const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
        const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
        return tb - ta;
      });

      setItems(flat);
      hasLoaded.current = true;
    } catch (e) {
      console.error("Failed to fetch news:", e);
      setError("Couldn’t load news. Please try again.");
      setItems([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (loading) {
    return (
      <section className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid gap-3 sm:gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("space-y-3", className)}>
        <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-5 text-sm text-red-900 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchNews} className="gap-1">
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const count = items.length;

  return (
    <section
      className={cn("space-y-4 sm:space-y-5", className)}
      aria-busy={refreshing}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              News & Signals
            </p>
            <p className="text-sm font-semibold leading-tight text-neutral-900">
              Latest headlines mapped to your holdings
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            {count} article{count === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 text-neutral-700 hover:bg-neutral-100"
          onClick={fetchNews}
          disabled={refreshing}
        >
          <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh feed
        </Button>
      </div>

      {count > 0 ? (
        <div
          className={cn(
            "space-y-3 sm:space-y-4",
            refreshing && "pointer-events-none opacity-60"
          )}
        >
          {items.map((it, idx) => (
            <NewsCard
              key={`${it.symbol}-${idx}-${it.url}`}
              item={it}
              symbol={it.symbol}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.25)]">
          No news available
        </div>
      )}
    </section>
  );
}
