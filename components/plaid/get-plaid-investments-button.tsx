"use client";

import { getToken } from "@/utils/authService";
import { useCallback } from "react";

interface PlaidLinkButtonProps {
  userId: string;
}

export function GetPlaidInvestmentsButton({ userId }: PlaidLinkButtonProps) {
  const handleGetInvestments = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/plaid/investments?user_id=${encodeURIComponent(userId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Plaid Investments:", data);
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
