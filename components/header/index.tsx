"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
  Settings,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Crown,
} from "lucide-react";
import { CommandSearch } from "./command-search";
import { useAuth } from "@/lib/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NAV_ITEMS_AUTHED,
  NAV_ITEMS_PUBLIC,
  type NavItem,
} from "../navigation/nav-items";
import { logout } from "@/utils/authService";
import { cn } from "@/lib/utils";
import { WLogo } from "@/components/ui/w-logo";

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact
    ? pathname === href
    : pathname === href || pathname?.startsWith(href + "/");
}

export function Header() {
  const { user, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const navItems: NavItem[] = user ? NAV_ITEMS_AUTHED : NAV_ITEMS_PUBLIC;
  const plan = (user as any)?.plan ?? "free";

  const handleLogout = async () => {
    try {
      await logout();
      refresh();
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* ── Left: Logo + Desktop Nav ───────────────────────── */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <WLogo size={32} className="transition-transform group-hover:scale-105" />
                <span className="hidden font-bold tracking-tight text-neutral-900 sm:block text-sm">
                  WallStreetAI
                </span>
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden lg:flex items-center gap-0.5">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative px-3 py-1.5 text-[13px] font-medium transition-colors rounded-md",
                        active
                          ? "text-neutral-900"
                          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                      )}
                    >
                      {item.name}
                      {active && (
                        <span className="absolute inset-x-3 -bottom-[15px] h-[2px] bg-neutral-900 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ── Right: Search + User + Mobile triggers ─────────── */}
            <div className="flex items-center gap-2">
              {/* Desktop search */}
              <div className="hidden md:block w-72 lg:w-80">
                <CommandSearch />
              </div>

              {/* Mobile: search icon */}
              <button
                className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* User avatar / Auth buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 bg-white pl-0.5 pr-2 py-0.5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 mt-2 rounded-2xl p-1.5 shadow-2xl ring-1 ring-black/5"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-xs font-normal text-neutral-500 truncate">
                        {user.email}
                      </p>
                      {plan !== "free" && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                          <Crown className="h-2.5 w-2.5" />
                          {plan === "premium" ? "Plus" : "Pro"}
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-1" />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard")}
                      className="rounded-lg gap-2 cursor-pointer text-[13px]"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="rounded-lg gap-2 cursor-pointer text-[13px]"
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/pricing")}
                      className="rounded-lg gap-2 cursor-pointer text-[13px]"
                    >
                      <CreditCard className="h-4 w-4" /> Pricing
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer text-[13px]">
                      <a
                        href="mailto:support@wallstreetai.io?subject=WallStreetAI%20Support"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" /> Support
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg gap-2 cursor-pointer text-[13px] text-red-600"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex px-4 py-1.5 text-sm font-bold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile: hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE SEARCH SHEET
         ══════════════════════════════════════════════════════════════ */}
      <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <SheetContent side="top" className="p-0 h-auto rounded-b-2xl" hideClose>
          <SheetTitle className="sr-only">Search</SheetTitle>
          <div className="p-4">
            <CommandSearch />
          </div>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE NAV SHEET
         ══════════════════════════════════════════════════════════════ */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0" hideClose>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col h-full">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <Link
                href="/"
                onClick={closeMobileNav}
                className="flex items-center gap-2"
              >
                <WLogo size={28} />
                <span className="font-bold text-sm text-neutral-900">
                  WallStreetAI
                </span>
              </Link>
              <button
                onClick={closeMobileNav}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Search ─────────────────────────────────────────── */}
            <div className="px-4 py-3 border-b border-neutral-100">
              <CommandSearch />
            </div>

            {/* ── Navigation ─────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileNav}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-neutral-900" : "text-neutral-400"
                          )}
                        />
                      )}
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* ── Extra links ───────────────────────────────────── */}
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-0.5">
                <MobileNavLink
                  icon={Settings}
                  label="Settings"
                  href="/settings"
                  active={pathname === "/settings"}
                  onClick={closeMobileNav}
                />
                <MobileNavLink
                  icon={CreditCard}
                  label="Pricing"
                  href="/pricing"
                  active={pathname === "/pricing"}
                  onClick={closeMobileNav}
                />
                <a
                  href="mailto:support@wallstreetai.io?subject=WallStreetAI%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-neutral-400 shrink-0" />
                  Support
                </a>
              </div>
            </nav>

            {/* ── User footer ────────────────────────────────────── */}
            {user ? (
              <div className="border-t border-neutral-100 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          plan === "pro"
                            ? "bg-indigo-100 text-indigo-700"
                            : plan === "premium"
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-neutral-100 text-neutral-500"
                        )}
                      >
                        {plan === "pro"
                          ? "Pro"
                          : plan === "premium"
                          ? "Plus"
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeMobileNav();
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="border-t border-neutral-100 p-4 space-y-2">
                <Link
                  href="/register"
                  onClick={closeMobileNav}
                  className="flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  onClick={closeMobileNav}
                  className="flex w-full items-center justify-center rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ─── Mobile nav link helper ──────────────────────────────────────── */

function MobileNavLink({
  icon: Icon,
  label,
  href,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-neutral-900" : "text-neutral-400"
        )}
      />
      {label}
    </Link>
  );
}
