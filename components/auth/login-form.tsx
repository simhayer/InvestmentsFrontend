// components/auth/login-form.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { login } from "@/utils/authService";
import { supabase } from "@/utils/supabaseClient";
import { analytics } from "@/lib/posthog";

function isSafeRedirect(next: string | null) {
  if (!next) return false;
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//")) return false;
  return true;
}

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const safeEmail = email.trim();

    setIsLoading(true);
    setInlineError(null);

    try {
      // 1) Supabase login (via your helper)
      const result = await login(safeEmail, password);
      if (!result?.ok) {
        throw new Error("Invalid email or password. Please try again.");
      }

      // 2) Ensure session exists (avoids redirect races)
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message);
      if (!data.session)
        throw new Error("Session not ready. Please try again.");

      // 3) Trigger AuthProvider's SWR (/me) to refetch right away
      // AuthProvider uses key like ["app:/me", access_token]
      await mutate((key) => Array.isArray(key) && key[0] === "app:/me");

      analytics.capture("logged_in");

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // 4) Safe redirect
      const nextParam = searchParams.get("next");
      const next = isSafeRedirect(nextParam) ? nextParam! : "/dashboard";
      router.replace(next);
    } catch (err: any) {
      const msg = err?.message ?? "Login failed. Please try again.";
      setInlineError(msg);
      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!inlineError}
          className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!inlineError}
            className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 pr-10 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {inlineError && (
        <p role="alert" className="text-sm text-destructive">
          {inlineError}
        </p>
      )}

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Signing in...
          </div>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
