/**
 * Verify WPGraphQL JWT Authentication on the Mantriva WordPress backend.
 *
 * Uses GraphQL mutations only (login, refreshJwtAuthToken).
 *
 * Usage:
 *   npm run verify:jwt
 *
 * Optional — test a real WordPress account:
 *   WP_TEST_LOGIN_USERNAME=you@example.com WP_TEST_LOGIN_PASSWORD=secret npm run verify:jwt
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const graphqlUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;
const testUsername = process.env.WP_TEST_LOGIN_USERNAME;
const testPassword = process.env.WP_TEST_LOGIN_PASSWORD;

if (!graphqlUrl) {
  console.error("NEXT_PUBLIC_WP_GRAPHQL_URL is not set.");
  process.exit(1);
}

const LOGIN_MUTATION = `
  mutation ProbeLogin($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        email
      }
    }
  }
`;

const REFRESH_MUTATION = `
  mutation ProbeRefresh($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

async function graphqlRequest(query, variables) {
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  return { status: response.status, payload };
}

console.log("Mantriva — WPGraphQL JWT verification\n");
console.log(`GraphQL: ${graphqlUrl}\n`);

const probeUsername = testUsername || "jwt-probe@example.com";
const probePassword = testPassword || "invalid-password";

const { status, payload } = await graphqlRequest(LOGIN_MUTATION, {
  username: probeUsername,
  password: probePassword,
});

const errors = payload.errors ?? [];
const message = errors[0]?.message ?? "none";

console.log("--- login mutation ---");
console.log(`HTTP: ${status}`);
console.log(`Credentials: ${testUsername ? "WP_TEST_LOGIN_USERNAME" : "probe (invalid)"}`);

if (errors.length) {
  console.log(`Error: ${message}`);
} else if (payload.data?.login?.authToken) {
  console.log("Success: authToken received");
  console.log(`User: ${payload.data.login.user?.email ?? "unknown"}`);

  const refreshToken = payload.data.login.refreshToken;
  if (refreshToken) {
    const refresh = await graphqlRequest(REFRESH_MUTATION, {
      refreshToken,
    });
    if (refresh.payload.data?.refreshJwtAuthToken?.authToken) {
      console.log("\n--- refreshJwtAuthToken mutation ---");
      console.log("Success: new authToken received");
    } else {
      const refreshError = refresh.payload.errors?.[0]?.message;
      console.log("\n--- refreshJwtAuthToken mutation ---");
      console.log(`Failed: ${refreshError ?? "no token returned"}`);
    }
  }
}

const jwtMisconfigured = /JWT Auth is not configured correctly/i.test(message);

if (jwtMisconfigured) {
  console.log("\nWordPress WPGraphQL JWT plugin needs GRAPHQL_JWT_AUTH_SECRET_KEY in wp-config.php");
  console.log("(above /* That's all, stop editing! */)\n");
  console.log("  define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'long-random-secret');\n");
  console.log("Salt generator: https://api.wordpress.org/secret-key/1.1/salt/\n");
  console.log("Or deploy: wordpress/mantriva-graphql-jwt.php → wp-content/mu-plugins/\n");
  process.exit(1);
}

if (testUsername && payload.data?.login?.authToken) {
  console.log("\nLogin verified for existing WordPress user.");
  process.exit(0);
}

if (!testUsername && /invalid username|incorrect password|wrong/i.test(message)) {
  console.log("\nGraphQL login works. Invalid credentials rejected (expected).");
  console.log(
    "Test a real user: WP_TEST_LOGIN_USERNAME=email WP_TEST_LOGIN_PASSWORD=pass npm run verify:jwt",
  );
  process.exit(0);
}

if (errors.length) {
  console.log("\nUnexpected GraphQL error:");
  console.log(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log("\nProbe completed.");
process.exit(0);
