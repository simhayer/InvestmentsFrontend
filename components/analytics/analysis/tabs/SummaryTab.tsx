import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { News } from "../../news";
import type { SummaryLayer } from "@/types/portfolio-ai";

type NarrativeBlock = { heading?: string; body: string };

export function SummaryTab({ data }: { data: SummaryLayer }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!data) return <Empty msg="No summary available." />;

  const narrativeBlocks = React.useMemo(
    () => buildNarrativeBlocks(data.summary),
    [data.summary]
  );
  const longNarrative =
    data.summary.length > 900 || narrativeBlocks.length > 4;
  const shouldClamp = longNarrative && !expanded;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-5">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Portfolio narrative
                </p>
                <p className="text-sm text-neutral-600">
                  AI-generated overview across macro, positioning, and drivers.
                </p>
              </div>
              <Badge variant="outline" className="border-neutral-200 text-neutral-700">
                AI-generated
              </Badge>
            </div>
            <div
              className={cn(
                "mt-4 space-y-3 text-neutral-800",
                shouldClamp && "max-h-[360px] overflow-hidden"
              )}
            >
              {narrativeBlocks.map((block, idx) => (
                <div key={idx} className="space-y-1.5">
                  {block.heading ? (
                    <h5 className="text-sm font-semibold text-neutral-900">
                      {block.heading}
                    </h5>
                  ) : null}
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {block.body}
                  </p>
                </div>
              ))}
            </div>
            {shouldClamp ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-white/45" />
            ) : null}
            {longNarrative ? (
              <div className="mt-3 flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2 text-neutral-700"
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? (
                    <>
                      Collapse
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read full narrative
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.25)]">
            <div
              className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-amber-400"
              aria-hidden="true"
            />
            <div className="pl-3 sm:pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">
                Disclaimer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
                {data.disclaimer}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200/80 bg-white p-4 sm:p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Confidence by section
            </p>
            <p className="text-sm text-neutral-600">
              How strong the AI feels about each layer.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(data.explainability.section_confidence).map(
              ([k, v]) => (
                <ConfidenceCell key={k} label={formatLabel(k)} value={v} />
              )
            )}
          </div>
        </div>
      </div>

      <News />
    </div>
  );
}

function ConfidenceCell({ label, value }: { label: string; value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const isZero = pct === 0;
  const barTone =
    isZero
      ? "bg-rose-300"
      : pct >= 75
      ? "bg-emerald-500"
      : pct >= 50
      ? "bg-amber-400"
      : "bg-neutral-300";
  const textTone =
    pct >= 75
      ? "text-emerald-600"
      : pct >= 50
      ? "text-amber-700"
      : "text-neutral-700";

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600">
          {label}
        </span>
        <span className={cn("text-sm font-semibold", textTone)}>{pct}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white">
        <div
          className={cn("h-2 rounded-full transition-all", barTone)}
          style={{ width: `${isZero ? 10 : pct}%` }}
        />
      </div>
    </div>
  );
}

function buildNarrativeBlocks(text: string): NarrativeBlock[] {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return [{ body: text }];
  return parts.map((part) => {
    const match = part.match(/^([A-Z][\w\s&%-]{2,60}):\s*(.+)$/i);
    if (match && match[1].split(" ").length <= 6) {
      return { heading: match[1], body: match[2] };
    }
    return { body: part };
  });
}

function formatLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm text-neutral-600 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.25)]">
      {msg}
    </div>
  );
}
