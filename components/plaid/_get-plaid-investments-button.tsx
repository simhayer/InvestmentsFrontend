"use client";

import { useCallback } from "react";
import { getPlaidInvestments } from "@/utils/plaidService";

interface PlaidLinkButtonProps {
  userId: string;
}

export function GetPlaidInvestmentsButton({ userId }: PlaidLinkButtonProps) {
  const handleGetInvestments = useCallback(async () => {
    try {
      const data = await getPlaidInvestments(userId);
      console.log("Plaid Investments:", data);
      // Optionally trigger UI update, toast, etc.
    } catch (error) {
      console.error("Failed to get investments:", error);
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
