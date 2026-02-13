export interface User {
  id: string;
  email: string | null;
}

export type AppUser = {
  id: number;
  supabase_user_id: string;
  email: string;
  base_currency: "USD" | "CAD";
  plan: "free" | "premium" | "pro";
};
