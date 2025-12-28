"use client";

import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeDollarSign, Mail, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-provider";
import { updateCurrency } from "@/utils/userService";
import { Page } from "@/components/layout/Page";

type Currency = "USD" | "CAD";

export function Settings() {
  const { user, refresh } = useAuth() as any;
  const [savingCurrency, setSavingCurrency] = useState(false);

  const baseCurrency: Currency = (
    user?.base_currency === "CAD" ? "CAD" : "USD"
  ) as Currency;
  const isCAD = useMemo(() => baseCurrency === "CAD", [baseCurrency]);

  const onToggleCAD = useCallback(
    async (checked: boolean) => {
      if (!user) return;

      const next: Currency = checked ? "CAD" : "USD";
      if (next === baseCurrency) return;

      try {
        setSavingCurrency(true);
        await updateCurrency(next);
        await refresh();

        toast({
          title: "Preference updated",
          description: `Your display currency is now ${next}.`,
        });
      } catch (e: any) {
        console.error("Failed to update currency:", e);
        toast({
          variant: "destructive",
          title: "Couldn’t update currency",
          description: "Please try again in a moment.",
        });
      } finally {
        setSavingCurrency(false);
      }
    },
    [user, baseCurrency, updateCurrency, refresh]
  );

  return (
    <Page className="space-y-7 sm:space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
        <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
      </header>

      {/* Profile */}
      <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
        <CardHeader className="flex flex-col gap-3 border-b border-neutral-100/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
              Profile
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-7">
          {!user ? (
            <Skeleton className="h-14 w-full rounded-2xl" />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200 text-neutral-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-neutral-900">
                      Email
                    </p>
                    <p className="text-sm text-neutral-600">
                      {user.email || "Not available"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl border-neutral-200 bg-white px-4 text-neutral-800"
                  onClick={() => {
                    if (!user?.email) return;
                    navigator.clipboard
                      .writeText(user.email)
                      .then(() =>
                        toast({
                          title: "Copied",
                          description: "Email copied to clipboard.",
                        })
                      )
                      .catch(() =>
                        toast({
                          variant: "destructive",
                          title: "Couldn’t copy",
                          description: "Please copy it manually.",
                        })
                      );
                  }}
                  disabled={!user?.email}
                >
                  Copy
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50/70 px-4 py-3 text-xs text-neutral-600">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neutral-500" />
                  You’re signed in securely
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Currency */}
      <Card className="rounded-3xl border border-neutral-200/80 bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
        <CardHeader className="flex flex-col gap-3 border-b border-neutral-100/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
              Preferences
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-7">
          {!user ? (
            <Skeleton className="h-16 w-full rounded-2xl" />
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200 text-neutral-700">
                  <BadgeDollarSign className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-neutral-900">
                    Display Currency
                  </p>
                  <p className="text-sm text-neutral-600">
                    Currently:{" "}
                    <span className="font-semibold">{baseCurrency}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-xs font-semibold text-neutral-600">
                  {isCAD ? "CAD" : "USD"}
                </Label>
                <Switch
                  checked={isCAD}
                  onCheckedChange={onToggleCAD}
                  disabled={savingCurrency}
                />
              </div>
            </div>
          )}

          {user ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50/70 px-4 py-3 text-xs text-neutral-600">
              <span>Updates immediately across the app after refresh.</span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-neutral-200 bg-white px-3 text-neutral-800"
                disabled={savingCurrency}
                onClick={async () => {
                  const next: Currency = baseCurrency === "CAD" ? "USD" : "CAD";
                  await onToggleCAD(next === "CAD");
                }}
              >
                Switch to {baseCurrency === "CAD" ? "USD" : "CAD"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Page>
  );
}
