import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, isTokenValid } from "@/lib/auth-token";

const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const tiktokMatch = pathname.match(/tiktok([A-Za-z0-9_-]+)\.txt$/);
  if (tiktokMatch) {
    return new NextResponse(`tiktok-developers-site-verification=${tiktokMatch[1]}`, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const rawToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const isAuthenticated = Boolean(token && isTokenValid(token));

  if (pathname === "/") {
    const destination = request.nextUrl.clone();
    destination.pathname = isAuthenticated ? "/dashboard" : "/login";
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  if (pathname === "/login") {
    if (isAuthenticated) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/dashboard";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
    return NextResponse.next();
  }

  if (
    pathname.endsWith(".txt") ||
    pathname.includes("tiktok") ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("from", `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);

    if (rawToken) {
      response.cookies.delete(ACCESS_TOKEN_KEY);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|storage|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|wav)$).*)",
  ],
};
