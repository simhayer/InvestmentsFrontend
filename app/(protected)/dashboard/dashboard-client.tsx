// app/dashboard/DashboardClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/utils/authService";
import { Dashboard } from "@/components/dashboard";
import { User } from "@/types/user";

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logout();
    } finally {
      router.replace("/landing");
    }
  };

  return <Dashboard user={user} />;
}
