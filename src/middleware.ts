import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  extractBearerToken,
} from "@/utils/tokens";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Refresh-Token",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

const addCorsHeaders = (res: NextResponse, origin: string) => {
  res.headers.set(
    "Access-Control-Allow-Origin",
    ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  );
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS")
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);

  const isPublic =
    [
      "/login",
      "/privacy-policy",
      "/assets",
      "/api/auth",
      "/api/user/phone",
      "/api/user/refresh",
      "/api/slack",
      "/_next",
      "/static",
      "/favicon.ico",
      "/sitemap.xml",
    ].some((p) => pathname.startsWith(p)) ||
    /\/api\/user\/[^\/]+\/(get-otp|verify\/[^\/]+)$/.test(pathname);

  if (isPublic) return addCorsHeaders(NextResponse.next(), origin);

  // 🔒 /api/user — access token only
  if (pathname === "/api/user" || pathname.startsWith("/api/user/")) {
    const token = extractBearerToken(req.headers.get("authorization"));
    const payload = token ? await verifyAccessToken(token) : null;

    if (!payload) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Unauthorized", message: "Invalid or expired access token" },
          { status: 401 }
        ),
        origin
      );
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.id);
    headers.set("x-user-email", payload.email);
    headers.set("x-user-name", payload.name);
    headers.set("x-user-username", payload.username);
    headers.set("x-auth-type", "external-api");

    return addCorsHeaders(NextResponse.next({ request: { headers } }), origin);
  }

  // 🔄 /api/user/refresh — refresh token only
  if (pathname === "/api/user/refresh") {
    const refreshToken = req.headers.get("x-refresh-token");
    const payload = refreshToken
      ? await verifyRefreshToken(refreshToken)
      : null;

    if (!payload) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Unauthorized",
            message: "Invalid or expired refresh token",
          },
          { status: 401 }
        ),
        origin
      );
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.id);
    headers.set("x-user-email", payload.email);
    headers.set("x-user-name", payload.name);
    headers.set("x-user-username", payload.username);
    headers.set("x-auth-type", "external-api");

    return addCorsHeaders(NextResponse.next({ request: { headers } }), origin);
  }

  // 🧭 Internal Next.js API: use NextAuth session
  const sessionToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  if (sessionToken) {
    const headers = new Headers(req.headers);
    headers.set("x-user-id", sessionToken.id as string);
    headers.set("x-user-email", sessionToken.email as string);
    headers.set("x-user-name", sessionToken.name as string);
    headers.set("x-user-username", sessionToken.username as string);
    headers.set("x-auth-type", "internal-session");

    return addCorsHeaders(NextResponse.next({ request: { headers } }), origin);
  }

  // ❌ Unauthorized fallback
  if (pathname.startsWith("/api/")) {
    return addCorsHeaders(
      NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
      origin
    );
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|privacy-policy|assets|api/auth|_next|static|favicon.ico|sitemap.xml|.*\\.svg$).*)",
  ],
};
