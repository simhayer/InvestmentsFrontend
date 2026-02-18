"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link2,
  RefreshCcw,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

import { PlaidLinkButton } from "../plaid/plaid-link-button";
import { ConnectionItem } from "./connection-item";
import { UpgradeGate } from "@/components/upgrade-gate";

import { getPlaidInvestments, createLinkToken, removeConnection } from "@/utils/plaidService";
import { getInstitutions } from "@/utils/investmentsService";
import { keysToCamel } from "@/utils/format";
import { useAuth } from "@/lib/auth-provider";
import type { AppUser } from "@/types/user";
import type { Connection } from "@/types/connection";
import { Page } from "@/components/layout/Page";
import { cn } from "@/lib/utils";

// Connection limits per plan (must match backend PLAN_LIMITS)
const CONNECTION_LIMITS: Record<string, number> = {
  free: 1,
  premium: 3,
  pro: -1, // unlimited
};

export function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const userId = String(user?.id || "");

  // ─── Fetch Plaid link token ONCE and share across all buttons ─────
  const [sharedLinkToken, setSharedLinkToken] = useState<string | null>(null);
  const tokenFetchedRef = useRef(false);

  useEffect(() => {
    if (!userId || tokenFetchedRef.current) return;
    tokenFetchedRef.current = true;
    createLinkToken(userId)
      .then(setSharedLinkToken)
      .catch((err) => console.error("Failed to fetch link token:", err));
  }, [userId]);

  const hasConnections = connections.length > 0;
  const plan = (user as AppUser)?.plan ?? "free";
  const connectionLimit = CONNECTION_LIMITS[plan] ?? 1;
  const atConnectionLimit = connectionLimit !== -1 && connections.length >= connectionLimit;

  // ─── Load connections with dedup guard ────────────────────────────
  const connectionsInFlightRef = useRef(false);

  const loadConnections = useCallback(async () => {
    if (connectionsInFlightRef.current) return;
    connectionsInFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await getInstitutions();
      const list = keysToCamel<Connection[]>(data as unknown as Connection[]);
      setConnections(Array.isArray(list) ? list : []);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("Failed to fetch connections:", e);
        setError("Couldn't load your connections. Please try again.");
        setConnections([]);
      }
    } finally {
      setLoading(false);
      connectionsInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handlePlaidSuccess = useCallback(async () => {
    await loadConnections();
    toast({
      title: "Account connected",
      description: "Your holdings are being synced now.",
    });
  }, [loadConnections]);

  const handleRemove = useCallback(async (connectionId: string) => {
    try {
      await removeConnection(connectionId);
      await loadConnections();
      toast({
        title: "Connection removed",
        description: "The account has been disconnected.",
      });
    } catch (e) {
      console.error("Failed to remove connection:", e);
      toast({
        variant: "destructive",
        title: "Remove failed",
        description: "Could not disconnect the account. Please try again.",
      });
    }
  }, [loadConnections]);

  const onSyncNow = useCallback(async () => {
    if (!hasConnections) return;

    try {
      setRefreshing(true);
      await getPlaidInvestments();
      await loadConnections();
      toast({
        title: "Sync complete",
        description: "Your portfolio data is up to date.",
      });
    } catch (e) {
      console.error("Failed to sync:", e);
      toast({
        variant: "destructive",
        title: "Sync unsuccessful",
        description: "Please check your connection and try again.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [hasConnections, loadConnections]);

  return (
    <Page>
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text">
            Assets & Institutions
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Connections
            </h1>
            {!loading && (
              <Badge
                variant="secondary"
                className="rounded-full bg-neutral-100 text-neutral-600 border-none"
              >
                {connections.length} Linked
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl border-neutral-200 bg-white font-semibold text-neutral-700 shadow-sm"
            onClick={onSyncNow}
            disabled={!hasConnections || refreshing}
          >
            <RefreshCcw
              className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
            />
            {refreshing ? "Syncing..." : "Sync All"}
          </Button>

          {!loading && !atConnectionLimit && (
            <PlaidLinkButton
              userId={userId}
              onSuccess={handlePlaidSuccess}
              linkToken={sharedLinkToken}
              variant="default"
              className="h-10 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white shadow-lg hover:bg-neutral-800"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Account
            </PlaidLinkButton>
          )}
        </div>
      </header>

      {/* --- CONNECTION LIMIT BANNER --- */}
      {!loading && atConnectionLimit && hasConnections && (
        <div className="mb-6">
          <UpgradeGate
            compact
            feature="Brokerage Connections"
            plan={plan}
            message={`Your ${plan === "free" ? "Free" : "Plus"} plan supports ${connectionLimit} connection${connectionLimit === 1 ? "" : "s"}. Upgrade to add more.`}
          />
        </div>
      )}

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-[100px] w-full rounded-3xl" />
          <Skeleton className="h-[100px] w-full rounded-3xl" />
        </div>
      ) : error ? (
        <Card className="rounded-[32px] border-rose-100 bg-rose-50/20 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-10 w-10 text-rose-500" />
            <CardTitle className="mb-2">Connection Error</CardTitle>
            <CardDescription className="mb-6 max-w-xs">{error}</CardDescription>
            <Button
              onClick={loadConnections}
              variant="outline"
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : !hasConnections ? (
        <Card className="overflow-hidden rounded-[32px] border-neutral-200/60 bg-white shadow-xl shadow-neutral-200/40">
          <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 ring-1 ring-neutral-100">
                <Link2 className="h-10 w-10" />
              </div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-neutral-900">
              Connect your first account
            </h3>
            <p className="mb-8 max-w-sm text-sm text-neutral-500 leading-relaxed">
              Sync your brokerages, banks, or crypto wallets to see all your
              holdings, performance, and AI insights in one unified dashboard.
            </p>

            <div className="flex w-full max-w-xs flex-col gap-4">
              <PlaidLinkButton
                userId={userId}
                onSuccess={handlePlaidSuccess}
                linkToken={sharedLinkToken}
                className="w-full rounded-2xl h-12 bg-neutral-900 text-base font-bold text-white shadow-xl"
              />
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <ShieldCheck className="h-4 w-4" />
                Bank-level Security
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Connections List */}
          <div className="grid gap-4">
            {connections.map((c) => (
              <ConnectionItem key={c.id} connection={c} onRemove={handleRemove} />
            ))}
          </div>

          {/* Security Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-[24px] border border-neutral-100 bg-neutral-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  Your data is encrypted
                </p>
                <p className="text-[10px] text-neutral-500">
                  Only you can see your portfolio details.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter sm:shrink-0">
              Powered by <span className="text-neutral-900">Plaid</span>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
