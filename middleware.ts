// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.method !== "GET") return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Avoid redirecting public routes into protected ones for logged-out users.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|gif|webp|avif|map)).*)",
  ],
};
