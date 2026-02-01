import {
  PortfolioHealthExplainResponse,
} from "@/utils/portfolioService";
import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import React from "react";


export function HealthExplanationDetail({ data }: { data: PortfolioHealthExplainResponse }) {
  const safeData = {
    summary: data.summary,
    keyDrivers: data.key_drivers || (data as any).key_drivers || [],
    whatHelped: data.what_helped || (data as any).what_helped || [],
    whatHurt: data.what_hurt || (data as any).what_hurt || [],
    nextSteps: data.next_steps || (data as any).next_steps || [],
  };

  return (
    <div className="bg-neutral-50/40 p-5 lg:p-6 space-y-6">
      
      {/* 1. Summary Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Analysis</h4>
        </div>
        <p className="text-sm leading-relaxed text-neutral-700 max-w-4xl">
          {safeData.summary}
        </p>
      </div>

      {/* 2. Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* What Helped */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">What's Working</span>
          </div>
          {safeData.whatHelped.length > 0 ? (
            <ul className="space-y-2.5">
              {safeData.whatHelped.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-xs text-neutral-700 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-neutral-400 italic">No specific positives identified.</span>
          )}
        </div>

        {/* What Hurt */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Risk Factors</span>
          </div>
          {safeData.whatHurt.length > 0 ? (
            <ul className="space-y-2.5">
              {safeData.whatHurt.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500 mt-0.5" />
                  <span className="text-xs text-neutral-700 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-neutral-400 italic">No major risks identified.</span>
          )}
        </div>
      </div>

      {/* 3. Action Plan (Next Steps) */}
      {safeData.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
           <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Action Plan</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {safeData.nextSteps.map((step, i) => (
              <div key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm">
                 <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                   {i + 1}
                 </div>
                 <span className="text-xs text-neutral-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export function PortfolioExplainCard({ healthExplain, explainLoading }: { healthExplain: PortfolioHealthExplainResponse, explainLoading: boolean }){
    return (
    <div className="animate-in slide-in-from-top-2 fade-in">
            <Separator className="bg-neutral-100" />
            
            {explainLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <Skeleton className="h-24 w-full rounded-xl" />
                   <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ) : healthExplain ? (
              <HealthExplanationDetail data={healthExplain} />
            ) : (
              <div className="p-6 text-sm text-neutral-500">No details available.</div>
            )}
          </div>
    )
}
