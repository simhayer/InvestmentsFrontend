// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/portfolio",
  "/connections",
  "/holdings",
];

// --- helpers ---
function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function base64UrlDecode(input: string): string {
  // pad & replace url-safe chars
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

type JwtPayload = { exp?: number; nbf?: number; [k: string]: unknown };

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isJwtTimeValid(payload: JwtPayload, skewSeconds = 30): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now > payload.exp + skewSeconds)
    return false; // expired
  if (typeof payload.nbf === "number" && now + skewSeconds < payload.nbf)
    return false; // not yet valid
  return true;
}

function readAuth(req: NextRequest): {
  present: boolean;
  valid: boolean;
  token?: string;
} {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return { present: false, valid: false };
  const payload = parseJwtPayload(token);
  if (!payload) return { present: true, valid: false, token };
  const valid = isJwtTimeValid(payload);
  return { present: true, valid, token };
}

function clearAuthCookie(res: NextResponse) {
  // Adjust attributes to match how you set it on the server (domain/path/secure/samesite)
  res.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

// --- middleware ---
export function middleware(req: NextRequest) {
  // If you have non-GET actions that must be protected, remove this early return.
  if (req.method !== "GET") return NextResponse.next();

  const { pathname, search } = req.nextUrl;
  const { present, valid } = readAuth(req);

  const isAuthed = present && valid;

  // 1) Guard protected routes
  if (isProtectedPath(pathname) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (search || ""));
    const res = NextResponse.redirect(url);
    if (present && !valid) clearAuthCookie(res); // wipe expired/invalid token
    return res;
  }

  // 2) Authed users hitting public /market → go to protected version
  if (pathname === "/market" && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/market";
    return NextResponse.redirect(url);
  } else if (pathname.startsWith("/investment/") && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace("/investment/", "/dashboard/symbol/");
    return NextResponse.redirect(url);
  }

  // 3) Keep authed users away from /login
  if (pathname === "/login" && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 4) Optional: if token is present but invalid on any public route, clear it silently
  if (present && !valid) {
    const res = NextResponse.next();
    clearAuthCookie(res);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|gif|webp|avif|map)).*)",
  ],
};
