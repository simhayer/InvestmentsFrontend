// app/holdings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HoldingsClient from "./holdings-client";
import { User } from "@/types/user";

export default async function HoldingsPage() {
  const token = (await cookies()).get("auth_token")?.value;
  console.log("Token:", token);
  if (!token) redirect("/landing");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) redirect("/landing");

  const user = (await res.json()) as User;
  return <HoldingsClient user={user} />;
}
