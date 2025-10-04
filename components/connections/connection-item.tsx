"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCcw,
  AlertTriangle,
  Trash2,
  Power,
  CheckCircle2,
} from "lucide-react";
import * as React from "react";
import type { Connection, ConnectionStatus } from "@/types/connection";

/* ---------------- utils ---------------- */

function formatWhen(d: string | Date | null | undefined) {
  if (!d) return "NA";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "NA";

  // Try a compact “time ago” for recent timestamps, otherwise locale date+time
  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < day) {
    if (diffMs < minute) return "just now";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
    return `${Math.floor(diffMs / hour)} hr ago`;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: ConnectionStatus) {
  switch (status) {
    case "connected":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700"
          title="Connection is active"
        >
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected
          </span>
        </Badge>
      );
    case "syncing":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700"
          title="Sync in progress"
        >
          <span className="inline-flex items-center gap-1">
            <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
            Syncing
          </span>
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-700"
          title="There was an issue with this connection"
        >
          <span className="inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Error
          </span>
        </Badge>
      );
    case "disconnected":
    default:
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground"
          title="Connection is not active"
        >
          <span className="inline-flex items-center gap-1">
            <Power className="h-3.5 w-3.5" />
            Disconnected
          </span>
        </Badge>
      );
  }
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function guessDomainFromName(name: string): string | null {
  if (!name) return null;
  // Take first word only, lowercased
  const firstWord = name.split(/\s+/)[0].toLowerCase();
  return `${firstWord}.com`;
}

export function ProviderAvatar({ name }: { name: string }) {
  const [imgError, setImgError] = React.useState(false);

  const initials = initialsFromName(name);
  const guessedDomain = guessDomainFromName(name);
  const logoUrl = guessedDomain
    ? `https://logo.clearbit.com/${guessedDomain}`
    : null;

  const hue = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h * 31 + name.charCodeAt(i)) % 360;
    }
    return h;
  }, [name]);

  const bg = `hsl(${hue} 70% 95%)`;
  const fg = `hsl(${hue} 45% 35%)`;

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="h-10 w-10 rounded-xl object-contain bg-white border"
        onError={() => setImgError(true)}
      />
    );
  }

  // fallback initials
  return (
    <div
      className="h-10 w-10 rounded-xl flex items-center justify-center font-semibold"
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

/* --------------- component --------------- */

type ConnectionItemProps = {
  connection: Connection;
  onRemove?: (id: string) => void;
  confirmRemove?: boolean; // default true
};

export function ConnectionItem({
  connection,
  onRemove,
  confirmRemove = true,
}: ConnectionItemProps) {
  const [removing, setRemoving] = React.useState(false);

  const handleRemove = async () => {
    if (!onRemove) return;
    if (confirmRemove) {
      const ok = window.confirm(
        `Remove ${connection.institutionName}? You can link it again later.`
      );
      if (!ok) return;
    }
    try {
      setRemoving(true);
      await onRemove(connection.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card
      key={connection.id}
      className="relative overflow-hidden group border border-gray-200/80 hover:border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md"
      data-testid={`connection-${connection.id}`}
      aria-busy={connection.status === "syncing" ? "true" : "false"}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3 min-w-0">
          <ProviderAvatar name={connection.institutionName} />
          <div className="min-w-0">
            <CardTitle className="text-sm truncate font-semibold">
              {connection.institutionName}
            </CardTitle>
          </div>
        </div>

        {/* hardcoding connected for now */}
        <div aria-live="polite">{statusBadge("connected")}</div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs text-muted-foreground">Last synced</div>
          <div
            className="text-sm text-right"
            title={String(connection.syncedAt ?? "")}
          >
            {formatWhen(connection.syncedAt ?? null)}
          </div>

          <div className="text-xs text-muted-foreground">Connected</div>
          <div
            className="text-sm text-right"
            title={String(connection.createdAt ?? "")}
          >
            {formatWhen(connection.createdAt ?? null)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 ml-auto text-red-600 hover:text-red-700"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${connection.institutionName}`}
          >
            <Trash2 className="h-4 w-4" />
            {removing ? "Removing..." : "Remove"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
