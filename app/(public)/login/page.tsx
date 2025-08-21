// app/login/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const token = (await cookies()).get("auth_token")?.value;
  if (token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) redirect("/dashboard");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  return <LoginClient />;
}
