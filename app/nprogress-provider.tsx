"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Optional: customize speed / appearance
NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

export function NProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start when route starts changing
    NProgress.start();

    // Simulate network delay for smoothness
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]); // triggers on every route or query param change

  return null;
}
