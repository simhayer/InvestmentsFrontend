"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/authService";
import { CommandSearch } from "./command-search";

interface Props {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: Props) {
  const router = useRouter();

  return (
    <header className="bg-background shadow-sm border-b sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="w-full flex justify-center lg:mr-16 z-50 relative ">
            {/* <SearchBar
              onSelect={(symbol) => {
                console.log("Selected:", symbol);
                // e.g. router.push(`/symbol/${symbol.symbol}`)
              }}
            /> */}
            <CommandSearch />
          </div>
          {/* <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div> */}
        </div>
      </div>
    </header>
  );
}
