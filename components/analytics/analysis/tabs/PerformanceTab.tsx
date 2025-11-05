"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceAnalysis } from "@/types/portfolio-ai";
import { Trophy, TrendingDown, RefreshCw } from "lucide-react";

export function PerformanceTab({ data }: { data?: PerformanceAnalysis }) {
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">
        No performance analysis available.
      </div>
    );
  }

  const { summary, leaders = [], laggards = [], notable_shifts = [] } = data;

  return (
    <div className="space-y-4">
      {summary && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {summary}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="py-3 flex-row items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm">Leaders</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {leaders.length ? (
              leaders.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 flex-row items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <CardTitle className="text-sm">Laggards</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {laggards.length ? (
              laggards.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-3 flex-row items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <CardTitle className="text-sm">Notable Shifts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notable_shifts.length ? (
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {notable_shifts.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
