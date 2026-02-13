"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { toast } = useToast();

  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  const handleResend = async () => {
    if (resending || !email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResent(true);
      toast({ title: "Email sent", description: "Check your inbox again." });
    } catch {
      toast({
        title: "Couldn't resend",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Check your email
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
            {email ? (
              <>
                We sent a verification link to{" "}
                <span className="font-semibold text-neutral-700">{email}</span>.
                Click the link to activate your account.
              </>
            ) : (
              <>
                We sent a verification link to your email.
                Click the link to activate your account.
              </>
            )}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 text-left space-y-3">
          <StepRow number={1} text="Open your email inbox" />
          <StepRow number={2} text='Click the "Confirm your email" link' />
          <StepRow number={3} text="You'll be signed in automatically" />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {email && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending || resent}
              className="rounded-xl h-10 text-sm font-medium w-full"
            >
              {resending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : resent ? (
                "Email resent"
              ) : (
                "Resend verification email"
              )}
            </Button>
          )}

          <Link href="/login" className="block">
            <Button
              variant="ghost"
              className="rounded-xl h-10 text-sm text-neutral-500 w-full"
            >
              Go to sign in
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Tip */}
        <p className="text-[11px] text-neutral-400">
          Can&apos;t find the email? Check your spam or junk folder.
        </p>
      </div>
    </div>
  );
}

function StepRow({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
        {number}
      </span>
      <span className="text-sm text-neutral-600">{text}</span>
    </div>
  );
}
