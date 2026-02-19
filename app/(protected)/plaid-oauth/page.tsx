"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import { createLinkToken, exchangePublicToken } from "@/utils/plaidService";
import { useAuth } from "@/lib/auth-provider";
import { Loader2 } from "lucide-react";

const PLAID_REDIRECT_URI =
  process.env.NEXT_PUBLIC_PLAID_REDIRECT_URI ||
  (process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/plaid-oauth`
    : undefined);

export default function PlaidOAuthPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = String(user?.id || "");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userId || fetchedRef.current) return;
    fetchedRef.current = true;

    createLinkToken(userId, PLAID_REDIRECT_URI)
      .then(setLinkToken)
      .catch(() => setError("Failed to resume connection. Please try again from the Connections page."));
  }, [userId]);

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    receivedRedirectUri: typeof window !== "undefined" ? window.location.href : undefined,
    onSuccess: async (public_token, metadata) => {
      try {
        await exchangePublicToken({
          public_token,
          user_id: userId,
          institution_id: metadata.institution?.institution_id || null,
          institution_name: metadata.institution?.name || null,
        });
        router.push("/connections");
      } catch {
        setError("Connection failed. Please try again from the Connections page.");
      }
    },
    onExit: () => {
      router.push("/connections");
    },
  });

  useEffect(() => {
    if (ready && linkToken) {
      open();
    }
  }, [ready, linkToken, open]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.push("/connections")}
          className="text-sm font-medium text-neutral-700 underline"
        >
          Back to Connections
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      <p className="text-sm text-neutral-500">
        Completing your bank connection...
      </p>
    </div>
  );
}
