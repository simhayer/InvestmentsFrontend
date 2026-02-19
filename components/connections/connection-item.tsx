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
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Connection, ConnectionStatus } from "@/types/connection";

import ProviderAvatar from "@/components/layout/ProviderAvatar";

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

/* --------------- component --------------- */

type ConnectionItemProps = {
  connection: Connection;
  onRemove?: (id: string) => void;
  onReauth?: (id: string) => void;
};

export function ConnectionItem({
  connection,
  onRemove,
  onReauth,
}: ConnectionItemProps) {
  const [removing, setRemoving] = React.useState(false);
  const [reauthenticating, setReauthenticating] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleConfirmedRemove = async () => {
    if (!onRemove) return;
    setRemoving(true);
    try {
      await onRemove(connection.id);
    } finally {
      setRemoving(false);
    }
  };

  const handleReauth = async () => {
    if (!onReauth) return;
    setReauthenticating(true);
    try {
      await onReauth(connection.id);
    } finally {
      setReauthenticating(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col gap-4 rounded-[24px] border border-neutral-200/60 bg-white p-5 transition-all duration-300",
          "hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40 sm:flex-row sm:items-center",
          removing && "opacity-50 grayscale pointer-events-none"
        )}
      >
        {/* 1. Logo & Basic Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <ProviderAvatar
            name={connection.institutionName}
            className="h-10 w-10 [&_.status-dot]:h-2 [&_.status-dot]:w-2"
          />

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
          {connection.status === "error" && onReauth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50/50"
              onClick={(e) => {
                e.stopPropagation();
                handleReauth();
              }}
              disabled={reauthenticating}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {reauthenticating ? "Loading..." : "Re-auth"}
              </span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50/50"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            disabled={removing || !onRemove}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Remove
            </span>
          </Button>
        </div>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Disconnect {connection.institutionName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                This will permanently remove the connection and{" "}
                <span className="font-semibold text-neutral-700">
                  all holdings synced from {connection.institutionName}
                </span>{" "}
                will be deleted from your portfolio.
              </span>
              <span className="block text-xs text-rose-600 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedRemove}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove connection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
