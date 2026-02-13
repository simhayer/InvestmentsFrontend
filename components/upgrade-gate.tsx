"use client";

import Link from "next/link";
import { Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpgradeGateProps {
  /** The feature that's blocked (for display). */
  feature?: string;
  /** Current plan name. */
  plan?: string;
  /** Short description of what upgrading unlocks. */
  message?: string;
  /** Compact mode for inline placement. */
  compact?: boolean;
  className?: string;
}

/**
 * Shown when a user hits a tier limit.
 * Two modes:
 *   - Full (default): centered card with icon, message, CTA.
 *   - Compact: slim inline banner.
 */
export function UpgradeGate({
  feature,
  plan = "free",
  message,
  compact = false,
  className,
}: UpgradeGateProps) {
  const defaultMsg =
    plan === "free"
      ? "Upgrade to Plus or Pro to unlock this feature."
      : "You've reached your daily limit. Upgrade to Pro for unlimited access.";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3",
          className
        )}
      >
        <Lock className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 flex-1">{message ?? defaultMsg}</p>
        <Link href="/pricing">
          <Button
            size="sm"
            className="h-8 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 px-3"
          >
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200 mb-4">
        <Zap className="h-6 w-6 text-amber-600" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
        {feature ? `${feature} is a paid feature` : "Upgrade required"}
      </h3>

      <p className="text-sm text-neutral-500 max-w-sm mb-5">
        {message ?? defaultMsg}
      </p>

      <div className="flex items-center gap-3">
        <Link href="/pricing">
          <Button className="h-10 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 px-6">
            View Plans
          </Button>
        </Link>
      </div>

      <p className="text-xs text-neutral-400 mt-3">
        You&apos;re on the <span className="font-semibold capitalize">{plan}</span> plan
      </p>
    </div>
  );
}

/**
 * Parse a 403 tier-limit error from the backend.
 * Returns null if it's not a tier error.
 */
export function parseTierError(
  error: unknown
): { code: string; plan: string; feature: string; limit: number; used: number; message: string } | null {
  if (!error || typeof error !== "object") return null;

  // Handle fetch errors where the body was already parsed
  const detail = (error as any)?.detail ?? (error as any)?.message;
  if (!detail) return null;

  // The backend returns { detail: { message, code, plan, feature, limit, used } }
  if (typeof detail === "object" && detail.code === "TIER_LIMIT") {
    return detail;
  }

  // Sometimes the error message is a JSON string
  if (typeof detail === "string") {
    try {
      const parsed = JSON.parse(detail);
      if (parsed?.code === "TIER_LIMIT") return parsed;
    } catch {
      // not JSON
    }
  }

  return null;
}
