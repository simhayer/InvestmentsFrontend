import { authedFetch } from "./authService";

export async function updateCurrency(newCurrency: "USD" | "CAD") {
  const path = `/update_currency`;
  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify({ new_currency: newCurrency }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update currency");
  }

  return res.json();
}
