"use client";

import * as React from "react";
import {
  RefreshCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { TabKey, TAB_LIST } from "@/components/analytics/analysis/tab-config";
import { TabRenderer } from "@/components/analytics/analysis/tab-renderer";

export function RefetchingSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Top "Stat Grid" Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4"
          >
            <Skeleton className="h-3 w-16 mb-2 opacity-60" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* 2. Main Narrative Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[85%]" />
        </div>
      </div>

      {/* 3. List/Items Skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-neutral-100 p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32 opacity-60" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InitialLoadingState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-[32px] border border-dashed border-neutral-200 bg-neutral-50/50">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-neutral-900/10" />
        <RefreshCcw className="h-6 w-6 animate-spin text-neutral-900" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold text-neutral-900">
          Assembling Intelligence
        </h3>
        <p className="text-xs text-neutral-500">
          Parsing portfolio layers and market sentiment...
        </p>
      </div>
    </div>
  );
}

// Error State with Recovery
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[32px] border border-rose-100 bg-rose-50/50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-lg font-bold text-rose-900">Analysis Failed</h3>
      <p className="mb-6 text-sm text-rose-700/80">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export function AnalysisContainer() {
  const { analysis, meta, loading, error, refetching, refetch } =
    usePortfolioAi();
  const [active, setActive] = React.useState<TabKey>("summary");
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  // Logic for scroll shadows and buttons
  const [canScroll, setCanScroll] = React.useState({
    left: false,
    right: false,
  });

  const checkScroll = () => {
    const el = scrollerRef.current;
    if (el) {
      setCanScroll({
        left: el.scrollLeft > 10,
        right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
      });
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [analysis]);

  if (!analysis && loading) return <InitialLoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!analysis) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-20">
      {/* 1. Ultra-Compact Hero Header */}
      <header className="relative flex flex-col gap-6 rounded-[32px] border border-neutral-200/60 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between lg:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
              AI
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
              Portfolio Intelligence
            </h1>
          </div>
          <p className="text-sm font-medium text-neutral-500">
            Real-time analysis across {TAB_LIST.length} data layers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Status
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              {meta?.cached ? `Refresh in ${meta.nextUpdateIn}` : "Live Data"}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-100 hidden md:block" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch(false)}
            disabled={refetching || !meta?.canRefreshNow}
            className="rounded-full shadow-sm"
          >
            <RefreshCcw
              className={cn("mr-2 h-3.5 w-3.5", refetching && "animate-spin")}
            />
            Update
          </Button>
        </div>
      </header>

      {/* 2. Interactive Navigation Bar */}
      <nav className="sticky top-4 z-40 rounded-full border border-neutral-200/80 bg-white/80 p-1.5 backdrop-blur-md shadow-lg shadow-neutral-200/30">
        <div className="relative flex items-center">
          <div
            ref={scrollerRef}
            onScroll={checkScroll}
            className="no-scrollbar flex gap-1 overflow-x-auto px-1"
          >
            {TAB_LIST.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "relative h-9 whitespace-nowrap rounded-full px-5 text-sm font-bold transition-all",
                  active === t.key
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 3. Main Content Area */}
      <main className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active + (refetching ? "-loading" : "-ready")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {refetching ? (
              <RefetchingSkeleton />
            ) : (
              <TabRenderer active={active} data={analysis} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
