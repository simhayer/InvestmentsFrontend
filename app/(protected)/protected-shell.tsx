"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { getOnboarding } from "@/utils/onboardingService";
import { ChatPanel } from "@/components/chat/ChatPanel";

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, sessionReady, hasSession } = useAuth();

  const [gateReady, setGateReady] = React.useState(false);
  const hideHeader = pathname.startsWith("/onboarding");

  // Dedup ref — once onboarding has been checked, don't unmount children again
  const onboardingCheckedRef = React.useRef(false);

  // Auth gate
  React.useEffect(() => {
    if (!sessionReady || isLoading) return;
    if (!hasSession) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [sessionReady, isLoading, hasSession, router, pathname]);

  // Onboarding gate
  React.useEffect(() => {
    if (!sessionReady || isLoading) return;
    if (!hasSession) return;

    // If we've already resolved the gate, don't reset it — prevents
    // unmounting children on auth state transitions.
    if (onboardingCheckedRef.current) return;

    let cancelled = false;

    async function run() {
      try {
        const data = await getOnboarding();
        const completed = !!data.completed;
        const isOnboardingRoute = pathname.startsWith("/onboarding");

        if (cancelled) return;

        if (!completed && !isOnboardingRoute) {
          router.replace("/onboarding");
          return;
        }

        if (completed && isOnboardingRoute) {
          router.replace("/dashboard");
          return;
        }

        onboardingCheckedRef.current = true;
        setGateReady(true);
      } catch {
        // If onboarding fetch fails, do not brick the app
        if (!cancelled) {
          onboardingCheckedRef.current = true;
          setGateReady(true);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isLoading, hasSession, pathname, router]);

  if (!sessionReady || isLoading || !hasSession || !gateReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
        <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full overflow-x-hidden",
        "bg-[#f6f7f8] text-neutral-900"
      )}
    >
      <div className="min-h-screen flex flex-col min-w-0">
        {!hideHeader && <Header />}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6">
            {children}
          </div>
        </main>
        {/* <ChatPanel /> */}
      </div>
    </div>
  );
}
