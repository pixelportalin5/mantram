if (typeof window !== "undefined") {
  throw new Error(
    "[mantriva] @/lib/auth-server is server-only. It must not be imported from a Client Component or client-side bundle.",
  );
}

import { cookies } from "next/headers";

import type {
  AuthUser,
  CustomerProfile,
  CustomerAddress,
} from "@/lib/auth-types";
import {
  graphqlFetchCustomer,
  graphqlFetchViewer,
  graphqlForgotPassword,
  graphqlLogin,
  graphqlRefreshAuthToken,
  graphqlRegister,
  graphqlResetPassword,
  graphqlUpdateCustomer,
  type GraphQLRegisterResult,
  type GraphQLSessionPayload,
} from "@/lib/graphql-auth";

const SESSION_COOKIE = "mantriva_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

type SessionPayload = GraphQLSessionPayload;

export type Session = SessionPayload;

function encode(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
}

function decode(raw: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8"),
    ) as SessionPayload;
    if (!parsed?.authToken || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function writeSession(session: SessionPayload): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function performLogin(
  username: string,
  password: string,
): Promise<SessionPayload> {
  return graphqlLogin(username, password);
}

export async function performRegister(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<GraphQLRegisterResult> {
  return graphqlRegister(input);
}

export async function performForgotPassword(username: string): Promise<void> {
  return graphqlForgotPassword(username);
}

export async function performResetPassword(input: {
  key: string;
  login: string;
  password: string;
}): Promise<void> {
  return graphqlResetPassword(input);
}

export async function fetchViewer(authToken: string): Promise<AuthUser | null> {
  return graphqlFetchViewer(authToken);
}

export async function fetchCustomer(
  authToken: string,
): Promise<CustomerProfile | null> {
  return graphqlFetchCustomer(authToken);
}

export async function updateCustomer(
  authToken: string,
  input: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    billing?: CustomerAddress | null;
    shipping?: CustomerAddress | null;
  },
): Promise<void> {
  return graphqlUpdateCustomer(authToken, input);
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<string | null> {
  return graphqlRefreshAuthToken(refreshToken);
}

export type ActiveSessionResult =
  | { status: "active"; session: Session }
  | { status: "missing" }
  | { status: "refresh-required" }
  | { status: "invalid" };

/**
 * Render-safe session reader. Validates the JWT against WordPress's `viewer`
 * query but NEVER writes cookies — safe to call from Server Components.
 */
export async function getActiveSession(): Promise<ActiveSessionResult> {
  const session = await readSession();
  if (!session) return { status: "missing" };

  const viewer = await fetchViewer(session.authToken);
  if (viewer) {
    return {
      status: "active",
      session: { ...session, user: { ...session.user, ...viewer } },
    };
  }

  if (session.refreshToken) {
    return { status: "refresh-required" };
  }
  return { status: "invalid" };
}

/**
 * Route-handler-only session resolver. Re-validates against WordPress and,
 * if the auth token has expired, rotates it via the refresh token.
 */
export async function requireSession(): Promise<Session | null> {
  const session = await readSession();
  if (!session) return null;

  const viewer = await fetchViewer(session.authToken);
  if (viewer) {
    if (
      viewer.id !== session.user.id ||
      viewer.email !== session.user.email ||
      viewer.firstName !== session.user.firstName ||
      viewer.lastName !== session.user.lastName
    ) {
      const refreshed: SessionPayload = {
        ...session,
        user: { ...session.user, ...viewer },
      };
      await writeSession(refreshed);
      return refreshed;
    }
    return session;
  }

  if (!session.refreshToken) {
    await destroySession();
    return null;
  }

  const newAuthToken = await refreshAuthToken(session.refreshToken);
  if (!newAuthToken) {
    await destroySession();
    return null;
  }

  const refreshedViewer = await fetchViewer(newAuthToken);
  if (!refreshedViewer) {
    await destroySession();
    return null;
  }

  const refreshed: SessionPayload = {
    authToken: newAuthToken,
    refreshToken: session.refreshToken,
    user: { ...session.user, ...refreshedViewer },
  };
  await writeSession(refreshed);
  return refreshed;
}
