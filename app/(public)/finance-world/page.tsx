"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Manrope } from "next/font/google";
import { useRouter } from "next/navigation";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronRight,
  Globe2,
  Layers3,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";
import { useMonitorPanel } from "@/hooks/use-monitor-panel";
import { useWatchlists } from "@/hooks/use-watchlists";
import type {
  AIInsightCardProps,
  FocusNewsGroup,
  MarketPulseGroupProps,
  MarketPulseItemProps,
  NewsItemCardProps,
  NewsStreamGroupProps,
  PersonalizedMonitorData,
} from "@/types/monitor-panel";
import type { Watchlist } from "@/types/watchlist";
import { fmtCurrency, timeAgo } from "@/utils/format";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const MARKET_PULSE_ORDER = ["major_indices", "crypto", "risk_signals"] as const;
const NEWS_ORDER = ["general", "merger", "forex", "crypto"] as const;

const MARKET_PULSE_LABELS: Record<string, string> = {
  major_indices: "Major indices",
  crypto: "Crypto",
  risk_signals: "Risk signals",
};

const NEWS_LABELS: Record<string, string> = {
  general: "General",
  merger: "Merger",
  forex: "Forex",
  crypto: "Crypto",
};

const signalStyles: Record<AIInsightCardProps["signal"], { chip: string; surface: string; icon: string }> = {
  bullish: {
    chip: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
    surface: "border-emerald-200/90 bg-emerald-50/70",
    icon: "text-emerald-600",
  },
  bearish: {
    chip: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
    surface: "border-amber-200/90 bg-amber-50/70",
    icon: "text-amber-600",
  },
  neutral: {
    chip: "bg-muted text-muted-foreground ring-1 ring-border",
    surface: "border-border bg-card",
    icon: "text-muted-foreground",
  },
};

const sectionMotion = (reduceMotion: boolean, delay = 0) =>
  reduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

const newsTone = (key: string) => {
  if (key === "crypto") return "from-muted-foreground/5 to-muted/10";
  if (key === "forex") return "from-muted-foreground/5 to-muted/10";
  if (key === "merger") return "from-muted-foreground/5 to-muted/10";
  return "from-muted-foreground/5 to-muted/10";
};

function orderPulseGroups(groups: MarketPulseGroupProps[]) {
  const map = new Map(groups.map((group) => [group.key, group] as const));
  return MARKET_PULSE_ORDER.map((key) => {
    const fallback = map.get(key);
    return fallback
      ? { ...fallback, label: fallback.label || MARKET_PULSE_LABELS[key] }
      : {
          key,
          label: MARKET_PULSE_LABELS[key],
          items: [],
        };
  }).filter((group) => group.items.length > 0);
}

function orderNewsGroups(groups: NewsStreamGroupProps[]) {
  const map = new Map(groups.map((group) => [group.key, group] as const));
  return NEWS_ORDER.map((key) => {
    const fallback = map.get(key);
    return fallback
      ? { ...fallback, label: fallback.label || NEWS_LABELS[key] }
      : {
          key,
          label: NEWS_LABELS[key],
          items: [],
        };
  });
}

function parseSymbols(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,]+/)
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

function formatUpdated(value?: string | null) {
  const relative = timeAgo(value);
  return relative ? `Updated ${relative}` : "Updated just now";
}

function formatSignedPct(value?: number | null) {
  if (value == null) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatSignedCurrency(value?: number | null, currency = "USD") {
  if (value == null) return "--";
  const formatted = fmtCurrency(Math.abs(value), currency);
  return `${value >= 0 ? "+" : "-"}${formatted.replace(/^US /, "US ")}`;
}

function shellCardClassName(className?: string) {
  return cn(
    "overflow-hidden rounded-[28px] border border-border bg-card shadow-[var(--fw-shadow)]",
    className
  );
}

function ShellCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={shellCardClassName(className)}>{children}</div>;
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{children}</div>;
}

function EmptyPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-muted/50 p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function SignalCard({ insight }: { insight: AIInsightCardProps }) {
  const tone = signalStyles[insight.signal];
  return (
    <div className={cn("rounded-[24px] border p-5", tone.surface)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{insight.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.summary}</p>
        </div>
        <Sparkles className={cn("mt-1 h-5 w-5 shrink-0", tone.icon)} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", tone.chip)}>
          {insight.signal}
        </span>
        <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
          {insight.time_horizon}
        </span>
      </div>
    </div>
  );
}

function WorldBriefCard({
  headline,
  cause,
  impact,
}: {
  headline: string;
  cause: string;
  impact: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-muted/50 p-5">
      <p className="text-base font-semibold text-foreground">{headline}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{cause}</p>
      <div className="mt-4 rounded-2xl bg-card px-4 py-3 text-sm font-medium text-foreground ring-1 ring-border">
        {impact}
      </div>
    </div>
  );
}

function PulseSparkline({ points, changePct }: { points?: number[]; changePct: number | null }) {
  if (!points || points.length < 2) return null;
  const stroke = changePct != null && changePct < 0 ? "#b45309" : "#0f766e";

  return (
    <div className="h-9 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points.map((value, index) => ({ index, value }))}>
          <YAxis hide domain={["auto", "auto"]} />
          <Line dataKey="value" type="monotone" stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarketPulseRow({ item }: { item: MarketPulseItemProps }) {
  const positive = (item.changePct ?? 0) >= 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
          {item.symbol ? <span className="truncate text-xs text-muted-foreground">{item.symbol}</span> : null}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{fmtCurrency(item.price, item.currency ?? "USD")}</span>
          <span className={cn("font-semibold", positive ? "text-emerald-700" : "text-amber-700")}>
            {formatSignedPct(item.changePct)}
          </span>
        </div>
      </div>
      <PulseSparkline points={item.sparkline} changePct={item.changePct} />
    </div>
  );
}

function NewsCard({ item }: { item: NewsItemCardProps }) {
  return (
    <a
      href={item.url ?? "#"}
      target={item.url ? "_blank" : undefined}
      rel={item.url ? "noreferrer" : undefined}
      className={cn(
        "group grid gap-4 rounded-[24px] border border-border bg-card p-4 transition-all duration-200",
        item.url ? "hover:-translate-y-0.5 hover:shadow-[var(--fw-shadow)] hover:border-border" : "cursor-default"
      )}
    >
      {item.image ? (
        <div className="overflow-hidden rounded-[18px] bg-muted">
          <img src={item.image} alt="" className="h-36 w-full object-cover" />
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-semibold leading-6 text-foreground">{item.title ?? "Untitled story"}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{item.source ?? "Unknown source"}</span>
          <span className="text-border">/</span>
          <span>{timeAgo(item.published_at) || "just now"}</span>
        </div>
        {item.snippet ? <p className="text-sm leading-6 text-muted-foreground">{item.snippet}</p> : null}
      </div>
      {item.url ? (
        <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
          Open story
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      ) : null}
    </a>
  );
}

function FocusNewsCard({ symbol, items }: FocusNewsGroup) {
  return (
    <div className="rounded-[24px] border border-border bg-muted/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{symbol}</p>
          <p className="mt-1 text-base font-semibold text-foreground">Company news flow</p>
        </div>
        <Badge className="rounded-full bg-card px-3 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border" variant="secondary">
          {items.length} item{items.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyPanel title="No fresh items" body="We are not seeing new stories for this symbol right now." />
        ) : (
          items.slice(0, 3).map((item, index) => <NewsCard key={`${symbol}-${item.url ?? index}`} item={item} />)
        )}
      </div>
    </div>
  );
}

function PositionRow({
  symbol,
  name,
  weight,
  currentValue,
  changePct,
  currentPrice,
  currency,
}: {
  symbol: string;
  name: string;
  weight: number;
  currentValue: number;
  changePct: number;
  currentPrice: number;
  currency: string;
}) {
  const positive = changePct >= 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[22px] border border-border bg-card px-4 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{symbol}</p>
          <span className="truncate text-xs text-muted-foreground">{name}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{weight.toFixed(1)}% weight</span>
          <span className="text-border">/</span>
          <span>{fmtCurrency(currentPrice, currency)}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">{fmtCurrency(currentValue, currency)}</p>
        <p className={cn("mt-2 inline-flex items-center gap-1 text-xs font-semibold", positive ? "text-emerald-700" : "text-amber-700")}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {formatSignedPct(changePct)}
        </p>
      </div>
    </div>
  );
}

function FinanceWorldSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[minmax(0,1.4fr)_400px]">
      <div className="space-y-6">
        <Skeleton className="h-[240px] rounded-[32px]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[180px] rounded-[28px]" />
          <Skeleton className="h-[180px] rounded-[28px]" />
          <Skeleton className="h-[180px] rounded-[28px]" />
        </div>
        <Skeleton className="h-[380px] rounded-[32px]" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-[260px] rounded-[32px]" />
        <Skeleton className="h-[340px] rounded-[32px]" />
      </div>
    </div>
  );
}

export default function FinanceWorldPage() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { toast } = useToast();
  const { hasSession, sessionReady, isLoading: authLoading } = useAuth();

  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSymbols, setCreateSymbols] = useState("");
  const [createDefault, setCreateDefault] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDefault, setDraftDefault] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newSymbolNote, setNewSymbolNote] = useState("");
  const [mutating, setMutating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useMonitorPanel({
    personalized: hasSession,
    watchlistId: selectedWatchlistId,
    enabled: sessionReady,
  });

  const {
    watchlists,
    loading: watchlistsLoading,
    error: watchlistsError,
    refetch: refetchWatchlists,
    createWatchlist,
    updateWatchlist,
    addItem,
    removeItem,
    deleteWatchlist,
  } = useWatchlists(sessionReady && hasSession);

  const personalization: PersonalizedMonitorData = useMemo(
    () =>
      data?.personalization ?? {
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
    [data]
  );

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null,
    [watchlists, selectedWatchlistId]
  );

  const orderedPulse = useMemo(() => orderPulseGroups(data?.sections.market_pulse ?? []), [data?.sections.market_pulse]);
  const orderedNews = useMemo(() => orderNewsGroups(data?.sections.news_streams ?? []), [data?.sections.news_streams]);
  const activeInsightCards = useMemo(
    () => (personalization.insight_cards.length > 0 ? personalization.insight_cards : data?.sections.ai_insights ?? []),
    [data?.sections.ai_insights, personalization.insight_cards]
  );
  const scopeValue = selectedWatchlistId ? String(selectedWatchlistId) : "portfolio";

  useEffect(() => {
    if (selectedWatchlistId != null && !watchlists.some((watchlist) => watchlist.id === selectedWatchlistId)) {
      setSelectedWatchlistId(null);
    }
  }, [selectedWatchlistId, watchlists]);

  useEffect(() => {
    setDraftName(selectedWatchlist?.name ?? "");
    setDraftDefault(Boolean(selectedWatchlist?.is_default));
  }, [selectedWatchlist]);

  const runMutation = async (label: string, task: () => Promise<void>) => {
    setMutating(label);
    try {
      await task();
      await Promise.all([refetchWatchlists(), refetch()]);
    } catch (mutationError) {
      toast({
        title: "Action failed",
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
      });
    } finally {
      setMutating(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), hasSession ? refetchWatchlists() : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateWatchlist = async () => {
    const symbols = parseSymbols(createSymbols);
    if (!createName.trim()) {
      toast({ title: "Name required", description: "Give the watchlist a name before saving." });
      return;
    }

    await runMutation("create-watchlist", async () => {
      const created = await createWatchlist({
        name: createName.trim(),
        is_default: createDefault,
        symbols,
      });

      if (created?.id) {
        setSelectedWatchlistId(created.id as number);
      }

      setCreateName("");
      setCreateSymbols("");
      setCreateDefault(false);
      setComposerOpen(false);
      toast({
        title: "Watchlist created",
        description: `${createName.trim()} is ready for personalized monitoring.`,
      });
    });
  };

  const handleSaveWatchlist = async () => {
    if (!selectedWatchlist) return;
    if (!draftName.trim()) {
      toast({ title: "Name required", description: "Watchlist names cannot be empty." });
      return;
    }

    await runMutation("update-watchlist", async () => {
      await updateWatchlist(selectedWatchlist.id, {
        name: draftName.trim(),
        is_default: draftDefault,
      });
      toast({
        title: "Watchlist updated",
        description: `${draftName.trim()} has been saved.`,
      });
    });
  };

  const handleAddSymbol = async () => {
    if (!selectedWatchlist) return;
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) {
      toast({ title: "Symbol required", description: "Add a ticker before saving." });
      return;
    }

    await runMutation("add-symbol", async () => {
      await addItem(selectedWatchlist.id, {
        symbol,
        note: newSymbolNote.trim() || undefined,
      });
      setNewSymbol("");
      setNewSymbolNote("");
      toast({
        title: "Symbol added",
        description: `${symbol} is now on ${selectedWatchlist.name}.`,
      });
    });
  };

  const handleDeleteWatchlist = async () => {
    if (!selectedWatchlist) return;
    const name = selectedWatchlist.name;
    await runMutation("delete-watchlist", async () => {
      await deleteWatchlist(selectedWatchlist.id);
      setSelectedWatchlistId(null);
      toast({
        title: "Watchlist deleted",
        description: `${name} has been removed.`,
      });
    });
  };

  const shouldShowLoading = (!sessionReady && authLoading) || (loading && !data);

  return (
    <main className={cn(manrope.className, "finance-world-page min-h-screen text-foreground")}>
      <div className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div {...sectionMotion(reduceMotion, 0)} className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--fw-shadow-sm)]">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Finance world</p>
              <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-foreground sm:text-[2rem]">
                A calmer global monitor, tuned for decisions.
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground ring-1 ring-border" variant="secondary">
              {hasSession ? "Personalized" : "Public monitor"}
            </Badge>
            <Button
              variant="outline"
              className="h-11 rounded-full border-border bg-card text-foreground hover:bg-muted"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCcw className={cn("h-4 w-4", refreshing ? "animate-spin" : "")} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {shouldShowLoading ? (
          <FinanceWorldSkeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_400px] lg:items-start">
            <div className="space-y-6">
              <motion.section {...sectionMotion(reduceMotion, 0.05)}>
                <ShellCard>
                  <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_280px] lg:items-end">
                    <div>
                      <SectionEyebrow>Market monitor panel</SectionEyebrow>
                      <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.05em] text-foreground sm:text-[3.35rem]">
                        {data?.title ?? "Global Finance Monitor"}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        {data?.subtitle ??
                          "World brief, AI signals, market pulse, and themed news streams for a cleaner daily read."}
                      </p>
                      {data?.outlook ? (
                        <div className="mt-6 flex max-w-full items-start gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[var(--fw-shadow-sm)]">
                          <Star className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 text-left leading-relaxed">{data.outlook}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] bg-primary p-5 text-primary-foreground">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">Session status</p>
                      <div className="mt-5 grid gap-3">
                        <div className="rounded-[22px] bg-primary-foreground/10 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/60">As of</p>
                          <p className="mt-1 text-base font-semibold">{formatUpdated(data?.as_of)}</p>
                        </div>
                        <div className="rounded-[22px] bg-primary-foreground/10 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/60">Generated</p>
                          <p className="mt-1 text-base font-semibold">{formatUpdated(data?.meta.generated_at)}</p>
                        </div>
                        <div className="rounded-[22px] bg-primary-foreground/10 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/60">Scope</p>
                          <p className="mt-1 text-base font-semibold capitalize">
                            {personalization.scope === "watchlist"
                              ? selectedWatchlist?.name ?? "Watchlist"
                              : personalization.scope === "portfolio"
                                ? "Portfolio"
                                : "Global"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ShellCard>
              </motion.section>

              {error ? (
                <motion.section {...sectionMotion(reduceMotion, 0.08)}>
                  <EmptyPanel title="Monitor unavailable" body={error} />
                </motion.section>
              ) : null}

              {(data?.sections.ai_insights.length ?? 0) > 0 ? (
                <motion.section {...sectionMotion(reduceMotion, 0.1)} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <SectionEyebrow>AI insights</SectionEyebrow>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-foreground">Signal stack</h3>
                    </div>
                    <Badge className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border" variant="secondary">
                      {data?.sections.ai_insights.length} live
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(data?.sections.ai_insights ?? []).slice(0, 3).map((insight, index) => (
                      <motion.div key={`${insight.title}-${index}`} {...sectionMotion(reduceMotion, 0.12 + index * 0.03)}>
                        <SignalCard insight={insight} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <motion.section {...sectionMotion(reduceMotion, 0.16)}>
                <ShellCard>
                  <div className="border-b border-stone-200/80 px-6 py-5 sm:px-8">
                    <SectionEyebrow>World brief</SectionEyebrow>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
                        {data?.sections.world_brief.market ?? "Global markets"}
                      </h3>
                      <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border" variant="secondary">
                        {(data?.sections.world_brief.sections.length ?? 0).toString().padStart(2, "0")} themes
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 p-6 sm:p-8 lg:grid-cols-2">
                    {(data?.sections.world_brief.sections ?? []).map((section, index) => (
                      <motion.div key={`${section.headline}-${index}`} {...sectionMotion(reduceMotion, 0.18 + index * 0.03)}>
                        <WorldBriefCard headline={section.headline} cause={section.cause} impact={section.impact} />
                      </motion.div>
                    ))}
                  </div>
                </ShellCard>
              </motion.section>

              <motion.section {...sectionMotion(reduceMotion, 0.2)}>
                <ShellCard>
                  <div className="border-b border-stone-200/80 px-6 py-5 sm:px-8">
                    <SectionEyebrow>Market pulse</SectionEyebrow>
                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-foreground">Compact market board</h3>
                  </div>
                  <div className="grid gap-4 p-6 sm:p-8 xl:grid-cols-3">
                    {orderedPulse.length === 0 ? (
                      <div className="xl:col-span-3">
                        <EmptyPanel title="No market pulse yet" body="Pulse groups will appear here when the backend returns market rows." />
                      </div>
                    ) : (
                      orderedPulse.map((group) => (
                        <div key={group.key} className="rounded-[26px] bg-muted/50 p-4">
                          <div className="flex items-center justify-between gap-3 px-2 pb-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</p>
                            <span className="text-xs text-muted-foreground">{group.items.length} items</span>
                          </div>
                          <div className="space-y-3">
                            {group.items.map((item) => (
                              <MarketPulseRow key={item.key} item={item} />
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ShellCard>
              </motion.section>

              <motion.section {...sectionMotion(reduceMotion, 0.24)}>
                <ShellCard>
                  <div className="border-b border-stone-200/80 px-6 py-5 sm:px-8">
                    <SectionEyebrow>News streams</SectionEyebrow>
                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-foreground">Themed coverage, without the clutter</h3>
                  </div>

                  <div className="hidden p-6 sm:p-8 md:block">
                    <Tabs defaultValue={orderedNews[0]?.key ?? "general"}>
                      <TabsList className="h-auto rounded-full bg-muted p-1 ring-1 ring-border">
                        {orderedNews.map((group) => (
                          <TabsTrigger
                            key={group.key}
                            value={group.key}
                            className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
                          >
                            {group.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {orderedNews.map((group) => (
                        <TabsContent key={group.key} value={group.key}>
                          <div className={cn("mt-4 rounded-[28px] bg-gradient-to-br p-4", newsTone(group.key))}>
                            {group.items.length === 0 ? (
                              <EmptyPanel title="No fresh items" body="This stream is quiet right now." />
                            ) : (
                              <div className="grid gap-4 lg:grid-cols-2">
                                {group.items.map((item, index) => (
                                  <NewsCard key={`${group.key}-${item.url ?? index}`} item={item} />
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>

                  <div className="p-6 md:hidden">
                    <Accordion type="single" collapsible defaultValue={orderedNews[0]?.key ?? "general"} className="space-y-3">
                      {orderedNews.map((group) => (
                        <AccordionItem key={group.key} value={group.key} className="rounded-[24px] border border-border bg-muted/50 px-4">
                          <AccordionTrigger className="text-left text-base font-semibold text-foreground">{group.label}</AccordionTrigger>
                          <AccordionContent>
                            {group.items.length === 0 ? (
                              <EmptyPanel title="No fresh items" body="This stream is quiet right now." />
                            ) : (
                              <div className="space-y-4 pb-2">
                                {group.items.map((item, index) => (
                                  <NewsCard key={`${group.key}-${item.url ?? index}`} item={item} />
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </ShellCard>
              </motion.section>

              <motion.section {...sectionMotion(reduceMotion, 0.28)}>
                <ShellCard className="bg-primary text-primary-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground/70">Footer meta</p>
                      <p className="mt-2 text-lg font-semibold">Sources in the current build</p>
                    </div>
                    <p className="text-sm text-primary-foreground/80">{formatUpdated(data?.meta.generated_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 px-6 pb-6 sm:px-8 sm:pb-8">
                    {(data?.meta.sources ?? []).map((source) => (
                      <span key={source} className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium ring-1 ring-primary-foreground/10">
                        {source}
                      </span>
                    ))}
                  </div>
                </ShellCard>
              </motion.section>
            </div>

            <motion.aside {...sectionMotion(reduceMotion, 0.1)} className="space-y-6 lg:sticky lg:top-6">
              <ShellCard>
                <div className="border-b border-stone-200/80 px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <SectionEyebrow>Personalization</SectionEyebrow>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-foreground">
                        {hasSession ? "Your market lens" : "Upgrade the experience"}
                      </h3>
                    </div>
                    <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border capitalize" variant="secondary">
                      {personalization.scope.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-5 p-6">
                  {hasSession ? (
                    <>
                      <div className="rounded-[24px] bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-foreground">Experience mode</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Portfolio mode uses your positions. Watchlist mode narrows the briefing to a saved list.
                        </p>
                        <div className="mt-4 grid gap-3">
                          <Select value={scopeValue} onValueChange={(value) => setSelectedWatchlistId(value === "portfolio" ? null : Number(value))}>
                            <SelectTrigger className="h-12 rounded-2xl border-border bg-card">
                              <SelectValue placeholder="Choose monitor mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portfolio">Portfolio overview</SelectItem>
                              {watchlists.map((watchlist) => (
                                <SelectItem key={watchlist.id} value={String(watchlist.id)}>
                                  {watchlist.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            className="h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setComposerOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                            New watchlist
                          </Button>
                        </div>
                      </div>

                      {watchlistsError ? <EmptyPanel title="Watchlists unavailable" body={watchlistsError} /> : null}

                      {personalization.scope === "portfolio" && personalization.portfolio_snapshot ? (
                        <div className="rounded-[24px] bg-primary p-5 text-primary-foreground">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">Portfolio snapshot</p>
                              <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
                                {fmtCurrency(
                                  personalization.portfolio_snapshot.market_value,
                                  personalization.portfolio_snapshot.currency
                                )}
                              </p>
                            </div>
                            <div className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
                              {personalization.portfolio_snapshot.positions_count} positions
                            </div>
                          </div>
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[20px] bg-primary-foreground/10 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/60">Day move</p>
                              <p className="mt-1 text-base font-semibold">
                                {formatSignedCurrency(
                                  personalization.portfolio_snapshot.day_pl,
                                  personalization.portfolio_snapshot.currency
                                )}
                              </p>
                            </div>
                            <div className="rounded-[20px] bg-primary-foreground/10 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/60">Day return</p>
                              <p className="mt-1 text-base font-semibold">
                                {formatSignedPct(personalization.portfolio_snapshot.day_pl_pct)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {personalization.scope === "watchlist" && selectedWatchlist ? (
                        <div className="rounded-[24px] bg-stone-50 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Watchlist mode</p>
                              <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-foreground">{selectedWatchlist.name}</p>
                            </div>
                            {selectedWatchlist.is_default ? (
                              <Badge className="rounded-full bg-card px-3 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border" variant="secondary">
                                Default
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Personalized news and AI cards are now driven by this saved list, not ad hoc symbols.
                          </p>
                        </div>
                      ) : null}

                      {personalization.scope === "global_fallback" && personalization.empty_state ? (
                        <EmptyPanel title="Global fallback" body={personalization.empty_state} />
                      ) : null}

                      {personalization.inline_insights ? (
                        <div className="space-y-3">
                          <SectionEyebrow>Inline insights</SectionEyebrow>
                          <div className="grid gap-3">
                            {[
                              personalization.inline_insights.healthBadge,
                              personalization.inline_insights.performanceNote,
                              personalization.inline_insights.riskFlag,
                              personalization.inline_insights.topPerformer,
                              personalization.inline_insights.actionNeeded,
                            ]
                              .filter((item): item is string => Boolean(item))
                              .map((item) => (
                                <div key={item} className="rounded-[22px] border border-border bg-muted/50 px-4 py-3 text-sm leading-6 text-muted-foreground">
                                  {item}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}

                      {activeInsightCards.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <SectionEyebrow>{personalization.scope === "portfolio" ? "Portfolio insights" : "Curated insights"}</SectionEyebrow>
                            <BrainCircuit className="h-4 w-4 text-stone-400" />
                          </div>
                          <div className="space-y-3">
                            {activeInsightCards.slice(0, 3).map((card, index) => (
                              <SignalCard key={`${card.title}-${index}`} insight={card} />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {personalization.scope === "portfolio" && personalization.top_positions.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <SectionEyebrow>Top positions</SectionEyebrow>
                            <span className="text-xs text-muted-foreground">By current value</span>
                          </div>
                          <div className="space-y-3">
                            {personalization.top_positions.slice(0, 5).map((position) => (
                              <PositionRow
                                key={position.symbol}
                                symbol={position.symbol}
                                name={position.name}
                                weight={position.weight}
                                currentValue={position.current_value}
                                changePct={position.unrealized_pl_pct}
                                currentPrice={position.current_price}
                                currency={position.currency}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedWatchlist ? (
                        <div className="space-y-4 rounded-[24px] border border-border bg-card p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <SectionEyebrow>Watchlist management</SectionEyebrow>
                              <p className="mt-2 text-lg font-semibold text-foreground">Edit the active list</p>
                            </div>
                            <Layers3 className="h-4 w-4 text-stone-400" />
                          </div>

                          <div className="space-y-3">
                            <Input
                              value={draftName}
                              onChange={(event) => setDraftName(event.target.value)}
                              placeholder="Watchlist name"
                              className="h-12 rounded-2xl border-border bg-card"
                            />
                            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">Set as default</p>
                                <p className="text-xs text-muted-foreground">Use this list as the default watchlist mode.</p>
                              </div>
                              <Switch checked={draftDefault} onCheckedChange={setDraftDefault} />
                            </div>
                            <Button
                              type="button"
                              className="h-11 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={handleSaveWatchlist}
                              disabled={mutating === "update-watchlist"}
                            >
                              Save watchlist settings
                            </Button>
                          </div>

                          <div className="space-y-3 rounded-[22px] bg-stone-50 p-4">
                            <p className="text-sm font-semibold text-foreground">Add a symbol</p>
                            <Input
                              value={newSymbol}
                              onChange={(event) => setNewSymbol(event.target.value)}
                              placeholder="Ticker, e.g. NVDA"
                              className="h-11 rounded-2xl border-border bg-card"
                            />
                            <Input
                              value={newSymbolNote}
                              onChange={(event) => setNewSymbolNote(event.target.value)}
                              placeholder="Optional note"
                              className="h-11 rounded-2xl border-border bg-card"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 w-full rounded-2xl border-border bg-card hover:bg-muted"
                              onClick={handleAddSymbol}
                              disabled={mutating === "add-symbol"}
                            >
                              Add symbol
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">Current symbols</p>
                              <span className="text-xs text-muted-foreground">{selectedWatchlist.items.length} tracked</span>
                            </div>
                            {selectedWatchlist.items.length === 0 ? (
                              <EmptyPanel title="No symbols yet" body="Add symbols to turn this watchlist into a personalized monitor." />
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {selectedWatchlist.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground"
                                  >
                                    <span>{item.symbol}</span>
                                    <button
                                      type="button"
                                      className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                      onClick={() =>
                                        runMutation("remove-symbol", async () => {
                                          await removeItem(selectedWatchlist.id, item.symbol);
                                          toast({
                                            title: "Symbol removed",
                                            description: `${item.symbol} has been removed from ${selectedWatchlist.name}.`,
                                          });
                                        })
                                      }
                                      aria-label={`Remove ${item.symbol}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 w-full rounded-2xl text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                            onClick={handleDeleteWatchlist}
                            disabled={mutating === "delete-watchlist"}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete watchlist
                          </Button>
                        </div>
                      ) : hasSession && !watchlistsLoading ? (
                        <EmptyPanel
                          title="No watchlist selected"
                          body={
                            watchlists.length === 0
                              ? "Create a watchlist to unlock watchlist mode."
                              : "Choose a watchlist above to edit symbols and view watchlist-specific news."
                          }
                        />
                      ) : null}

                      <div className="space-y-3">
                        <SectionEyebrow>Focus news</SectionEyebrow>
                        {personalization.focus_news.length === 0 ? (
                          <EmptyPanel
                            title="No focus news yet"
                            body="Personalized company-level coverage will appear here once the backend returns symbol-specific news."
                          />
                        ) : (
                          <div className="space-y-3">
                            {personalization.focus_news.slice(0, 3).map((group) => (
                              <FocusNewsCard key={group.symbol} symbol={group.symbol} items={group.items} />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-[26px] bg-primary p-5 text-primary-foreground">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">Logged-out view</p>
                        <h4 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Public brief on the left. Personal layer on sign-in.</h4>
                        <p className="mt-3 text-sm leading-6 text-primary-foreground/85">
                          Portfolio snapshots, saved watchlists, and symbol-level news are only available in the authenticated monitor.
                        </p>
                      </div>
                      <Button
                        type="button"
                        className="h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => router.push("/login")}
                      >
                        <BriefcaseBusiness className="h-4 w-4" />
                        Sign in for personalization
                      </Button>
                    </div>
                  )}
                </div>
              </ShellCard>

              <ShellCard>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <SectionEyebrow>Product notes</SectionEyebrow>
                      <p className="mt-2 text-lg font-semibold text-foreground">Current frontend contract</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                    <p>Global monitor uses <span className="font-semibold text-foreground">GET /api/market/monitor-panel</span>.</p>
                    <p>Logged-in mode uses <span className="font-semibold text-foreground">GET /api/market/monitor-panel/personalized</span>.</p>
                    <p>Watchlist mode is driven by persisted watchlists, not a `symbols=` query string.</p>
                  </div>
                </div>
              </ShellCard>
            </motion.aside>
          </div>
        )}
      </div>

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="rounded-[28px] border-border bg-background sm:max-w-[560px] shadow-[var(--fw-shadow)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-[-0.03em] text-foreground">Create a watchlist</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              Build a saved list that can power the personalized finance-world monitor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="AI leaders, quality compounders, rate-sensitive..."
              className="h-12 rounded-2xl border-border bg-card"
            />
            <Textarea
              value={createSymbols}
              onChange={(event) => setCreateSymbols(event.target.value)}
              placeholder="Add symbols separated by commas or spaces"
              className="min-h-[120px] rounded-[24px] border-border bg-card"
            />
            <div className="flex items-center justify-between rounded-[24px] bg-muted/50 px-4 py-4 ring-1 ring-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Make this the default watchlist</p>
                <p className="text-xs text-muted-foreground">Used when you want watchlist mode to open on your main list.</p>
              </div>
              <Switch checked={createDefault} onCheckedChange={setCreateDefault} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-border bg-card hover:bg-muted"
              onClick={() => setComposerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCreateWatchlist}
              disabled={mutating === "create-watchlist"}
            >
              Save watchlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
