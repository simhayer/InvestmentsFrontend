// utils/authService.ts
import { AppUser } from "@/types/user";
import { supabase } from "./supabaseClient";

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type Me = { id: string; email: string | null } | null; // Supabase user id is UUID string

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const, session: data.session };
}

export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // optional: email redirect after confirmation
    // options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw new Error(error.message);
  return { ok: true as const, data };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function getMe(): Promise<Me> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  if (!data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
}

/**
 * For calling your FastAPI endpoints that require auth.
 * Sends Supabase access token as Bearer token.
 */
export async function authedFetch(path: string, init?: RequestInit) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new Error(error.message);
  if (!session?.access_token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res;
}

/** Supabase handles reset emails. */
export async function requestPasswordReset(email: string) {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

/**
 * For "reset password" page after user clicks Supabase email link.
 * Supabase will set a recovery session in the browser.
 */
export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function getAppMe(): Promise<AppUser> {
  const path = `/me`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch /me");
  return res.json();
}
