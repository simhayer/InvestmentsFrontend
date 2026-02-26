import { API_URL } from "@/utils/authService";
import { supabase } from "@/utils/supabaseClient";

export type FeedbackCategory = "bug" | "idea" | "other";

export type SubmitFeedbackInput = {
  message: string;
  category: FeedbackCategory;
  email: string | null;
  page_url: string | null;
};

export class FeedbackSubmitError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    const message =
      typeof detail === "string"
        ? detail
        : typeof detail === "object" && detail && "detail" in detail
        ? String((detail as { detail?: unknown }).detail)
        : `Feedback request failed: ${status}`;
    super(message);
    this.name = "FeedbackSubmitError";
    this.status = status;
    this.detail = detail;
  }
}

async function getOptionalAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const accessToken = await getOptionalAccessToken();
  const res = await fetch(`${API_URL}/api/feedback/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let detail: unknown = { detail: `Feedback request failed: ${res.status}` };
    try {
      detail = await res.json();
    } catch {
      // Keep default fallback detail when non-JSON response is returned.
    }
    throw new FeedbackSubmitError(res.status, detail);
  }
}
