"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { createLinkToken, exchangePublicToken } from "@/utils/plaidService";

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export function PlaidLinkButton({ userId, onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await createLinkToken(userId);
        setLinkToken(token);
      } catch (err) {
        console.error("Failed to fetch link token:", err);
      }
    };

    fetchToken();
  }, [userId]);

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (public_token, metadata) => {
      try {
        await exchangePublicToken({
          public_token,
          user_id: userId,
          institution_id: metadata.institution?.institution_id || null,
          institution_name: metadata.institution?.name || null,
        });

        onSuccess?.();
      } catch (err) {
        console.error("Error during token exchange:", err);
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
