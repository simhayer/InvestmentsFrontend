// app/(protected)/layout.tsx
"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import ProtectedShell from "./protected-shell";
import type { User } from "@/types/user";
import { getMe } from "@/utils/authService";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const me = await getMe();
      if (!me) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setUser(me);
      setLoading(false);
    })();
  }, [router, pathname]);

  if (loading || !user) return null; // or spinner/skeleton

  return <ProtectedShell user={user}>{children}</ProtectedShell>;
}
