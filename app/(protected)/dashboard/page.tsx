// app/dashboard/page.tsx  (SERVER component — no "use client")
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { User } from "@/types/user";

export default async function DashboardPage() {
  const token = (await cookies()).get("auth_token")?.value;
  console.log("Token:", token);
  // console.log("Cookies:", document.cookie);
  if (!token) redirect("/landing");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) redirect("/landing");

  const user = (await res.json()) as User;
  return <DashboardClient user={user} />;
}
