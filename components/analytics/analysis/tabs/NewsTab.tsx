"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { Newspaper } from "lucide-react";

type NewsItem = {
  headline?: string;
  date?: string;
  source?: string;
  url?: string;
  cause?: string;
  impact?: string;
  assets_affected?: string[];
};

export function NewsTab({ items }: { items?: NewsItem[] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper className="h-5 w-5" />}
        title="No news items"
        desc="We didn’t find any recent developments for your holdings."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((n, idx) => (
        <li key={idx} className="rounded-lg border p-4 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium line-clamp-2">{n.headline}</div>
            <div className="flex items-center gap-2">
              {n.assets_affected?.length ? (
                <Badge variant="outline">{n.assets_affected.join(", ")}</Badge>
              ) : null}
              {n.source ? <Badge variant="secondary">{n.source}</Badge> : null}
            </div>
          </div>
          {(n.cause || n.impact) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {n.cause ? <span>Cause: {n.cause}. </span> : null}
              {n.impact ? <span>Impact: {n.impact}</span> : null}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{n.date}</span>
            {n.url ? (
              <a
                className="underline"
                href={n.url}
                target="_blank"
                rel="noreferrer"
              >
                source
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
