"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, LogOut, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import darkLogo from "@/public/logo-full-dark-nobg.png";
import lightLogo from "@/public/logo-full-light-nobg.png";
import { NAV_ITEMS_AUTHED } from "../navigation/nav-items";
import { logout } from "@/utils/authService";
import { cn } from "@/lib/utils";

export default function SidebarAuthed({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refresh, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    refresh();
    router.replace("/login");
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 px-4 py-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center font-serif text-white font-bold text-lg">
          W
        </div>
        <span className="font-bold tracking-tight text-neutral-900 dark:text-white">
          WealthAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS_AUTHED.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200 dark:shadow-none"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    active
                      ? "text-white"
                      : "text-neutral-400 group-hover:text-neutral-900"
                  )}
                />
              )}
              <span>{item.name}</span>
              {active && (
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Bottom Section */}
      <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
        {isLoading ? (
          <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
        ) : user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  Pro Account
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 transition-transform duration-300 ease-in-out shadow-2xl",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {SidebarContent}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-6 -right-12 p-2 text-white"
          >
            <X />
          </button>
        </aside>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 h-screen sticky top-0">
        {SidebarContent}
      </aside>
    </>
  );
}
