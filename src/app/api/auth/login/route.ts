import { NextResponse } from "next/server";

import { performLogin, writeSession } from "@/lib/auth-server";
import { GraphQLClientError } from "@/lib/wp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: { username?: unknown; password?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const username =
    typeof payload.username === "string" ? payload.username.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const session = await performLogin(username, password);
    await writeSession(session);
    return NextResponse.json({ user: session.user });
  } catch (caught) {
    const message =
      caught instanceof GraphQLClientError
        ? caught.message
        : "Sign-in failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
