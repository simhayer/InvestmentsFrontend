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

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

const hasAuth = (req: NextRequest) => !!req.cookies.get(AUTH_COOKIE)?.value;

export function middleware(req: NextRequest) {
  // If you have non-GET pages that need guarding (actions/forms), remove this line.
  if (req.method !== "GET") return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // 1) Guard protected routes
  if (isProtectedPath(pathname) && !hasAuth(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 2) Authed users hitting public /market → go to protected version
  if (pathname === "/market" && hasAuth(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/market";
    // use redirect so URL/pathname match authed sidebar's active state
    return NextResponse.redirect(url);
  }

  // 3) Optional: keep authed users away from /login
  if (pathname === "/login" && hasAuth(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|gif|webp|avif|map)).*)",
  ],
};
