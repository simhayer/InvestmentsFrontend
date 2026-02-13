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
  CreditCard,
  LayoutDashboard,
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
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NAV_ITEMS_AUTHED,
  NAV_ITEMS_PUBLIC,
  type NavItem,
} from "../navigation/nav-items";
import { logout } from "@/utils/authService";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const navItems: NavItem[] = user ? NAV_ITEMS_AUTHED : NAV_ITEMS_PUBLIC;

  const handleLogout = async () => {
    try {
      await logout();
      refresh();
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 font-serif text-xl font-bold text-white transition-transform group-hover:scale-105">
                W
              </div>
              <span className="hidden font-bold tracking-tight text-neutral-900 md:block">
                WallStreetAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isExact = item.exact ?? false;

                const active = isExact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                      active
                        ? "text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    {item.name}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[17px] h-0.5 bg-neutral-900" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Search & Actions */}
          <div className="flex flex-1 items-center justify-end gap-3 max-w-xl">
            <div className="hidden md:block w-full max-w-sm">
              <CommandSearch />
            </div>

            {/* Mobile Search Trigger */}
            <button
              className="md:hidden p-2 text-neutral-500"
              onClick={() => setMobileNavOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white pl-1 pr-2.5 py-1 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 rounded-2xl p-2 shadow-2xl ring-1 ring-black/5"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-normal text-neutral-500">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-1" />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="rounded-lg gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="rounded-lg gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/pricing")}
                    className="rounded-lg gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" /> Pricing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg gap-2 cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 text-neutral-600">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0">
                <div className="flex flex-col h-full bg-white p-6">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-2xl font-bold">W</span>
                    <SheetClose className="p-2">
                      <X className="h-6 w-6" />
                    </SheetClose>
                  </div>
                  <div className="mb-6">
                    <CommandSearch />
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="flex items-center px-4 py-4 rounded-xl text-lg font-medium hover:bg-neutral-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
