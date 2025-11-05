// app/providers/auth-provider.tsx
"use client";

import useSWR, { mutate as globalMutate } from "swr";
import React, { createContext, useContext } from "react";
import type { User } from "@/types/user";
import { getMe } from "@/utils/authService";

export const AUTH_SWR_KEY = "auth:/me";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  refresh: () => void;
  onLogin: (user?: User) => Promise<void>; // call after successful login
  onLogout: () => Promise<void>; // call after successful logout
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
    const me = await getMe(); // should use credentials: "include" and handle non-200s
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
      // Hydrate from server to avoid "logged-out flash"
      fallbackData: { user: initialUser ?? null },
      // Only revalidate immediately if we *didn't* get initialUser from SSR
      revalidateOnMount: initialUser == null,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      // Optionally avoid rapid duplicate calls when multiple consumers mount
      dedupingInterval: 15_000,
    }
  );

  const refresh = React.useCallback(() => {
    void mutate(); // re-fetch /me
  }, [mutate]);

  // Call this after your login request succeeds (cookie set)
  const onLogin = React.useCallback(
    async (user?: User) => {
      if (user) {
        // Optimistic set, then confirm with network
        await mutate({ user }, false);
      }
      await mutate(); // ensure server truth wins
    },
    [mutate]
  );

  // Call this after your logout request succeeds (cookie cleared)
  const onLogout = React.useCallback(async () => {
    await mutate({ user: null }, false); // optimistic clear
    await mutate(); // confirm with server (should return null)
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
