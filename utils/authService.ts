// utils/authService.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL!; // e.g. http://localhost:8000

type Me = { id: number; email: string } | null;

function withCreds(init?: RequestInit): RequestInit {
  return { credentials: "include", ...init };
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email); // FastAPI OAuth2PasswordRequestForm fields
  body.set("password", password);

  const res = await fetch(
    `${API_URL}/token`,
    withCreds({
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
  );
  if (!res.ok) throw new Error("Login failed");

  // backend returns { ok: true } and sets httpOnly cookie
  return res.json() as Promise<{ ok: true }>;
}

export async function register(email: string, password: string) {
  const res = await fetch(
    `${API_URL}/register`,
    withCreds({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  );
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function getMe(): Promise<Me> {
  if (!API_URL) return null;
  const res = await fetch(
    `${API_URL}/me`,
    withCreds({ method: "GET", cache: "no-store" })
  );
  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, withCreds({ method: "POST" }));
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

/**
 * Convenience wrapper for other authenticated API calls.
 * Example: await authedFetch('/analyze-holding', { method: 'POST', body: JSON.stringify(...) })
 */
export async function authedFetch(path: string, init?: RequestInit) {
  const res = await fetch(
    `${API_URL}${path}`,
    withCreds({
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      ...init,
    })
  );
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res;
}
