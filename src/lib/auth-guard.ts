/**
 * Centralized route protection for Mantriva (used by proxy + server layouts).
 */

export const SESSION_COOKIE = "mantriva_session";

/** Routes that require an authenticated session (httpOnly cookie). */
export const PROTECTED_ROUTE_PREFIXES = [
  "/account",
  "/checkout",
] as const;

export const AUTH_PAGE_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

export const AUTH_DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true";

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGE_PATHS.includes(
    pathname as (typeof AUTH_PAGE_PATHS)[number],
  );
}

/** Same-origin path only — blocks open redirects. */
export function sanitiseRedirectPath(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function buildLoginRedirectUrl(
  requestUrl: string,
  returnPath: string,
): URL {
  const loginUrl = new URL("/login", requestUrl);
  loginUrl.searchParams.set("redirect", returnPath);
  return loginUrl;
}

/** For `redirect()` in Server Components (path + query only). */
export function loginRedirectPath(returnPath: string): string {
  const loginUrl = new URL("http://localhost/login");
  loginUrl.searchParams.set("redirect", returnPath);
  return `${loginUrl.pathname}${loginUrl.search}`;
}

export function logRouteGuard(
  pathname: string,
  authenticated: boolean,
  allowed: boolean,
): void {
  if (!AUTH_DEBUG) return;

  console.log("User Authenticated:", authenticated);
  console.log("Current Route:", pathname);
  console.log("Checkout Access Allowed:", allowed);
}
