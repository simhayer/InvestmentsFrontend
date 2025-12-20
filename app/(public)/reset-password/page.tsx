// app/(public)/reset-password/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/utils/authService";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters.");

      await resetPassword(password);

      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });

      router.replace("/login");
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
