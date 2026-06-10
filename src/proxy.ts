/**
 * Next.js 16 request proxy (replaces deprecated middleware.ts).
 * Server-side auth gate for protected routes.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildLoginRedirectUrl,
  isAuthPage,
  isProtectedRoute,
  logRouteGuard,
  sanitiseRedirectPath,
  SESSION_COOKIE,
} from "@/lib/auth-guard";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const returnPath = `${pathname}${search}`;

  const checkoutAccessAllowed =
    hasSession && (pathname === "/checkout" || pathname.startsWith("/checkout/"));

  logRouteGuard(pathname, hasSession, checkoutAccessAllowed);

  if (isProtectedRoute(pathname) && !hasSession) {
    return NextResponse.redirect(
      buildLoginRedirectUrl(request.url, returnPath),
    );
  }

  if (hasSession && isAuthPage(pathname)) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const destination = sanitiseRedirectPath(redirectParam, "/account");
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/checkout",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
