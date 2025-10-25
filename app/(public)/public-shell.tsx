// app/(public)/public-shell.tsx
"use client";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthProvider } from "@/lib/auth-provider";
import * as React from "react";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar
          user={undefined}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex flex-col min-h-screen">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-2">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
