"use client";

import * as React from "react";
import {
  RefreshCcw,
  AlertTriangle,
  Trash2,
  Power,
  CheckCircle2,
  Calendar,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Connection, ConnectionStatus } from "@/types/connection";

/* ---------------- utils ---------------- */

function formatWhen(d: string | Date | null | undefined) {
  if (!d) return "Never";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "NA";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < day) {
    if (diffMs < minute) return "just now";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    return `${Math.floor(diffMs / hour)}h ago`;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const configs = {
    connected: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
      label: "Healthy",
    },
    syncing: {
      className: "bg-blue-50 text-blue-700 border-blue-100",
      icon: RefreshCcw,
      label: "Syncing",
      iconClass: "animate-spin",
    },
    error: {
      className: "bg-rose-50 text-rose-700 border-rose-100",
      icon: AlertTriangle,
      label: "Re-auth required",
    },
    disconnected: {
      className: "bg-neutral-50 text-neutral-500 border-neutral-100",
      icon: Power,
      label: "Paused",
    },
  };

  const config = configs[status] || configs.disconnected;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight shadow-none transition-all",
        config.className
      )}
    >
      <Icon className={cn("mr-1 h-3 w-3", config.icon)} />
      {config.label}
    </Badge>
  );
}

export function ProviderAvatar({ name }: { name: string }) {
  const [imgError, setImgError] = React.useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const firstWord = name.split(/\s+/)[0].toLowerCase();
  const logoUrl = `https://logo.clearbit.com/${firstWord}.com`;

  const hue = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);

  if (!imgError) {
    return (
      <div className="relative h-12 w-12 shrink-0">
        <img
          src={logoUrl}
          alt={name}
          className="h-12 w-12 rounded-2xl border border-neutral-100 bg-white object-contain p-2 shadow-sm"
          onError={() => setImgError(true)}
        />
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
      </div>
    );
  }

  return (
    <div
      className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm"
      style={{
        backgroundColor: `hsl(${hue} 70% 95%)`,
        color: `hsl(${hue} 45% 35%)`,
      }}
    >
      {initials}
    </div>
  );
}

/* --------------- component --------------- */

type ConnectionItemProps = {
  connection: Connection;
  onRemove?: (id: string) => void;
  confirmRemove?: boolean;
};

export function ConnectionItem({
  connection,
  onRemove,
  confirmRemove = true,
}: ConnectionItemProps) {
  const [removing, setRemoving] = React.useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemove) return;
    if (
      confirmRemove &&
      !window.confirm(`Disconnect ${connection.institutionName}?`)
    )
      return;

    setRemoving(true);
    try {
      await onRemove(connection.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-[24px] border border-neutral-200/60 bg-white p-5 transition-all duration-300",
        "hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40 sm:flex-row sm:items-center",
        removing && "opacity-50 grayscale pointer-events-none"
      )}
    >
      {/* 1. Logo & Basic Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <ProviderAvatar name={connection.institutionName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-neutral-900 truncate">
              {connection.institutionName}
            </h4>
            <StatusBadge status={connection.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
              <Calendar className="h-3 w-3" />
              <span>Linked {formatWhen(connection.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
              <History className="h-3 w-3" />
              <span>Synced {formatWhen(connection.syncedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Actions */}
      <div className="flex items-center justify-between border-t border-neutral-50 pt-3 sm:border-none sm:pt-0 sm:justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50/50"
          onClick={handleRemove}
          disabled={removing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Remove
          </span>
        </Button>
      </div>
    </div>
  );
}
