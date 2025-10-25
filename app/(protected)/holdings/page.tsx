// app/holdings/page.tsx
import { redirect } from "next/navigation";
import HoldingsClient from "./holdings-client";
import type { User } from "@/types/user";
import { getCurrentUser } from "@/lib/auth";

export default async function HoldingsPage() {
  const user = (await getCurrentUser()) as User | null;
  if (!user) redirect("/landing?next=/holdings");

  return <HoldingsClient user={user} />;
}
