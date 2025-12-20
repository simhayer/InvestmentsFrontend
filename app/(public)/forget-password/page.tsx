// app/(public)/forgot-password/page.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/utils/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());

      // Same message either way to prevent account enumeration
      toast({
        title: "Check your inbox",
        description: "If an account exists, we sent a reset link.",
      });
    } catch {
      toast({
        title: "Check your inbox",
        description: "If an account exists, we sent a reset link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
