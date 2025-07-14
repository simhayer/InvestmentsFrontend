export const API_URL = process.env.NEXT_PUBLIC_API_URL

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append("username", email)
  formData.append("password", password)

  const res = await fetch(`${API_URL}/token`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Login failed")
  }

  return res.json()
}

export const register = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error("Registration failed")
  }

  return res.json()
}

export async function getToken(): Promise<string | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = await JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return isExpired ? null : token;
  } catch {
    return null; // malformed token
  }
}