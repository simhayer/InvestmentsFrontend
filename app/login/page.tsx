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
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLoginSuccess = (userData: any, token: string) => {
    const user = {
      id: userData.user_id || "1",
      email: userData.email || userData.username,
      name: userData.name || userData.email?.split("@")[0] || userData.username,
    };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });
    router.push("/dashboard");
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
