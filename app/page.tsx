// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/utils/authService";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const me = await getMe();
      router.replace(me ? "/dashboard" : "/landing");
    })();
  }, [router]);

  return null; // or a loading splash
}
