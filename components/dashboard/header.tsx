"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Plus, RefreshCw, Menu } from "lucide-react";
import { PlaidLinkButton } from "@/components/plaid/plaid-link-button";
import { User } from "@/types/user";

interface Props {
  user: User;
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onAddClick: () => void;
  onPlaidLinkSuccess: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export function DashboardHeader({
  user,
  refreshing,
  onRefresh,
  onLogout,
  onAddClick,
  onPlaidLinkSuccess,
  setSidebarOpen,
}: Props) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0">
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
          <div>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <PlaidLinkButton userId={user.id} onSuccess={onPlaidLinkSuccess} />
            <Button onClick={onRefresh} disabled={refreshing} variant="outline">
              <RefreshCw
                className={`h-4 w-4 mr-1 ${
                  refreshing ? "animate-spin" : "hidden"
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh Prices"}
            </Button>
            <Button onClick={onAddClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Investment
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
