// app/dashboard/ConnectionsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/utils/authService";
import { Connections } from "@/components/connections";
import { User } from "@/types/user";

export default function ConnectionsClient({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logout();
    } finally {
      router.replace("/landing");
    }
  };

  return <Connections user={user} onLogout={handleLogout} />;
}
