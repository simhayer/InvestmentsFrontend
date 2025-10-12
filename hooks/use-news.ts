import type { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BACKEND_URL = `${API_URL}/api/news`;

export async function fetchNewsForUser(): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/latest-for-user`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch news (${res.status})`);
  }

  return res.json();
}
