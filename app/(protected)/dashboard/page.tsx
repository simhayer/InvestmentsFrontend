// app/dashboard/page.tsx  (Server Component)
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/types/user";

export default async function DashboardPage() {
  const user = (await getCurrentUser()) as User | null;
  if (!user) redirect("/landing?next=/dashboard");

  return <DashboardClient user={user} />;
}
