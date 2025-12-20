"use client";

import useSWR from "swr";
import React, { createContext, useContext } from "react";
import type { AppUser } from "@/types/user";
import { getAppMe, logout } from "@/utils/authService";
import { supabase } from "@/utils/supabaseClient";

type AuthContextValue = {
  user: AppUser | null;
  sessionReady: boolean; // <-- NEW
  hasSession: boolean; // <-- NEW
  isLoading: boolean;
  refresh: () => void;
  onLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  sessionReady: false,
  hasSession: false,
  isLoading: true,
  refresh: () => {},
  onLogout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionReady, setSessionReady] = React.useState(false);
  const [hasSession, setHasSession] = React.useState(false);

  // 1) Track Supabase session reliably
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session);
      setSessionReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
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

  // If there is no session, force user = null
  const user = hasSession ? data?.user ?? null : null;

  const refresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const onLogout = React.useCallback(async () => {
    try {
      await logout();
    } catch {}
    await mutate({ user: null }, false);
  }, [mutate]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      sessionReady,
      hasSession,
      isLoading: !sessionReady || (hasSession && isLoading),
      refresh,
      onLogout,
    }),
    [user, sessionReady, hasSession, isLoading, refresh, onLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
