import { authedFetch } from "@/utils/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createLinkToken(
  userId: string,
  redirectUri?: string
) {
  const path = "/api/plaid/create-link-token";

  const body: Record<string, string> = { user_id: userId };
  if (redirectUri) body.redirect_uri = redirectUri;

  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create link token");
  }

  const data = await res.json();
  return data.link_token;
}

export async function createUpdateLinkToken(
  connectionId: string,
  redirectUri?: string
) {
  const path = "/api/plaid/create-update-link-token";

  const body: Record<string, string> = { connection_id: connectionId };
  if (redirectUri) body.redirect_uri = redirectUri;

  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create update link token");
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
}

export async function removeConnection(connectionId: string) {
  const path = `/api/plaid/institutions/${connectionId}`;
  const res = await authedFetch(path, { method: "DELETE" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to remove connection" }));
    throw new Error(err.detail || "Failed to remove connection");
  }

  return res.json();
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
