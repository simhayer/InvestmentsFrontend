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

      if (session) {
        toast({
          title: "Welcome!",
          description: "Your account has been created.",
        });

        router.replace(next);
        router.refresh();
        return;
      }

      // Email confirm flow
      toast({
        title: "Check your email",
        description:
          "We sent you a verification link. Verify your email, then sign in.",
      });

      router.replace("/login");
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
      <div className="space-y-1.5">
        <Label
          htmlFor="name"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1"
        >
          Full Name
        </Label>
        <Input
          id="name"
          placeholder="Warren Buffett"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 pr-10 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password - Optional: Only show if password length > 0 to keep UI clean */}
      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1"
        >
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full mt-2 rounded-xl bg-neutral-900 text-sm font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
