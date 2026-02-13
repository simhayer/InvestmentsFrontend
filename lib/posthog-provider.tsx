"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, analytics } from "@/lib/posthog";
import { useAuth } from "@/lib/auth-provider";

/**
 * PostHogProvider
 * - Initialises posthog-js once.
 * - Tracks pageviews on route changes.
 * - Identifies / resets the user when auth state changes.
 */
export function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, hasSession } = useAuth();
  const identifiedRef = useRef<string | null>(null);

  // ── 1. Initialise on mount ──────────────────────────────────
  useEffect(() => {
    initPostHog();
  }, []);

  // ── 2. Pageview on route change ─────────────────────────────
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    analytics.pageview(url);
  }, [pathname, searchParams]);

  // ── 3. Identify / reset on auth change ──────────────────────
  useEffect(() => {
    if (hasSession && user) {
      const uid = String(user.id);
      if (identifiedRef.current !== uid) {
        analytics.identify(uid, { email: user.email });
        identifiedRef.current = uid;
      }
    } else if (!hasSession && identifiedRef.current) {
      analytics.reset();
      identifiedRef.current = null;
    }
  }, [hasSession, user]);

  return null; // renders nothing — just side effects
}
