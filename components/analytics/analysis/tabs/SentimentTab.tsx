"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SentimentBlock } from "@/types/portfolio-ai";
import { MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";

function Pill({ tone }: { tone?: "positive" | "neutral" | "negative" }) {
  if (tone === "positive")
    return <Badge className="bg-emerald-600">Positive</Badge>;
  if (tone === "negative")
    return <Badge className="bg-red-600">Negative</Badge>;
  return <Badge variant="secondary">Neutral</Badge>;
}

function Overall({ s }: { s?: "bullish" | "neutral" | "bearish" }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
      {s === "bullish" && (
        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
      )}
      {s === "bearish" && <TrendingDown className="h-3.5 w-3.5 text-red-600" />}
      {(!s || s === "neutral") && <Minus className="h-3.5 w-3.5" />}
      <span className="capitalize">{s ?? "neutral"}</span>
    </div>
  );
}

export function SentimentTab({ data }: { data?: SentimentBlock }) {
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">No sentiment data.</div>
    );
  }

  const {
    overall_sentiment,
    summary,
    drivers = [],
    sources_considered = [],
  } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Overall s={overall_sentiment} />
        {!!sources_considered.length && (
          <span className="text-xs text-muted-foreground">
            Sources: {sources_considered.slice(0, 4).join(", ")}
            {sources_considered.length > 4 ? "…" : ""}
          </span>
        )}
      </div>

      {summary && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {summary}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-3 flex-row items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <CardTitle className="text-sm">Narrative Drivers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drivers.length ? (
            drivers.map((d, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.theme}</span>
                  <Pill tone={d.tone} />
                </div>
                {d.impact && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Impact: </span>
                    {d.impact}
                  </div>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
