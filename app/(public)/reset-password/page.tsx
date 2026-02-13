"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/utils/authService";
import { ShieldCheck, Eye, EyeOff, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isLongEnough = password.length >= 8;
  const isMatch = password.length > 0 && password === confirmPassword;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isLongEnough) {
      toast({ title: "Too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (!isMatch) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(password);
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      router.replace("/login");
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Set a new password
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 pl-10 pr-10 text-sm focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength hints */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 px-1 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          isLongEnough ? "bg-emerald-500" : i === 1 ? "bg-amber-400" : "bg-neutral-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn("text-[11px] font-medium", isLongEnough ? "text-emerald-600" : "text-neutral-400")}>
                    {isLongEnough ? "Strong" : "Too short"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm focus:bg-white"
                />
                {isMatch && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold mt-2"
              disabled={isLoading || !isLongEnough || !isMatch}
            >
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
