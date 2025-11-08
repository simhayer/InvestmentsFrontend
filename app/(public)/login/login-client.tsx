// app/login/login-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginClient() {
  const router = useRouter();

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Access your investment dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
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
