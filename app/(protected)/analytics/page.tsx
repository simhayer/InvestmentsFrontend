// app/dashboard/connections.tsx  (SERVER component — no "use client")
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";
import { User } from "@/types/user";
import { getCurrentUser } from "@/lib/auth";

export default async function AnalyticsPage() {
  const user = (await getCurrentUser()) as User | null;
  if (!user) redirect("/landing?next=/analytics");
  return <AnalyticsClient user={user} />;
}
