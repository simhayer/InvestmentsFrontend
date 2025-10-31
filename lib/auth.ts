// lib/auth.ts
import "server-only";
import { cookies } from "next/headers";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieHeader = cookies().toString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch (err) {
    console.error("Failed to fetch current user", err);
    return null;
  }
}
