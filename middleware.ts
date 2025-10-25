// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/portfolio",
  "/connections",
  "/holdings",
];
const AUTH_COOKIE_CANDIDATES = ["auth_token", "session", "access_token"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function hasAuthCookie(req: NextRequest) {
  return AUTH_COOKIE_CANDIDATES.some((n) => !!req.cookies.get(n)?.value);
}

export function middleware(req: NextRequest) {
  if (req.method !== "GET") return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (isProtectedPath(pathname) && !hasAuthCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/landing";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  // No “auth-entry” redirect here to avoid loops.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|gif|webp|avif|map)).*)",
  ],
};
