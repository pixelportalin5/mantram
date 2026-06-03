if (typeof window !== "undefined") {
  throw new Error(
    "[mantram] @/lib/auth-server is server-only. It must not be imported from a Client Component or client-side bundle.",
  );
}

import { cookies } from "next/headers";

import type {
  AuthUser,
  CustomerProfile,
  CustomerAddress,
} from "@/lib/auth-types";
import { GraphQLClientError, wpRequest } from "@/lib/wp-client";

const SESSION_COOKIE = "mantram_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

type SessionPayload = {
  authToken: string;
  refreshToken: string | null;
  user: AuthUser;
};

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

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        databaseId
        email
        firstName
        lastName
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!, $firstName: String, $lastName: String) {
    registerUser(
      input: {
        username: $email
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      user {
        id
        databaseId
        email
        firstName
        lastName
      }
    }
  }
`;

const VIEWER_QUERY = `
  query Viewer {
    viewer {
      id
      databaseId
      email
      firstName
      lastName
    }
  }
`;

const REFRESH_MUTATION = `
  mutation Refresh($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      success
    }
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: { key: $key, login: $login, password: $password }) {
      user {
        id
        databaseId
        email
      }
    }
  }
`;

const CUSTOMER_QUERY = `
  query Customer {
    customer {
      id
      databaseId
      email
      firstName
      lastName
      username
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      shipping {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
      }
      orders(first: 25) {
        nodes {
          id
          databaseId
          orderNumber
          status
          date
          total
          lineItems {
            nodes {
              product {
                node {
                  id
                  name
                  slug
                  ... on SimpleProduct {
                    image {
                      sourceUrl
                      altText
                    }
                  }
                  ... on VariableProduct {
                    image {
                      sourceUrl
                      altText
                    }
                  }
                }
              }
              quantity
              total
            }
          }
        }
      }
    }
  }
`;

const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer(
    $firstName: String,
    $lastName: String,
    $email: String,
    $billing: CustomerAddressInput,
    $shipping: CustomerAddressInput
  ) {
    updateCustomer(
      input: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        billing: $billing
        shipping: $shipping
      }
    ) {
      customer {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export async function performLogin(
  username: string,
  password: string,
): Promise<SessionPayload> {
  const data = await wpRequest<{
    login: {
      authToken: string | null;
      refreshToken: string | null;
      user: AuthUser | null;
    } | null;
  }>(LOGIN_MUTATION, { username, password });

  if (!data.login?.authToken || !data.login?.user) {
    throw new GraphQLClientError("Invalid email or password.");
  }

  return {
    authToken: data.login.authToken,
    refreshToken: data.login.refreshToken ?? null,
    user: data.login.user,
  };
}

export async function performRegister(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<SessionPayload> {
  await wpRequest(REGISTER_MUTATION, {
    email: input.email,
    password: input.password,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
  });

  return performLogin(input.email, input.password);
}

export async function performForgotPassword(username: string): Promise<void> {
  await wpRequest(FORGOT_PASSWORD_MUTATION, { username });
}

export async function performResetPassword(input: {
  key: string;
  login: string;
  password: string;
}): Promise<void> {
  await wpRequest(RESET_PASSWORD_MUTATION, input);
}

export async function fetchViewer(authToken: string): Promise<AuthUser | null> {
  try {
    const data = await wpRequest<{ viewer: AuthUser | null }>(
      VIEWER_QUERY,
      undefined,
      authToken,
    );
    return data.viewer;
  } catch {
    return null;
  }
}

export async function fetchCustomer(
  authToken: string,
): Promise<CustomerProfile | null> {
  try {
    const data = await wpRequest<{ customer: CustomerProfile | null }>(
      CUSTOMER_QUERY,
      undefined,
      authToken,
    );
    return data.customer;
  } catch {
    return null;
  }
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
  await wpRequest(UPDATE_CUSTOMER_MUTATION, input, authToken);
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const data = await wpRequest<{
      refreshJwtAuthToken: { authToken: string | null } | null;
    }>(REFRESH_MUTATION, { refreshToken });
    return data.refreshJwtAuthToken?.authToken ?? null;
  } catch {
    return null;
  }
}

export type ActiveSessionResult =
  | { status: "active"; session: Session }
  | { status: "missing" }
  | { status: "refresh-required" }
  | { status: "invalid" };

/**
 * Render-safe session reader. Validates the JWT against WordPress's `viewer`
 * query but NEVER writes cookies — safe to call from Server Components.
 *
 * Returns one of:
 *   - { status: "active", session }     — token is valid, render
 *   - { status: "missing" }             — no cookie, redirect to /login
 *   - { status: "refresh-required" }    — cookie present but stale; caller
 *                                          should bounce through
 *                                          /api/auth/refresh to rotate the JWT
 *   - { status: "invalid" }             — cookie present but no refresh token
 *                                          and viewer rejected; redirect to
 *                                          /api/auth/logout to clear it
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
 * if the auth token has expired, rotates it via the refresh token —
 * persisting the new token to the cookie. MUST NOT be called from a
 * Server Component or `generateMetadata` (Next.js forbids cookie writes
 * outside Server Actions and Route Handlers).
 *
 * Returns null if the session cannot be recovered, in which case the cookie
 * has already been cleared.
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
