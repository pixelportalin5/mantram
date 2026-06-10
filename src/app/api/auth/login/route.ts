import { NextResponse } from "next/server";

import { performLogin, writeSession } from "@/lib/auth-server";
import { GraphQLClientError } from "@/lib/wp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPOSE_DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true";

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

    if (EXPOSE_DEBUG) {
      console.info("[auth/login] success:", session.user.email);
    }

    return NextResponse.json({ user: session.user });
  } catch (caught) {
    if (caught instanceof GraphQLClientError) {
      const body: Record<string, unknown> = {
        error: caught.message,
        code: inferAuthErrorCode(caught.rawMessage),
      };

    if (EXPOSE_DEBUG) {
      body.debug = {
        backendError: caught.rawMessage,
        httpStatus: caught.httpStatus,
        graphqlUrl: process.env.NEXT_PUBLIC_WP_GRAPHQL_URL,
        graphqlErrors: caught.graphqlErrors,
      };
        console.error("[auth/login] failed:", body.debug);
      }

      const status =
        body.code === "jwt_not_configured" ? 503 : 401;

      return NextResponse.json(body, { status });
    }

    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}

function inferAuthErrorCode(raw: string): string {
  if (/jwt auth is not configured correctly/i.test(raw)) {
    return "jwt_not_configured";
  }
  if (/invalid username|incorrect password|wrong password/i.test(raw)) {
    return "invalid_credentials";
  }
  return "auth_failed";
}
