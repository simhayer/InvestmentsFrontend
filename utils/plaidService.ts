import { getToken } from "@/utils/authService";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createLinkToken(userId: string) {
  const token = await getToken();
  if (!token) throw new Error("No auth token");

  const res = await fetch(`${API_URL}/api/plaid/create-link-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export async function exchangePublicToken(payload: ExchangePayload): Promise<void> {
  const token = await getToken();

  // Step 1: Exchange token
  const res = await fetch(`${API_URL}/api/plaid/exchange-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Token exchange failed:", error);
    throw new Error("Token exchange failed");
  }

  // ✅ Step 2: Trigger sync
  const syncRes = await fetch(`${API_URL}/api/plaid/investments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!syncRes.ok) {
    console.error("Investment sync failed");
    throw new Error("Failed to sync investments");
  }

  const data = await syncRes.json();
  console.log("Synced holdings:", data.count);
}

export async function getPlaidInvestments(userId: string) {
  const token = await getToken();
  if (!token) throw new Error("No auth token");

  const res = await fetch(
    `${API_URL}/api/plaid/investments?user_id=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.detail || `Failed to get investments: ${res.status}`);
  }

  return res.json();
}