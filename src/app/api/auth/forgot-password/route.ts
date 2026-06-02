import { NextResponse } from "next/server";

import { performForgotPassword } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: { email?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json(
      { error: "Email address is required." },
      { status: 400 },
    );
  }

  // Always return success regardless of whether the account exists,
  // to avoid leaking which emails are registered.
  try {
    await performForgotPassword(email);
  } catch {
    // Swallow — do not surface backend errors to the public endpoint.
  }

  return NextResponse.json({ ok: true });
}
