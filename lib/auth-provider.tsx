"use client";

import useSWR from "swr";
import React, { createContext, useContext } from "react";
import type { AppUser } from "@/types/user";
import { getAppMe, logout } from "@/utils/authService";
import { supabase } from "@/utils/supabaseClient";
import { analytics } from "@/lib/posthog";
import type { Session } from "@supabase/supabase-js";

function isSessionExpired(session: Session | null): boolean {
  if (!session?.expires_at) return true;
  return Date.now() / 1000 >= session.expires_at;
}

type AuthContextValue = {
  user: AppUser | null;
  session: Session | null; // <-- NEW
  accessToken: string | null; // <-- NEW (convenient)=
  sessionReady: boolean;
  hasSession: boolean;
  isLoading: boolean;

  refresh: () => void;
  onLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  accessToken: null,
  sessionReady: false,
  hasSession: false,
  isLoading: true,
  refresh: () => {},
  onLogout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>(null);

  const hasSession = !!session;

  // 1) Track Supabase session reliably, with hard expiry (no auto-refresh)
  React.useEffect(() => {
    let mounted = true;
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    const handleSession = (nextSession: Session | null) => {
      if (!mounted) return;
      if (expiryTimer) clearTimeout(expiryTimer);

      if (nextSession && isSessionExpired(nextSession)) {
        supabase.auth.signOut();
        setSession(null);
        setSessionReady(true);
        return;
      }

      setSession(nextSession);
      setSessionReady(true);

      if (nextSession?.expires_at) {
        const msUntilExpiry = nextSession.expires_at * 1000 - Date.now();
        if (msUntilExpiry > 0) {
          expiryTimer = setTimeout(() => {
            supabase.auth.signOut();
            setSession(null);
          }, msUntilExpiry);
        }
      }
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      handleSession(data.session ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        handleSession(nextSession ?? null);
      }
    );

    return () => {
      mounted = false;
      if (expiryTimer) clearTimeout(expiryTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) Only call /me when session exists
  const swrKey = sessionReady && hasSession ? "app:/me" : null;

  const { data, isLoading, mutate } = useSWR<{ user: AppUser | null }>(
    swrKey,
    async () => {
      const appMe = await getAppMe();
      return { user: appMe };
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 15_000,
    }
  );

  const user = hasSession ? data?.user ?? null : null;

  const refresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const onLogout = React.useCallback(async () => {
    try {
      await logout();
    } catch {}
    analytics.capture("logged_out");
    analytics.reset();
    setSession(null);
    await mutate({ user: null }, false);
  }, [mutate]);

  const accessToken = session?.access_token ?? null;

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      accessToken,
      sessionReady,
      hasSession,
      isLoading: !sessionReady || (hasSession && isLoading),
      refresh,
      onLogout,
    }),
    [
      user,
      session,
      accessToken,
      sessionReady,
      hasSession,
      isLoading,
      refresh,
      onLogout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
