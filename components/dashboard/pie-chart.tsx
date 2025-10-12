"use client";

import * as React from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Use the app's canonical types to avoid path-based incompatibilities
import type { PortfolioSummary } from "@/utils/portfolioService";

type AItem = PortfolioSummary["allocations"]["byType"][number];

export type AllocationsPieProps = {
  /** Prefer this: pass PortfolioSummary["allocations"]["byType"] */
  items?: PortfolioSummary["allocations"]["byType"];
  /** Deprecated alias — still supported for backwards compatibility */
  data?: AItem[];
  currency?: "USD" | "CAD" | string;
  /** Optional custom color palette (will loop if fewer than slices) */
  colors?: string[];
  className?: string;
};

const DEFAULT_COLORS = [
  "hsl(var(--chart-1, 221_83%_53%))", // blue
  "hsl(var(--chart-2, 142_76%_36%))", // green
  "hsl(var(--chart-3, 24_95%_53%))", // orange
  "hsl(var(--chart-4, 286_76%_45%))", // purple
  "hsl(var(--chart-5, 346_77%_49%))", // red
];

const currencyFmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

const pctFmt = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(2)}%`;

function makeValueData(data: AItem[]) {
  // Map to {name, value}
  return data.map((d) => ({ name: d.key, value: d.value }));
}

export default function AllocationsPie({
  items,
  data,
  currency = "USD",
  colors = DEFAULT_COLORS,
  className,
}: AllocationsPieProps) {
  const base: AItem[] = React.useMemo(() => items ?? data ?? [], [items, data]);

  const valueData = React.useMemo(() => makeValueData(base), [base]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
      <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {typeof p.value === "number" && p.value <= 100
            ? pctFmt(p.value)
            : currencyFmt(Number(p.value || 0), currency)}
        </div>
      </div>
    );
  };

  const renderCells = (len: number) =>
    Array.from({ length: len }).map((_, i) => (
      <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
    ));

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs font-light text-muted-foreground">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={"grid gap-4 md:grid-cols-2 " + (className ?? "")}>
      {/* Value Pie */}
      <Card className="relative border-hidden">
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <RePieChart>
                <Pie
                  data={valueData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius="80%"
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={2}
                  stroke="none"
                >
                  {renderCells(valueData.length)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  content={renderLegend}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
