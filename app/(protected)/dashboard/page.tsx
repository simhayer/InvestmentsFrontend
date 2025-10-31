// app/dashboard/page.tsx  (Server Component)
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Dashboard } from "@/components/dashboard";
import type { User } from "@/types/user";

export default async function DashboardPage() {
  const user = (await getCurrentUser()) as User | null;
  console.log("DashboardPage - user:", user);
  if (!user) redirect("/landing?next=/dashboard");

  return <Dashboard user={user} />;
}
