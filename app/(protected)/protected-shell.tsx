"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { Header } from "@/components/header";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { cn } from "@/lib/utils";
import { getOnboarding } from "@/utils/onboardingService";

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, sessionReady, hasSession } = useAuth();

  const [gateReady, setGateReady] = React.useState(false);
  const hideHeader = pathname.startsWith("/onboarding");

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

    let cancelled = false;

    async function run() {
      try {
        setGateReady(false);

        const data = await getOnboarding();
        const completed = !!data.completed;
        const isOnboardingRoute = pathname.startsWith("/onboarding");

        if (!completed && !isOnboardingRoute) {
          router.replace("/onboarding");
          return;
        }

        if (completed && isOnboardingRoute) {
          router.replace("/dashboard");
          return;
        }

        if (!cancelled) setGateReady(true);
      } catch {
        // If onboarding fetch fails, do not brick the app
        if (!cancelled) setGateReady(true);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isLoading, hasSession, pathname, router]);

  if (!sessionReady || isLoading || !hasSession || !gateReady) {
    return null;
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
        <ChatLauncher />
      </div>
    </div>
  );
}
