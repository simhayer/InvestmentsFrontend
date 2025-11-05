// app/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProtectedShell from "./protected-shell";
import type { User } from "@/types/user";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("auth_token")?.value; // no await needed
  if (!token) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`); // keep next param
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const user = (await res.json()) as User;

  return <ProtectedShell user={user}>{children}</ProtectedShell>;
}
