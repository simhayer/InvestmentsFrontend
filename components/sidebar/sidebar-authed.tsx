// components/sidebar-authed.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import darkLogo from "@/public/logo-full-dark-nobg.png";
import lightLogo from "@/public/logo-full-light-nobg.png";
import { NAV_ITEMS_AUTHED } from "../navigation/nav-items";

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

function NavList({
  pathname,
  onItemClick,
}: {
  pathname: string | null;
  onItemClick?: () => void;
}) {
  return (
    <nav className="p-4 space-y-2">
      <div className="pt-4 space-y-1">
        {NAV_ITEMS_AUTHED.map((item) => {
          const active = isActive(pathname, item.href, (item as any).exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onItemClick?.()}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarAuthedImpl({ sidebarOpen, setSidebarOpen }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user, refresh } = useAuth();

  const handleLogout = React.useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    refresh(); // refresh SWR auth cache
    router.replace("/login"); // navigate away (no router.refresh to avoid extra render)
  }, [refresh, router]);

  return (
    <>
      {/* Mobile sidebar (overlay drawer) */}
      <div
        className={cx(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <aside
          className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <button
              aria-label="Close sidebar"
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button className="mb-6 flex items-center gap-2">
            {/* Show in light mode */}
            <Image
              src={darkLogo}
              alt="Logo"
              height={32}
              priority
              className="block dark:hidden"
            />
            {/* Show in dark mode */}
            <Image
              src={lightLogo}
              alt="Logo"
              height={32}
              priority
              className="hidden dark:block"
            />
          </button>

          <NavList
            pathname={pathname}
            onItemClick={() => setSidebarOpen(false)}
          />

          <div className="mt-auto p-4">
            {isLoading ? (
              <div className="rounded-xl border p-3 text-sm bg-muted animate-pulse">
                <div className="h-4 w-1/2 bg-foreground/20 rounded mb-2" />
                <div className="h-6 w-2/3 bg-foreground/10 rounded" />
              </div>
            ) : user ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 border-r bg-card">
        <NavList pathname={pathname} />
        <div className="p-4">
          {isLoading ? (
            <div className="rounded-xl border p-3 text-sm bg-muted animate-pulse">
              <div className="h-4 w-1/2 bg-foreground/20 rounded mb-2" />
              <div className="h-6 w-2/3 bg-foreground/10 rounded" />
            </div>
          ) : user ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

// Reduce re-renders if parent is memoized/stable props
export default React.memo(SidebarAuthedImpl);
