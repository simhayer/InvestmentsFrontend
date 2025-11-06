// app/(protected)/protected-client-shell.tsx  (Client component)
"use client";

import * as React from "react";
import SidebarAuthed from "@/components/sidebar/sidebar-authed";
import { Header } from "@/components/header";

export function ProtectedClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div
      className="min-h-screen bg-background text-foreground
                    overflow-x-hidden                         {/* guard */}
                    lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      <SidebarAuthed
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* RIGHT COLUMN */}
      <div className="min-h-screen flex flex-col min-w-0">
        {/* 👈 allow shrink */}
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-2 min-w-0 overflow-x-hidden">{children}</main>
        {/* 👈 */}
      </div>
    </div>
  );
}
