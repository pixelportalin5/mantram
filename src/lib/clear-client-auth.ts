import { AUTH_DEBUG } from "@/lib/auth-guard";

/**
 * Clear any client-side auth artifacts. Session JWT lives in httpOnly cookie
 * (cleared by POST /api/auth/logout). No auth tokens in localStorage today.
 */
export function clearClientAuthArtifacts(): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem("mantriva_session");
    window.localStorage.removeItem("mantriva_session");
    window.localStorage.removeItem("mantriva_auth");
    window.localStorage.removeItem("luxury_cart");
  } catch {
    // ignore storage errors
  }

  if (AUTH_DEBUG) {
    console.log("Token Removed");
  }
}
