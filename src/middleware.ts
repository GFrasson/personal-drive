import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/api/login")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE.name)?.value;
    const hasAuth = !!token && (await verifyAuthToken(token)) !== null;

    if (hasAuth && pathname.startsWith("/login")) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE.name)?.value;
  const isAuthenticated = !!token && (await verifyAuthToken(token)) !== null;

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};


