// app/(protected)/protected-shell.tsx
"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function ProtectedShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: any;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen flex flex-col">
        <Header user={user} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-2">{children}</main>
      </div>
    </div>
  );
}
