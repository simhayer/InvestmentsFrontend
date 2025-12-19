// app/(protected)/protected-client-shell.tsx  (Client component)
"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { AppTourProvider } from "@/components/tour/app-tour";

export function ProtectedClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppTourProvider>
      <div
        className="min-h-screen bg-background text-foreground
                      overflow-x-hidden"
      >
        <div className="min-h-screen flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-2 min-w-0 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AppTourProvider>
  );
}
