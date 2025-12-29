"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { NAV_ITEMS_PUBLIC } from "../navigation/nav-items";
import { cn } from "@/lib/utils";

export default function SidebarPublic({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
}) {
  const pathname = usePathname();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold italic">
          W
        </div>
        <span className="font-bold tracking-tight">WealthAI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS_PUBLIC.map((item) => {
          const active = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                active
                  ? "bg-white dark:bg-neutral-900 text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {IconComponent && <IconComponent className="h-5 w-5" />}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Upsell Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <Sparkles className="absolute -top-2 -right-2 h-16 w-16 opacity-20" />
        <p className="relative z-10 text-sm font-bold">Ready to scale?</p>
        <p className="relative z-10 mt-1 text-xs text-indigo-100 opacity-80">
          Join 10k+ investors today.
        </p>
        <Link
          href="/register"
          className="relative z-10 mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-white py-2 text-xs font-bold text-indigo-600 hover:bg-neutral-50 transition-colors"
        >
          Get Started <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity",
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-neutral-900/20 backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-80 transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {SidebarContent}
        </aside>
      </div>

      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-neutral-100 bg-neutral-50">
        {SidebarContent}
      </aside>
    </>
  );
}
