// app/login/page.tsx  (Server Component)
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth"; // SSR helper that forwards cookies
import LoginClient from "./login-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(searchParams?.next ?? "/dashboard");
  }

  return <LoginClient />;
}
