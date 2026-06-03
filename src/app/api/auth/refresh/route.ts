import { NextResponse } from "next/server";

import { destroySession, requireSession } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_RETURN = "/account";

function sanitiseReturnPath(value: string | null): string {
  // Only allow same-origin paths (must start with "/" and not "//"
  // to avoid protocol-relative redirects pointing off-host).
  if (!value) return FALLBACK_RETURN;
  if (!value.startsWith("/") || value.startsWith("//")) return FALLBACK_RETURN;
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = sanitiseReturnPath(url.searchParams.get("return"));

  const session = await requireSession();

  if (session) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  // requireSession already destroyed the cookie if it couldn't refresh.
  // Belt-and-suspenders for the absent-cookie case.
  await destroySession();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", returnTo);
  return NextResponse.redirect(loginUrl);
}
