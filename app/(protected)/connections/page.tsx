// app/dashboard/connections.tsx  (SERVER component — no "use client")
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConnectionsClient from "./connections-client";
import { User } from "@/types/user";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = (await getCurrentUser()) as User | null;
  if (!user) redirect("/landing?next=/connections");
  return <ConnectionsClient user={user} />;
}
