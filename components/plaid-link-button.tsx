"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export function PlaidLinkButton({ userId, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      const res = await fetch(`${API_URL}/api/plaid/create-link-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();
      setLinkToken(data.link_token);
    };

    fetchLinkToken();
  }, [userId]);

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (public_token) => {
      await fetch(`${API_URL}/api/plaid/exchange-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token, user_id: userId }),
      });

      onSuccess?.();
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
    >
      Connect Investment Account
    </button>
  );
}
