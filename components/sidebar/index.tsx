"use client";

import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import {
  X,
  Home,
  PieChart,
  BarChart3,
  Target,
  Upload,
  Link2,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Holdings", href: "/holdings", icon: BarChart2 },
  { name: "Connections", href: "/connections", icon: Link2 },
];

// simple class joiner
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useIsActive(href: string) {
  const pathname = usePathname();

  // exact match or nested route under href (e.g., /portfolio/123)
  const active =
    pathname === href || (pathname?.startsWith(href + "/") ?? false);

  return active;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();

  const itemsWithActive = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        active:
          pathname === item.href ||
          (pathname?.startsWith(item.href + "/") ?? false),
      })),
    [pathname]
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
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
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

          <nav className="px-4 py-4">
            <ul className="space-y-2">
              {itemsWithActive.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={item.active ? "page" : undefined}
                    className={cx(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex h-full flex-col bg-card border-r border-border">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-bold">
                AI Investments
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {itemsWithActive.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={cx(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
