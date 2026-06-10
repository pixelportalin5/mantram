import { NextResponse } from "next/server";

import { REGISTERED_WITHOUT_SESSION_MESSAGE } from "@/lib/auth-errors";
import { performRegister, writeSession } from "@/lib/auth-server";
import { GraphQLClientError } from "@/lib/wp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";
  const firstName =
    typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName =
    typeof payload.lastName === "string" ? payload.lastName.trim() : "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
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
    const result = await performRegister({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    if (result.status === "authenticated") {
      await writeSession(result.session);
      return NextResponse.json({ user: result.session.user });
    }

    return NextResponse.json(
      {
        registered: true,
        user: null,
        needsSignIn: true,
        message: REGISTERED_WITHOUT_SESSION_MESSAGE,
      },
      { status: 201 },
    );
  } catch (caught) {
    const message =
      caught instanceof GraphQLClientError
        ? caught.message
        : "Could not create your account. Please try again.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
