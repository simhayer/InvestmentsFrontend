// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.method !== "GET") return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Keep your convenience redirects (no auth dependency)
  if (pathname === "/market") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/market";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/investment/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace("/investment/", "/dashboard/symbol/");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|gif|webp|avif|map)).*)",
  ],
};
