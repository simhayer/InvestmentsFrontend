"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/authService";

interface Props {
  user: User;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ user, setSidebarOpen }: Props) {
  const router = useRouter();
  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/landing");
    }
  };

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
          <div>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
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
