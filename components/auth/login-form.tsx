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

    setIsLoading(true);
    setInlineError(null);

    try {
      // 1) Supabase login
      const result = await login(email.trim(), password);
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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2.5">
        <Label
          htmlFor="email"
          className='text-sm font-medium text-neutral-700 font-["Futura_PT_Demi",_Futura,_sans-serif]'
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          aria-invalid={!!inlineError}
          className="h-11 rounded-lg border-neutral-200 bg-white/90 text-base focus-visible:ring-neutral-900/70"
        />
      </div>

      <div className="space-y-2.5">
        <Label
          htmlFor="password"
          className='text-sm font-medium text-neutral-700 font-["Futura_PT_Demi",_Futura,_sans-serif]'
        >
          Password
        </Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!inlineError}
            className="h-11 rounded-lg border-neutral-200 bg-white/90 pr-10 text-base focus-visible:ring-neutral-900/70"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 grid place-items-center px-3 text-muted-foreground transition hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link
            href="/forget-password"
            className='font-medium text-neutral-800 underline-offset-4 hover:text-neutral-950 hover:underline font-["Futura_PT_Demi",_Futura,_sans-serif]'
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {inlineError && (
        <p role="alert" className="text-sm text-destructive">
          {inlineError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className='w-full rounded-lg text-base font-["Futura_PT_Demi",_Futura,_sans-serif]'
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
