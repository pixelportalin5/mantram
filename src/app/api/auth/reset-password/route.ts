import { NextResponse } from "next/server";

import { performResetPassword } from "@/lib/auth-server";
import { GraphQLClientError } from "@/lib/wp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const key = typeof payload.key === "string" ? payload.key : "";
  const login = typeof payload.login === "string" ? payload.login : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!key || !login) {
    return NextResponse.json(
      { error: "Reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    await performResetPassword({ key, login, password });
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const message =
      caught instanceof GraphQLClientError
        ? caught.message
        : "Could not reset your password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
