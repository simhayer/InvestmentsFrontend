// app/(public)/public-shell.tsx
"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { AppTourProvider } from "@/components/tour/app-tour";
import { cn } from "@/lib/utils";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppTourProvider>
      <div
        className={cn(
          "min-h-screen w-full overflow-x-hidden",
          "bg-[#f6f7f8] text-neutral-900"
        )}
      >
        <div className="min-h-screen flex flex-col min-w-0">
          <Header />

          <main className="flex-1 min-w-0 overflow-x-hidden">
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppTourProvider>
  );
}
