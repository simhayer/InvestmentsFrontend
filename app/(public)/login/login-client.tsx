// app/login/login-client.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getMe } from "@/utils/authService";
import type { User } from "@/types/user";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const handleLoginSuccess = async (_user: User | null) => {
    // 1) Warm global auth cache so UI flips immediately
    const me = (await getMe().catch(() => null)) as User | null;
    await mutate("auth:/me", { user: me }, false);

    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });

    // 2) Navigate to next (or /dashboard) and force RSC refresh
    const next = searchParams.get("next") || "/dashboard";
    router.replace(next);
    router.refresh(); // ← re-run server components; /login will redirect away if authed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Access your investment dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={handleLoginSuccess} />
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/register")}
              className="text-sm"
            >
              Don&apos;t have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
