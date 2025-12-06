"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, User, Search, X } from "lucide-react";
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
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileSearch, setMobileSearch] = React.useState(false);

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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    refresh();
    router.replace("/login");
  }, [refresh, router]);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="w-full mx-auto max-w-[1340px] px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">
          {/* Left brand */}
          <span className='text-2xl font-bold font-["Libre_Caslon_Text",_serif] text-zinc-900 leading-none'>
            W
          </span>

          {/* Desktop nav */}
          <nav className='hidden lg:flex flex-1 items-center justify-start gap-1 text-sm text-neutral-700 font-["Futura_PT_Book",_Futura,_sans-serif]'>
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative inline-flex items-center px-2.5 py-1 whitespace-nowrap transition"
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
                side="top"
                noAnimation
                hideClose
                className="w-full max-w-full h-screen overflow-y-auto bg-white px-4 pb-6 pt-4 animate-none data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <CommandSearch
                      placeholder="Search name or symbol"
                      className="w-full"
                      autoFocus={mobileSearch}
                    />
                  </div>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="header-sheet-close inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-700 hover:bg-neutral-100 transition"
                      aria-label="Close navigation"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </SheetClose>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={[
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                            active
                              ? "bg-neutral-100 text-zinc-900"
                              : "text-neutral-700 hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          <span>{item.name}</span>
                          {active && (
                            <span className="h-[2px] w-6 rounded bg-zinc-900" />
                          )}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
                <div className="mt-6 space-y-3">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-800 hover:shadow-sm transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <Link
                      href={loginHref}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-800 hover:shadow-sm transition"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
