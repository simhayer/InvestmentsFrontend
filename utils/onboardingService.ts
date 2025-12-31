import { authedFetch } from "@/utils/authService";

export type AssetPrefs = {
  stocks?: boolean;
  etfs?: boolean;
  crypto?: boolean;
  bonds?: boolean;
  cash?: boolean;
};

export type OnboardingState = {
  completed?: boolean;
  current_step?: number;

  time_horizon?: "short" | "medium" | "long" | null;
  primary_goal?: "growth" | "income" | "preserve" | "save_for_goal" | null;
  risk_level?: "low" | "medium" | "high" | null;
  experience_level?: "beginner" | "intermediate" | "advanced" | null;

  age_band?: "18_24" | "25_34" | "35_44" | "45_54" | "55_plus" | null;
  country?: string | null;

  asset_preferences?: AssetPrefs | null;
  style_preference?: "set_and_forget" | "hands_on" | "news_driven" | null;
  notification_level?: "minimal" | "balanced" | "frequent" | null;

  notes?: string | null;
};

export async function getOnboarding(): Promise<OnboardingState> {
  const res = await authedFetch("/api/onboarding", { method: "GET" });
  return res.json();
}

export async function patchOnboarding(
  payload: Partial<OnboardingState>
): Promise<OnboardingState> {
  const res = await authedFetch("/api/onboarding", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function completeOnboarding(): Promise<OnboardingState> {
  const res = await authedFetch("/api/onboarding/complete", { method: "POST" });
  return res.json();
}
