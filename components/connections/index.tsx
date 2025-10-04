"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, RefreshCcw } from "lucide-react";
import { PlaidLinkButton } from "../plaid/plaid-link-button";
import type { User } from "@/types/user";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getPlaidInvestments } from "@/utils/plaidService";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getInstitutions } from "@/utils/investmentsService";
import { ConnectionItem } from "./connection-item";
import type { Connection } from "@/types/connection";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
/* ---------- utils ---------- */

const toCamel = (s: string) =>
  s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function keysToCamel<T>(input: T): T {
  if (Array.isArray(input)) return input.map(keysToCamel) as unknown as T;
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>).map(
      ([k, v]) => [toCamel(k), keysToCamel(v as unknown)]
    );
    return Object.fromEntries(entries) as T;
  }
  return input;
}

/* ---------- component ---------- */

type ConnectionsProps = {
  user: User;
  onLogout: () => void;
  onRemove?: (id: string) => void;
};

export function Connections({ user, onLogout, onRemove }: ConnectionsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // This hook fetches broader dashboard data (prices, etc.)
  const { refreshing, refreshPrices, reloadDashboardData } =
    useDashboardData(onLogout);

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
    try {
      await getPlaidInvestments(user.id);

      await Promise.all([reloadDashboardData(), loadConnections()]);
    } catch (e) {
      console.error("Failed to get investments:", e);
    }
  }, [user.id, reloadDashboardData, loadConnections]);

  const handlePlaidSuccess = useCallback(async () => {
    await Promise.all([reloadDashboardData(), loadConnections()]);
  }, [reloadDashboardData, loadConnections]);

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen bg-background">
        <Header
          user={user}
          onRefresh={refreshPrices}
          refreshing={refreshing}
          onPlaidLinkSuccess={handlePlaidSuccess}
          setSidebarOpen={setSidebarOpen}
          onAddClick={() => {}}
          // Optional: add a "Sync now" action if you expose it in Header
          // onSyncNow={onSyncNow}
        />
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="m-2 grid gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Skeleton className="h-44 rounded-md" />
            <Skeleton className="h-44 rounded-md" />
            <Skeleton className="h-44 rounded-md" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <Card className="max-w-xl m-2 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg">We hit a snag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-md border text-sm"
                onClick={() => loadConnections()}
              >
                Retry
              </button>
              <PlaidLinkButton
                userId={user.id}
                onSuccess={handlePlaidSuccess}
              />
            </div>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (!hasConnections) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-full p-4 ">
          <Card className="w-full h-full border-dashed shadow-sm ">
            <CardHeader className="text-center pb-4">
              <div
                className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"
                aria-hidden="true"
              >
                <Link2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold">
                No connections yet
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Connect your brokerage, bank, or crypto exchange to sync and
                track your holdings in one place.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-6">
              <PlaidLinkButton
                userId={user.id}
                onSuccess={handlePlaidSuccess}
              />
              <p className="text-xs text-muted-foreground">
                Securely powered by Plaid
              </p>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Toolbar */}
      <div className="m-2">
        <Card className="border-gray-200/80 shadow-sm">
          <CardContent className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-[-0.01em]">
                Connections
              </h2>
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-background">
                {connections.length} connection
                {connections.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onSyncNow}
                disabled={refreshing}
                title="Refresh your linked institutions"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Syncing…" : "Sync now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 m-2">
        {connections.map((c) => (
          <ConnectionItem key={c.id} connection={c} onRemove={onRemove} />
        ))}

        {/* Add connection card */}
        <Card className="border-dashed hover:shadow-sm transition-shadow mt-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold ">
              Add another connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 mt-2">
              Link more brokerages, banks, and exchanges to keep your portfolio
              in sync.
            </p>
            <PlaidLinkButton userId={user.id} onSuccess={handlePlaidSuccess} />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
