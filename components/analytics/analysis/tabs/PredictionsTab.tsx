"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  PredictionsBlock,
  PredictionAsset,
  Direction,
} from "@/types/portfolio-ai";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

function DirIcon({ d }: { d: Direction }) {
  if (d === "up") return <ArrowUpRight className="h-4 w-4" />;
  if (d === "down") return <ArrowDownRight className="h-4 w-4" />;
  return <ArrowRight className="h-4 w-4" />;
}

function ConfBar({ v = 0 }: { v?: number }) {
  const pct = Math.max(0, Math.min(1, v)) * 100;
  return (
    <div className="w-full h-2 rounded bg-muted overflow-hidden">
      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PredictionsTab({ data }: { data?: PredictionsBlock }) {
  const assets = data?.assets ?? [];
  const windowLabel = data?.forecast_window || "30D";

  if (!assets.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No predictions available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Forecast window: <span className="font-medium">{windowLabel}</span>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Asset Outlook</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-3">Symbol</th>
                <th className="py-2 pr-3">Direction</th>
                <th className="py-2 pr-3">Exp. Change</th>
                <th className="py-2 pr-3 w-40">Confidence</th>
                <th className="py-2 pr-3">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a: PredictionAsset) => (
                <tr key={a.symbol} className="border-t">
                  <td className="py-2 pr-3 font-medium">{a.symbol}</td>
                  <td className="py-2 pr-3 flex items-center gap-1 capitalize">
                    <DirIcon d={a.expected_direction} />
                    {a.expected_direction}
                  </td>
                  <td className="py-2 pr-3">
                    {typeof a.expected_change_pct === "number"
                      ? `${a.expected_change_pct.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <ConfBar v={a.confidence} />
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {a.rationale || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Informational outlook only. Not investment advice.
      </p>
    </div>
  );
}
