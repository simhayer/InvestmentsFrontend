// app/(public)/public-shell.tsx
"use client";

import * as React from "react";
import { Header } from "@/components/header";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 p-2">{children}</main>
    </div>
  );
}
