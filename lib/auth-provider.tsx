"use client";

import useSWR from "swr";
import React, { createContext, useContext } from "react";
import type { User } from "@/types/user";
import { getMe, logout } from "@/utils/authService";
import { supabase } from "@/utils/supabaseClient";

export const AUTH_SWR_KEY = "auth:/me";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  refresh: () => void;
  onLogin: (user?: User) => Promise<void>;
  onLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: () => {},
  onLogin: async () => {},
  onLogout: async () => {},
});

const fetcher = async (): Promise<{ user: User | null }> => {
  try {
    const me = await getMe();
    return { user: (me as User | null) ?? null };
  } catch {
    return { user: null };
  }
};

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser?: User | null;
  children: React.ReactNode;
}) {
  const { data, isLoading, mutate } = useSWR<{ user: User | null }>(
    AUTH_SWR_KEY,
    fetcher,
    {
      fallbackData: { user: initialUser ?? null },
      revalidateOnMount: initialUser == null,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      dedupingInterval: 15_000,
    }
  );

  // Keep SWR synced with Supabase session changes (refresh, multi-tab, etc.)
  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void mutate();
    });
    return () => sub.subscription.unsubscribe();
  }, [mutate]);

  const refresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const onLogin = React.useCallback(
    async (user?: User) => {
      if (user) await mutate({ user }, false);
      await mutate();
    },
    [mutate]
  );

  const onLogout = React.useCallback(async () => {
    try {
      await logout(); // supabase signOut
    } catch {
      // ignore
    }
    await mutate({ user: null }, false);
    await mutate();
  }, [mutate]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? null,
      isLoading,
      refresh,
      onLogin,
      onLogout,
    }),
    [data?.user, isLoading, refresh, onLogin, onLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
