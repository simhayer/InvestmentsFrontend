"use client";

import { getToken } from "@/utils/authService";
import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export function PlaidLinkButton({ userId, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Fetch auth token on mount
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      if (token) setAuthToken(token);
    };
    fetchToken();
  }, []);

  // Fetch Plaid link token once auth token and userId are available
  useEffect(() => {
    const fetchLinkToken = async () => {
      if (!authToken || !userId) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/plaid/create-link-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        const data = await res.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error("Failed to fetch link token:", error);
      }
    };

    fetchLinkToken();
  }, [authToken, userId]);

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (public_token, metadata) => {
      try {
        const institution_id = metadata.institution?.institution_id || null;
        const institution_name = metadata.institution?.name || null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/plaid/exchange-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              public_token,
              user_id: userId,
              institution_id,
              institution_name,
            }),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          console.error("Failed to exchange token:", error);
        } else {
          onSuccess?.();
        }
      } catch (err) {
        console.error("Error during Plaid exchange:", err);
      }
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
