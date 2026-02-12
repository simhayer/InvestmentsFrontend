"use client";

import { ActionItem } from "@/types/portfolio-analysis";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowUpRight, Clock } from "lucide-react";

export function ActionsSidebar({
  actions,
  loading,
}: {
  actions: ActionItem[];
  loading: boolean;
}) {
  if (loading)
    return <div className="h-64 animate-pulse rounded-[28px] bg-neutral-100" />;

  return (
    <div className="rounded-[28px] border border-neutral-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
          Suggested Actions
        </h3>
        <Badge
          variant="secondary"
          className="rounded-full bg-blue-50 text-blue-600 border-none"
        >
          {actions.length} New
        </Badge>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 3).map((action, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                <Clock className="h-3 w-3" />
                {action.urgency}
              </div>
            </div>

            <h4 className="text-sm font-bold text-neutral-900 mb-1">
              {action.title}
            </h4>
            <p className="text-[11px] leading-relaxed text-neutral-500 line-clamp-2">
              {action.rationale}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-50 pt-3">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                {action.category.replace("_", " ")}
              </span>
              <ArrowUpRight className="h-3 w-3 text-neutral-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
