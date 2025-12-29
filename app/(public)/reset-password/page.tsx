"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/utils/authService";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const isStrong = password.length >= 8;
  const isMatch = password.length > 0 && password === confirmPassword;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isStrong) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!isMatch) {
      toast({
        title: "No match",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(password);
      toast({
        title: "Success",
        description: "Your password has been updated.",
      });
      router.replace("/login");
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Visual Identity Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white" />

      <div className="w-full max-w-md">
        <Card className="rounded-[2.5rem] border-neutral-200/60 bg-white p-2 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)]">
          <CardHeader className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Secure Account
            </CardTitle>
            <CardDescription className="text-sm font-medium text-neutral-500">
              Set a new, strong password for your dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8 space-y-6">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Password Field */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 pl-11 pr-11 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="flex gap-1 px-1 pt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        isStrong
                          ? "bg-emerald-500"
                          : password.length > 0
                          ? "bg-amber-400"
                          : "bg-neutral-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                  Confirm Password
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 transition-all focus:bg-white focus:ring-2 ${
                    isMatch
                      ? "focus:ring-emerald-500/20"
                      : "focus:ring-indigo-500/20"
                  }`}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !isStrong || !isMatch}
                className="h-12 w-full rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-lg transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "Updating Security..." : "Secure Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
