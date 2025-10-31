// app/providers/auth-provider.tsx
"use client";

import useSWR from "swr";
import React, { createContext, useContext } from "react";
import type { User } from "@/types/user";
import { getMe } from "@/utils/authService";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: () => {},
});

const fetcher = async () => {
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
    // single global auth key
    "auth:/me",
    fetcher,
    {
      // hydrate to prevent “logged-out” flash
      fallbackData: { user: initialUser ?? null },
      // tweak to taste:
      revalidateOnFocus: false,
      revalidateIfStale: false,
      // if you want to skip the first revalidation on mount:
      // revalidateOnMount: false,
      // dedupingInterval: 15_000,
    }
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ user: data?.user ?? null, isLoading, refresh: () => mutate() }),
    [data?.user, isLoading, mutate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
