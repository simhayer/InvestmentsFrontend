// components/auth/register-form.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { register as apiRegister } from "@/utils/authService";
import { analytics } from "@/lib/posthog";

function isSafeRedirect(next: string | null) {
  if (!next) return false;
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//")) return false;
  return true;
}

export function RegisterForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inlineError, setInlineError] = React.useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const validate = () => {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const v = validate();
    if (v) {
      setInlineError(v);
      toast({
        title: "Check your details",
        description: v,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setInlineError(null);

    try {
      const res = await apiRegister(email.trim(), password);

      // Supabase signUp:
      // - If email confirmation is ON: res.data.session is often null.
      // - If confirmation is OFF: res.data.session exists and user is signed in.
      const session = res?.data?.session ?? null;

      const nextParam = searchParams.get("next");
      const next = isSafeRedirect(nextParam) ? nextParam! : "/dashboard";

      analytics.capture("signed_up");

      if (session) {
        toast({
          title: "Welcome!",
          description: "Your account has been created.",
        });

        router.replace(next);
        router.refresh();
        return;
      }

      // Email confirm flow — redirect to a dedicated page
      const verifyUrl = `/verify-email?email=${encodeURIComponent(email.trim())}`;
      router.replace(verifyUrl);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to create account. Please try again.";
      setInlineError(msg);
      toast({
        title: "Registration Failed",
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
        <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
          Full name
        </Label>
        <Input
          id="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white"
        />
      </div>

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
          disabled={isLoading}
          className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white"
        />
      </div>

      {inlineError && (
        <p role="alert" className="text-sm text-destructive">
          {inlineError}
        </p>
      )}

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 mt-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating account...
          </div>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
