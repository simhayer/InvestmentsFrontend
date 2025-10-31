// app/(public)/public-shell.tsx
"use client";

import * as React from "react";
import SidebarPublic from "@/components/sidebar/sidebar-public";
import { Header } from "@/components/header";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[16rem_1fr]">
      <SidebarPublic
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-col min-h-screen">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-2">{children}</main>
      </div>
    </div>
  );
}
