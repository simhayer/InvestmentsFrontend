// app/holdings/HoldingsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/utils/authService";
import { Holdings } from "@/components/holdings";
import { User } from "@/types/user";

export default function HoldingsClient({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logout();
    } finally {
      router.replace("/landing");
    }
  };

  return <Holdings user={user} />;
}
