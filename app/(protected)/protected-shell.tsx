"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { ProtectedClientShell } from "./protected-client-shell";

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, sessionReady, hasSession } = useAuth();

  React.useEffect(() => {
    if (sessionReady && !hasSession) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [sessionReady, hasSession, router, pathname]);

  if (!sessionReady || isLoading || !hasSession) {
    // You can return a loading spinner or null while checking auth status
    return null;
  }

  return <ProtectedClientShell>{children}</ProtectedClientShell>;
}
