import { authedFetch } from "@/utils/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createLinkToken(userId: string) {
  const path = "/api/plaid/create-link-token";

  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create link token");
  }

  const data = await res.json();
  return data.link_token;
}

interface ExchangePayload {
  public_token: string;
  user_id: string;
  institution_id: string | null;
  institution_name: string | null;
}

export async function exchangePublicToken(
  payload: ExchangePayload
): Promise<void> {
  // Step 1: Exchange token
  const path = "/api/plaid/exchange-token";
  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Token exchange failed:", error);
    throw new Error("Token exchange failed");
  }

  // ✅ Step 2: Trigger sync
  const syncPath = `/api/plaid/investments`;
  const syncRes = await authedFetch(syncPath, {
    method: "GET",
  });

  if (!syncRes.ok) {
    console.error("Investment sync failed");
    throw new Error("Failed to sync investments");
  }

  await syncRes.json();
}

export async function getPlaidInvestments() {
  const path = "/api/plaid/investments";
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json();
    const err = new Error(
      errorData?.detail || `Failed to get investments: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json();
}
