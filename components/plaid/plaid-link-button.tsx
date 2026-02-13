"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePlaidLink } from "react-plaid-link";
import { createLinkToken, exchangePublicToken } from "@/utils/plaidService";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
  label?: string;
  children?: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  fullWidth?: boolean;
  /** Pass a pre-fetched link token to avoid duplicate createLinkToken calls. */
  linkToken?: string | null;
}

export function PlaidLinkButton({
  userId,
  onSuccess,
  label = "Connect investment account",
  children,
  variant = "default",
  size = "default",
  className,
  fullWidth,
  linkToken: externalToken,
}: PlaidLinkButtonProps) {
  const [internalToken, setInternalToken] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Only fetch a token if one wasn't provided externally
  useEffect(() => {
    if (externalToken !== undefined) return;        // parent controls the token
    if (fetchedRef.current) return;                  // already fetched
    fetchedRef.current = true;

    const fetchToken = async () => {
      try {
        const token = await createLinkToken(userId);
        setInternalToken(token);
      } catch (err) {
        console.error("Failed to fetch link token:", err);
      }
    };

    fetchToken();
  }, [userId, externalToken]);

  const resolvedToken = externalToken ?? internalToken;

  const { open, ready } = usePlaidLink({
    token: resolvedToken || "",
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
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => open()}
      disabled={!ready}
      className={cn(
        "h-11 rounded-xl px-5 font-semibold shadow-[0_12px_32px_-22px_rgba(15,23,42,0.45)] transition-shadow hover:shadow-[0_16px_38px_-22px_rgba(15,23,42,0.45)]",
        fullWidth && "w-full justify-center",
        className
      )}
    >
      {children ?? label}
    </Button>
  );
}
