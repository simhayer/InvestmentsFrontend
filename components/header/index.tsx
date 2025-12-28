"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  User,
  Search,
  X,
  Sparkles,
  Settings,
} from "lucide-react";
import { CommandSearch } from "./command-search";
import { useAuth } from "@/lib/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NAV_ITEMS_AUTHED,
  NAV_ITEMS_PUBLIC,
  type NavItem,
} from "../navigation/nav-items";
import { useAppTour } from "@/components/tour/app-tour";
import { logout } from "@/utils/authService";

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const { user, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { start: startTour } = useAppTour();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileSearch, setMobileSearch] = React.useState(false);
  const handleMobileSearchSelect = React.useCallback(
    (r: { symbol: string }) => {
      router.push(`/investment/${encodeURIComponent(r.symbol)}`);
      setMobileNavOpen(false);
      setMobileSearch(false);
    },
    [router]
  );

  // Close mobile sheet when viewport reaches desktop
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if ("matches" in e ? e.matches : (e as MediaQueryList).matches) {
        setMobileNavOpen(false);
        setMobileSearch(false);
      }
    };
    handler(mq); // initial sync
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const navItems: NavItem[] = user ? NAV_ITEMS_AUTHED : NAV_ITEMS_PUBLIC;
  const loginHref = `/login?next=${encodeURIComponent(
    pathname || "/dashboard"
  )}`;

  const handleLogout = React.useCallback(async () => {
    try {
      await logout();
    } catch {
      // ignore
    }

    refresh(); // optional, keeps your UI in sync
    router.replace("/login");
  }, [refresh, router]);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div
        className="w-full mx-auto max-w-[1340px] px-3 sm:px-4 md:px-6 lg:px-8"
        data-tour-id="tour-global-nav"
      >
        <div className="flex items-center h-16 gap-3">
          {/* Left brand */}
          <span className='text-2xl font-bold font-["Libre_Caslon_Text",_serif] text-zinc-900 leading-none'>
            W
          </span>

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-start gap-1 text-sm text-neutral-700">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative inline-flex items-center px-2.5 py-1 whitespace-nowrap transition"
                  data-tour-id={
                    item.href === "/dashboard/market" || item.href === "/market"
                      ? "tour-market-nav"
                      : undefined
                  }
                >
                  <span
                    className={[
                      "relative z-10 transition",
                      active
                        ? 'text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif]'
                        : "text-neutral-600 group-hover:text-neutral-900",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                  {active && (
                    <span className="pointer-events-none absolute left-1 right-1 -bottom-[6px] h-[2px] rounded-full bg-neutral-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 ml-auto min-w-0 w-full md:w-auto justify-end">
            {/* Desktop search */}
            <div className="hidden md:block w-full md:w-auto md:min-w-[260px] md:max-w-xl">
              <CommandSearch
                placeholder="Search name or symbol"
                className="w-full"
              />
            </div>

            {/* Mobile search icon */}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-neutral-200 hover:shadow-sm transition lg:hidden"
              aria-label="Search"
              onClick={() => {
                setMobileSearch(true);
                setMobileNavOpen(true);
              }}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Account dropdown (desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden md:inline-flex h-11 items-center justify-center rounded-full bg-white text-neutral-700 px-3 gap-1.5 ring-1 ring-neutral-200 hover:shadow-sm transition"
                  aria-label={user ? "Account" : "Sign in"}
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="opacity-100">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs text-neutral-500">
                          Signed in as
                        </span>
                        <span className="text-sm text-neutral-800">
                          {user.email || "User"}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        startTour();
                      }}
                      className="cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      Help / Tour
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href={loginHref} className="cursor-pointer">
                      Sign in
                    </Link>
                  </DropdownMenuItem>
                )}
                {user && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      router.push("/settings");
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet
              open={mobileNavOpen}
              onOpenChange={(v) => {
                setMobileNavOpen(v);
                if (!v) setMobileSearch(false);
              }}
            >
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-neutral-200 hover:shadow-sm transition lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                noAnimation
                hideClose
                className="lg:hidden left-0 w-full max-w-none h-screen overflow-hidden border-l border-neutral-100/80 bg-white/95 px-5 pb-7 pt-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-md data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="flex h-full flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className='text-2xl font-bold font-["Libre_Caslon_Text",_serif] text-zinc-900 leading-none'>
                        W
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          Menu
                        </span>
                        <span className="text-sm text-neutral-800">
                          Navigation
                        </span>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                        aria-label="Close navigation"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </SheetClose>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      Search name or symbol
                    </p>
                    <CommandSearch
                      placeholder="Search name or symbol"
                      className="w-full bg-neutral-50/70"
                      onSelect={handleMobileSearchSelect}
                      autoFocus={mobileSearch}
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        Navigate
                      </p>
                      <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-neutral-50/60 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                        {navItems.map((item) => {
                          const active = isActive(
                            pathname,
                            item.href,
                            item.exact
                          );
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={[
                                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                                  active
                                    ? "bg-white text-neutral-900 shadow-[0_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200"
                                    : "text-neutral-700 hover:bg-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.05)] hover:ring-1 hover:ring-neutral-100",
                                ].join(" ")}
                                data-tour-id={
                                  item.href === "/dashboard/market" ||
                                  item.href === "/market"
                                    ? "tour-market-nav"
                                    : undefined
                                }
                              >
                                <span
                                  className={[
                                    "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition",
                                    active
                                      ? "bg-neutral-900"
                                      : "bg-transparent",
                                  ].join(" ")}
                                  aria-hidden
                                />
                                <div
                                  className={[
                                    "flex h-10 w-10 items-center justify-center rounded-full border transition",
                                    active
                                      ? "border-neutral-200 bg-neutral-900/5 text-neutral-900"
                                      : "border-transparent bg-white text-neutral-600 group-hover:border-neutral-200 group-hover:bg-neutral-50",
                                  ].join(" ")}
                                >
                                  {Icon ? (
                                    <Icon className="h-4 w-4" />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full bg-neutral-300" />
                                  )}
                                </div>
                                <span className="flex-1 text-[15px]">
                                  {item.name}
                                </span>
                                <span
                                  className={[
                                    "h-2 w-2 rounded-full transition",
                                    active
                                      ? "bg-neutral-900"
                                      : "bg-neutral-300 group-hover:bg-neutral-400",
                                  ].join(" ")}
                                  aria-hidden
                                />
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-4">
                    <button
                      onClick={() => {
                        startTour();
                        setMobileNavOpen(false);
                      }}
                      className="mb-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)] active:translate-y-0"
                    >
                      <Sparkles className="h-4 w-4" />
                      Take a tour
                    </button>
                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            setMobileNavOpen(false);
                            router.push("/settings");
                          }}
                          className="mb-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)] active:translate-y-0"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)] active:translate-y-0"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href={loginHref}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)] active:translate-y-0"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
