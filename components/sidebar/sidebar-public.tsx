// components/sidebar-public.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Home } from "lucide-react";
import darkLogo from "@/public/logo-full-dark-nobg.png";

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const NAV_PUBLIC = [{ name: "Market Overview", href: "/market", icon: Home }];

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function SidebarPublic({ sidebarOpen, setSidebarOpen }: Props) {
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(
    pathname || "/dashboard"
  )}`;

  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="p-4 space-y-2">
      <div className="mb-6 flex items-center gap-2">
        <Image
          src={darkLogo}
          alt="Logo"
          height={32}
          priority
          className="block"
        />
      </div>

      {NAV_PUBLIC.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onItemClick?.()}
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
    </nav>
  );

  const LoginBlock = ({ onAction }: { onAction?: () => void }) => (
    <div className="mt-auto p-4 border-t border-border">
      <div className="rounded-xl border p-3 text-sm bg-muted">
        <div className="font-medium mb-1">Unlock your dashboard</div>
        <p className="text-muted-foreground mb-2">
          Sign in to access portfolio, analytics, and alerts.
        </p>
        <Link
          href={loginHref}
          onClick={() => onAction?.()}
          className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    </div>
  );

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

          <NavList onItemClick={() => setSidebarOpen(false)} />
          <LoginBlock onAction={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r flex flex-col justify-between">
          <div>
            <NavList />
          </div>
          <div className="border-t">
            <LoginBlock />
          </div>
        </div>
      </aside>
    </>
  );
}
