"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegisterSuccess = (userData: any, token?: string) => {
    if (token) {
      const user = {
        id: userData.user_id || "1",
        email: userData.email || userData.username,
        name:
          userData.name || userData.email?.split("@")[0] || userData.username,
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Welcome!",
        description: "Your account has been created.",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Registration successful!",
        description: "Please log in.",
      });
      router.push("/login");
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join our investment tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm onSuccess={handleRegisterSuccess} />
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="text-sm"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
