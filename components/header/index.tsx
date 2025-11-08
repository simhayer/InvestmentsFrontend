"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { CommandSearch } from "./command-search";

interface Props {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: Props) {
  return (
    // Lower z-index so sidebar (z-50 or above) overlays it
    <header className="bg-background shadow-sm border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] lg:grid-cols-[0_1fr_0] items-center h-16">
          {/* Left: Sidebar menu */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Search bar */}
          <div className="justify-self-center w-full max-w-md">
            <CommandSearch className="w-full" />
          </div>

          {/* Right: Spacer */}
          <div aria-hidden className="h-0" />
        </div>
      </div>
    </header>
  );
}
