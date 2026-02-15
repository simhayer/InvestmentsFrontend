"use client";

import { useContext, useEffect } from "react";
import type { PageContext, PageType } from "@/types/chat";
import { PageContextCtx } from "@/components/chat/ChatContext";

type UsePageContextArgs = {
  pageType: PageType;
  route: string;
  symbol?: string;
  summary?: string;
  dataSnapshot?: Record<string, unknown>;
};

/**
 * Register page context so the chat agent knows what the user is looking at.
 * Call this from any page component — the context automatically flows into
 * every chat request via ChatProvider.
 */
export function usePageContext({
  pageType,
  route,
  symbol,
  summary,
  dataSnapshot,
}: UsePageContextArgs) {
  const register = useContext(PageContextCtx);

  useEffect(() => {
    if (!register) return;

    const ctx: PageContext = {
      page_type: pageType,
      route,
      symbol: symbol || undefined,
      summary: summary || undefined,
      data_snapshot: dataSnapshot || undefined,
    };

    register(ctx);
  }, [register, pageType, route, symbol, summary, dataSnapshot]);
}
