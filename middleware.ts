// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/portfolio"]; // add yours

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // If user hits a protected route without a cookie -> go to /landing
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/landing";
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // Do NOT force /landing -> /dashboard here (can cause loops on expired cookies)
  return NextResponse.next();
}

// Exclude static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|svg|ico)).*)",
  ],
};
