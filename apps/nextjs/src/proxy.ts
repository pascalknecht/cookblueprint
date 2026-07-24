import { NextRequest, NextResponse } from "next/server";

import { mobileWebDevOrigins } from "@/lib/mobile-dev-origins";

const PROTECTED_PREFIXES = ["/dashboard", "/settings"];
const LOGIN_PATH = "/login";

function corsHeaders(origin: string | null): Record<string, string> | null {
  if (!origin || !mobileWebDevOrigins.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const headers = corsHeaders(request.headers.get("origin"));
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: headers ?? undefined });
    }
    const response = NextResponse.next();
    if (headers) {
      for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
    }
    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie?.value) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/api/:path*"],
};
