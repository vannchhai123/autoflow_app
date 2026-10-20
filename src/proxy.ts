import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, isTokenValid } from "@/lib/auth-token";

const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const rawToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const isAuthenticated = Boolean(token && isTokenValid(token));

  // Root path routing
  if (pathname === "/") {
    const destination = request.nextUrl.clone();
    destination.pathname = isAuthenticated ? "/dashboard" : "/login";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  // Already authenticated user visiting /login -> send to dashboard
  if (pathname === "/login") {
    if (isAuthenticated) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/dashboard";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("from", `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    // If an invalid or expired cookie was present, clear it
    if (rawToken) {
      response.cookies.delete(ACCESS_TOKEN_KEY);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes, if any)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
