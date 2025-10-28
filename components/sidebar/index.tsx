// components/sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import {
  X,
  Home,
  BarChart3,
  Link2,
  BarChart2,
  Lock,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import Image from "next/image";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user?: never; // force consumers to not pass user; we read from context
};

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  public?: boolean;
  disabledWhenLoggedOut?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Market Overview", href: "/market", icon: Home, public: true },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    disabledWhenLoggedOut: true,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    disabledWhenLoggedOut: true,
  },
  {
    name: "Holdings",
    href: "/holdings",
    icon: BarChart2,
    disabledWhenLoggedOut: true,
  },
  {
    name: "Connections",
    href: "/connections",
    icon: Link2,
    disabledWhenLoggedOut: true,
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, refresh } = useAuth();
  console.log("Sidebar user:", user);

  const isAuthed = Boolean(user?.id);

  const itemsWithActive = useMemo(
    () =>
      NAV_ITEMS.filter((i) => i.public || isAuthed).map((item) => {
        const active =
          pathname === item.href ||
          (pathname?.startsWith(item.href + "/") ?? false);
        const locked = !isAuthed && item.disabledWhenLoggedOut;
        return { ...item, active, locked };
      }),
    [pathname, isAuthed]
  );

  const renderLinkClass = (active: boolean, locked?: boolean) =>
    cx(
      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      locked
        ? "opacity-60 cursor-not-allowed"
        : active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  const loginHref = (to: string) => `/login?next=${encodeURIComponent(to)}`;

  const handleLogout = async () => {
    // call backend logout to clear httpOnly cookie
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    // refresh auth state everywhere
    refresh();
    router.push("/login");
  };

  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex flex-col flex-1 px-4 py-4">
      <ul className="space-y-2 flex-1">
        {itemsWithActive.map((item) => (
          <li key={item.name}>
            <Link
              href={item.locked ? loginHref(item.href) : item.href}
              aria-current={item.active ? "page" : undefined}
              onClick={() => onItemClick?.()}
              className={renderLinkClass(item.active, item.locked)}
              title={item.locked ? "Sign in to access" : item.name}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.locked && (
                <Lock className="ml-auto h-3.5 w-3.5 opacity-70" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {isLoading ? (
        <div className="mt-4 rounded-xl border p-3 text-sm bg-muted animate-pulse">
          <div className="h-4 w-1/2 bg-foreground/20 rounded mb-2" />
          <div className="h-6 w-2/3 bg-foreground/10 rounded" />
        </div>
      ) : isAuthed ? (
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full mt-4 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      ) : (
        <div className="mt-4 rounded-xl border p-3 text-sm bg-muted">
          <div className="font-medium mb-1">Unlock your dashboard</div>
          <p className="text-muted-foreground mb-2">
            Sign in to see your portfolio, analytics, and alerts.
          </p>
          <Link
            href={loginHref(pathname || "/dashboard")}
            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );

  return (
    <div>
      {/* Mobile sidebar */}
      <div
        className={cx(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <img
                src="/logo-full-dark-nobg.png"
                alt="AI Investments Logo"
                className="h-6 w-6"
              />
              <span className="font-mono text-lg font-bold">
                AI Investments
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <NavList onItemClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex h-full flex-col bg-card border-r border-border">
          <div className="flex h-16 items-center px-4">
            <div className="flex mt-4">
              <Image
                src="/logo-full-dark-nobg.png"
                alt="AI Investments Logo"
                width={200}
                height={60}
                className="block dark:hidden"
                priority
              />
              <Image
                src="/logo-full-light-nobg.png"
                alt="AI Investments Logo"
                width={200}
                height={60}
                className="hidden dark:block"
                priority
              />
            </div>
          </div>
          <NavList />
        </div>
      </div>
    </div>
  );
}
