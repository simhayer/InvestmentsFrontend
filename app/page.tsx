"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export default function Home() {
  const router = useRouter();
  const { sessionReady, hasSession } = useAuth();

  useEffect(() => {
    if (!sessionReady) return;
    router.replace(hasSession ? "/dashboard" : "/landing");
  }, [sessionReady, hasSession, router]);

  return null;
}
