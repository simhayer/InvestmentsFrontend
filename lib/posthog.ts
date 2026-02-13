/**
 * PostHog analytics — thin wrapper so the rest of the app stays decoupled.
 *
 * Usage:
 *   import { analytics } from "@/lib/posthog";
 *   analytics.capture("portfolio_analysis_started", { currency: "USD" });
 */
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/** Initialise PostHog (call once from the provider). */
export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return; // skip in dev if no key

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // we handle this manually via Next.js router
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });
}

/** Typed event helper — add new events to the union as you go. */
export type AnalyticsEvent =
  | "signed_up"
  | "logged_in"
  | "logged_out"
  | "onboarding_completed"
  | "brokerage_connected"
  | "holding_added"
  | "holding_deleted"
  | "portfolio_analysis_started"
  | "portfolio_analysis_completed"
  | "symbol_analysis_started"
  | "crypto_analysis_started"
  | "currency_changed"
  | "plan_upgraded";

export const analytics = {
  /** Track a named event with optional properties. */
  capture(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    if (!POSTHOG_KEY) return;
    posthog.capture(event, properties);
  },

  /** Track a pageview (call from the route-change listener). */
  pageview(url: string) {
    if (!POSTHOG_KEY) return;
    posthog.capture("$pageview", { $current_url: url });
  },

  /** Identify a user after login / sign-up. */
  identify(userId: string, traits?: Record<string, unknown>) {
    if (!POSTHOG_KEY) return;
    posthog.identify(userId, traits);
  },

  /** Reset on logout. */
  reset() {
    if (!POSTHOG_KEY) return;
    posthog.reset();
  },
};
