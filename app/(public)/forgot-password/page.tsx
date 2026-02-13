"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/utils/authService";
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !email.trim()) return;
    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
      toast({ title: "Link sent", description: "Check your inbox." });
    } catch {
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-neutral-600" />
                </div>
                <h1 className="text-xl font-bold text-neutral-900">
                  Reset your password
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 rounded-xl border-neutral-200 bg-neutral-50/50 pl-10 text-sm focus:bg-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Check your email</h2>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                  If an account exists for <span className="font-medium text-neutral-700">{email}</span>,
                  you&apos;ll receive a reset link shortly.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setIsSubmitted(false); setEmail(""); }}
                  className="rounded-xl h-10 text-sm w-full"
                >
                  Try a different email
                </Button>
                <p className="text-[11px] text-neutral-400">
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
