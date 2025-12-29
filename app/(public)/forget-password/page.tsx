"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
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
import { requestPasswordReset } from "@/utils/authService";
import { ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
      toast({
        title: "Link Sent",
        description: "Check your inbox for reset instructions.",
      });
    } catch {
      // Still show success to prevent email discovery
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Matching background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white" />

      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="group mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to Sign In
        </Link>

        <Card className="rounded-[2.5rem] border-neutral-200/60 bg-white p-2 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)]">
          <CardHeader className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
              {isSubmitted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <KeyRound className="h-6 w-6 text-indigo-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900">
              {isSubmitted ? "Check your email" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-neutral-500">
              {isSubmitted
                ? `We've sent a secure link to ${email}`
                : "Enter your email and we'll send you a recovery link."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            {!isSubmitted ? (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1"
                  >
                    Recovery Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 pl-11 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl bg-neutral-900 text-sm font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Didn't receive the email? Check your spam folder or try again
                  in a few minutes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="h-10 rounded-xl border-neutral-200 text-xs font-bold uppercase tracking-wider"
                >
                  Try a different email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
