import { authedFetch } from "@/utils/authService";

export type SubscriptionMe = {
  plan: "free" | "premium" | "pro";
  status: string; // free | trialing | active | past_due | canceled | ...
  current_period_end?: string | null;
  trial_end?: string | null;
};

export async function getMySubscription(): Promise<SubscriptionMe> {
  const res = await authedFetch("/api/billing/me", { method: "GET" });
  return res.json();
}

export async function createCheckoutSession(plan: "premium" | "pro") {
  const res = await authedFetch("/api/billing/checkout-session", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
  return res.json() as Promise<{ url: string }>;
}

export async function createPortalSession() {
  const res = await authedFetch("/api/billing/portal-session", {
    method: "POST",
  });
  return res.json() as Promise<{ url: string }>;
}
