"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Supabase redirects here after email verification or password reset.
 * The URL hash contains the tokens (access_token, refresh_token, type).
 * We exchange them via Supabase client, then redirect the user.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = React.useState("");
  const processedRef = React.useRef(false);

  React.useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleCallback() {
      try {
        // Supabase puts tokens in the URL hash (#access_token=...&type=...)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const type = params.get("type");

        // Let Supabase client pick up the session from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (!data.session) {
          // Sometimes the hash-based exchange needs a moment; try exchanging explicitly
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setError) throw new Error(setError.message);
          }
        }

        if (type === "recovery") {
          // Password reset flow — redirect to reset-password page
          setStatus("success");
          setMessage("Redirecting to set your new password...");
          setTimeout(() => router.replace("/reset-password"), 1500);
        } else {
          // Email verification or other — redirect to dashboard/onboarding
          setStatus("success");
          setMessage("Email verified! Redirecting...");
          setTimeout(() => router.replace("/dashboard"), 1500);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage(err?.message || "Something went wrong. Please try again.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-sm text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mx-auto" />
            <div>
              <h1 className="text-lg font-bold text-neutral-900">Verifying...</h1>
              <p className="text-sm text-neutral-500 mt-1">Just a moment.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">All set!</h1>
              <p className="text-sm text-neutral-500 mt-1">{message}</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">
                Verification failed
              </h1>
              <p className="text-sm text-neutral-500 mt-1">{message}</p>
            </div>
            <div className="space-y-2 pt-2">
              <Link href="/login">
                <Button className="rounded-xl h-10 w-full bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold">
                  Go to sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" className="rounded-xl h-10 w-full text-sm text-neutral-500">
                  Create a new account
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
