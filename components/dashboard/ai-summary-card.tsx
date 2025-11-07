"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { usePortfolioAi } from "@/hooks/use-portfolio-ai";
import Link from "next/link";

export function AnalysisSummaryCard() {
  const { data, meta, loading, refetching, error, refetch } = usePortfolioAi(7);

  const total =
    (data?.latest_developments?.length ?? 0) +
    (data?.catalysts?.length ?? 0) +
    (data?.actions?.length ?? 0) +
    (data?.risks_list?.length ?? 0);

  const cached = !!meta?.cached;
  const nextIn = meta?.nextUpdateIn ?? "now";
  const canRefreshNow = meta?.canRefreshNow ?? true;
  const showForce = meta?.showForce ?? false;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {refetching ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating…
              </Badge>
            ) : cached ? (
              <Badge variant="outline">Cached • next in {nextIn}</Badge>
            ) : (
              <Badge variant="secondary">Fresh</Badge>
            )}
            {typeof total === "number" && total > 0 && (
              <Badge variant="secondary">{total} items</Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Daily insights on news, catalysts, risks and actions for your
          holdings.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-2">
        {/* Primary CTA: either analyze or view analysis */}
        {error ? (
          <>
            <div className="text-sm text-destructive mr-auto">{error}</div>
            <Button
              onClick={() => refetch(false)}
              disabled={loading || refetching}
              variant="outline"
              className="gap-1"
            >
              Retry
            </Button>
          </>
        ) : total === 0 && !loading ? (
          <>
            <div className="text-sm text-muted-foreground mr-auto">
              No insights yet. Run your first analysis.
            </div>
            <Button
              onClick={() => refetch(false)}
              disabled={loading || refetching || !canRefreshNow}
              className="gap-1"
            >
              Analyze my portfolio <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            {showForce && (
              <Button
                onClick={() => refetch(true)}
                disabled={loading || refetching}
                variant="ghost"
              >
                Force
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="text-m text-muted-foreground mr-auto">
              {data?.summary ||
                "Your portfolio has been analyzed. View the full report for details."}
            </div>
            <Link href="/analytics" className="mr-auto">
              <Button className="gap-1">
                View full analysis <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
