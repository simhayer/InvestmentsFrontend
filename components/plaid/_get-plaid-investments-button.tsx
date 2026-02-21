"use client";

import { useCallback } from "react";
import { getPlaidInvestments } from "@/utils/plaidService";
import { logger } from "@/lib/logger";

interface PlaidLinkButtonProps {
  userId: string;
}

export function GetPlaidInvestmentsButton({ userId }: PlaidLinkButtonProps) {
  const handleGetInvestments = useCallback(async () => {
    try {
      await getPlaidInvestments(userId);
    } catch (error) {
      logger.error("Failed to get investments", { error: String(error) });
    }
  }, [userId]);

  return (
    <button
      onClick={handleGetInvestments}
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
    >
      Get Plaid Investments
    </button>
  );
}
