// lib/auth.ts
import "server-only";
import { cookies, headers } from "next/headers";
import type { User } from "@/types/user";

/**
 * Fetches the currently logged-in user using cookies
 * and your backend `/me` endpoint.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieHeader = (await cookies()).toString();
    const host = (await headers()).get("host") ?? "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      headers: {
        cookie: cookieHeader,
        "x-forwarded-host": host,
        "content-type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return null;
  }
}
