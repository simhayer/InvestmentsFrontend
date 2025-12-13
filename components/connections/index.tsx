"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, RefreshCcw, ShieldCheck } from "lucide-react";
import { PlaidLinkButton } from "../plaid/plaid-link-button";
import { getPlaidInvestments } from "@/utils/plaidService";
import { getInstitutions } from "@/utils/investmentsService";
import { ConnectionItem } from "./connection-item";
import type { Connection } from "@/types/connection";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { keysToCamel } from "@/utils/format";
import { useAuth } from "@/lib/auth-provider";
import { toast } from "../ui/use-toast";
/* ---------- component ---------- */

type ConnectionsProps = {
  onRemove?: (id: string) => void;
};

export function Connections({ onRemove }: ConnectionsProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const hasConnections = useMemo(() => connections.length > 0, [connections]);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstitutions();
      // Cast unknown -> expected shape and camelize keys from API if snake_case
      const list = keysToCamel<Connection[]>(data as unknown as Connection[]);
      setConnections(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Failed to fetch connections:", e);
        setError("Couldn’t load your connections. Please try again.");
        setConnections([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const onSyncNow = useCallback(async () => {
    if (!hasConnections) {
      toast({
        title: "Connect an account to sync",
        description:
          "Link a brokerage, bank, or exchange to pull the latest balances.",
      });
      return;
    }
    try {
      setRefreshing(true);
      await getPlaidInvestments();
      await loadConnections(); // just to update the timestamp
    } catch (e) {
      console.error("Failed to get investments:", e);
      const message =
        (e as any)?.message || "Couldn’t sync your connections right now.";
      const status = (e as any)?.status as number | undefined;
      const missingToken =
        status === 404 ||
        message.toLowerCase().includes("access token") ||
        message.toLowerCase().includes("not found");

      toast({
        variant: "destructive",
        title: "Sync unsuccessful",
        description: missingToken
          ? "No linked access token found. Please connect an account first."
          : "Please try again in a moment.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [hasConnections, loadConnections]);

  const handlePlaidSuccess = useCallback(async () => {
    await Promise.resolve(loadConnections());
  }, [loadConnections]);

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]">
      <div className="mx-auto w-full max-w-[1260px] px-4 sm:px-6 lg:px-10 xl:px-14 py-9 sm:py-10 lg:py-12 space-y-6 sm:space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Accounts
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900">
                Connections
              </h1>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.4)]">
                {connections.length} connected
              </span>
            </div>
            <p className="text-sm text-neutral-600 max-w-2xl">
              Your linked brokerages, banks, or exchanges. Keep them connected to sync balances and holdings automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-1.5 rounded-xl border-neutral-200 bg-white px-4 text-neutral-800 shadow-sm"
              onClick={onSyncNow}
              disabled={!hasConnections || refreshing || loading}
              title={
                hasConnections
                  ? "Refresh your linked institutions"
                  : "Link an account to enable sync"
              }
            >
              <RefreshCcw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Syncing…" : "Sync now"}
            </Button>
          </div>
        </header>

        {loading ? (
          <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3 pb-8">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="rounded-3xl border border-rose-100 bg-white shadow-[0_20px_56px_-40px_rgba(15,23,42,0.38)]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900">
                We hit a snag
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadConnections()}
                className="rounded-lg"
              >
                Retry
              </Button>
              <PlaidLinkButton
                userId={user?.id || ""}
                onSuccess={handlePlaidSuccess}
                size="sm"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
            <CardHeader className="flex flex-col gap-3 border-b border-neutral-100/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                  Connected accounts
                </p>
                <CardTitle className="text-xl font-semibold text-neutral-900">
                  {hasConnections ? "Your linked institutions" : "Ready to connect"}
                </CardTitle>
                <CardDescription className="text-sm text-neutral-600">
                  Link brokerages, banks, or exchanges to keep your portfolio in sync.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:self-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 gap-1.5 rounded-xl border-neutral-200 bg-white px-4 text-neutral-800 shadow-sm"
                  onClick={onSyncNow}
                  disabled={!hasConnections || refreshing}
                  title={
                    hasConnections
                      ? "Refresh your linked institutions"
                      : "Link an account to enable sync"
                  }
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Syncing…" : "Sync now"}
                </Button>
                <PlaidLinkButton
                  userId={user?.id || ""}
                  onSuccess={handlePlaidSuccess}
                  size="sm"
                  variant="secondary"
                  className="rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Add another account
                </PlaidLinkButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pb-7">
              {hasConnections ? (
                <div className="space-y-3">
                  {connections.map((c) => (
                    <ConnectionItem
                      key={c.id}
                      connection={c}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 px-6 py-10 text-center sm:px-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-neutral-200">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-neutral-900">
                      No connections yet
                    </p>
                    <p className="text-sm text-neutral-600 max-w-xl">
                      Connect your brokerage, bank, or crypto exchange to sync and track your holdings in one place.
                    </p>
                  </div>
                  <div className="w-full max-w-sm space-y-3">
                    <PlaidLinkButton
                      userId={user?.id || ""}
                      onSuccess={handlePlaidSuccess}
                      fullWidth
                      className="w-full"
                    />
                    <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                      <ShieldCheck className="h-4 w-4" />
                      Securely powered by Plaid
                    </p>
                  </div>
                </div>
              )}

              {hasConnections ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50/70 px-4 py-3 text-xs text-neutral-600">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-neutral-500" />
                    Securely powered by Plaid
                  </span>
                  <PlaidLinkButton
                    userId={user?.id || ""}
                    onSuccess={handlePlaidSuccess}
                    size="sm"
                    variant="ghost"
                    className="h-9 px-3 text-sm text-neutral-800 hover:bg-white"
                  >
                    Add another account
                  </PlaidLinkButton>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
