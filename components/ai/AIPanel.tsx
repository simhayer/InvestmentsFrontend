// components/ai/AIPanel.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import { useMemo } from "react";

// If you already have this type in `@/types/ai`, import it instead.
export type HoldingAIAnalysis = {
  symbol: string;
  as_of_utc: string;
  rating: "hold" | "sell" | "watch" | "diversify" | string;
  rationale: string;
  key_risks: string[];
  suggestions: string[];
  data_notes?: string[];
  disclaimer: string;
  sources?: { title?: string; url: string; host?: string }[];
  provider_used?: string;
  events?: { date?: string; label: string; url?: string }[];
  next_dates?: { earnings_date?: string; ex_dividend_date?: string };
};

const hostOf = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const ratingClass = (r?: string) => {
  const x = (r || "").toLowerCase();
  if (x === "sell") return "bg-red-100 text-red-800";
  if (x === "hold") return "bg-amber-100 text-amber-800";
  if (x === "watch") return "bg-gray-100 text-gray-800";
  if (x === "diversify") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

export function AIPanel({
  symbol,
  name,
  holdingAnalysis,
}: {
  symbol: string;
  name?: string | null;
  holdingAnalysis: HoldingAIAnalysis | null;
}) {
  const sources = useMemo(
    () => holdingAnalysis?.sources?.slice(0, 6) ?? [],
    [holdingAnalysis?.sources]
  );

  if (!holdingAnalysis) return null;

  return (
    <div className="mt-4">
      <Card className="p-3 border-slate-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-slate-700" />
            <strong>
              AI Analysis{symbol ? ` — ${symbol}` : ""}{" "}
              {name ? (
                <span className="text-slate-500 font-normal">({name})</span>
              ) : null}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={ratingClass(holdingAnalysis.rating)}>
              {String(holdingAnalysis.rating).toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500">
              As of {new Date(holdingAnalysis.as_of_utc).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Rationale */}
        {holdingAnalysis.rationale && (
          <p className="mt-2 text-sm text-slate-800">
            {holdingAnalysis.rationale}
          </p>
        )}

        {/* Upcoming dates */}
        {!!holdingAnalysis.next_dates && (
          <div className="mt-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" /> Upcoming
            </div>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {holdingAnalysis.next_dates.earnings_date && (
                <div>
                  <span className="text-gray-500">Next earnings: </span>
                  <span className="font-medium">
                    {new Date(
                      holdingAnalysis.next_dates.earnings_date
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {holdingAnalysis.next_dates.ex_dividend_date && (
                <div>
                  <span className="text-gray-500">Ex-dividend: </span>
                  <span className="font-medium">
                    {new Date(
                      holdingAnalysis.next_dates.ex_dividend_date
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risks & Suggestions */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {!!holdingAnalysis.key_risks?.length && (
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Key risks
              </div>
              <ul className="list-disc ml-5 mt-1 text-sm text-slate-800">
                {holdingAnalysis.key_risks.slice(0, 5).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {!!holdingAnalysis.suggestions?.length && (
            <div>
              <div className="text-sm font-medium">Suggestions</div>
              <ul className="list-disc ml-5 mt-1 text-sm text-slate-800">
                {holdingAnalysis.suggestions.slice(0, 4).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sources */}
        {!!sources.length && (
          <div className="mt-3">
            <div className="text-sm font-medium">Sources</div>
            <div className="mt-2 grid gap-2">
              {sources.map((s, i) => {
                const host = s.host || hostOf(s.url);
                return (
                  <div key={i} className="rounded border bg-gray-50 p-2">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                        title={s.title || s.url}
                      >
                        {s.title || s.url}
                      </a>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                      {host && <Badge variant="outline">{host}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events (optional if your prompt returns them) */}
        {!!holdingAnalysis.events?.length && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" /> Events
            </div>
            <div className="mt-2 grid gap-2">
              {holdingAnalysis.events.map((e, i) => (
                <div key={i} className="rounded border p-2 text-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{e.label}</div>
                    <div className="text-xs text-gray-600">
                      {e.date ? new Date(e.date).toLocaleString() : "—"}
                    </div>
                  </div>
                  {!!e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Details <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data notes / disclaimer */}
        {!!holdingAnalysis.data_notes?.length && (
          <p className="mt-3 text-xs text-gray-500">
            {holdingAnalysis.data_notes.join(" • ")}
          </p>
        )}
        {holdingAnalysis.disclaimer && (
          <p className="mt-1 text-xs text-gray-500">
            {holdingAnalysis.disclaimer}
          </p>
        )}
      </Card>
    </div>
  );
}
