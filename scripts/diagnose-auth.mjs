/**
 * Full Mantriva auth diagnostic — prints REAL WordPress backend responses.
 *
 * Usage: node scripts/diagnose-auth.mjs [username] [password]
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
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
const backendUrl = process.env.NEXT_PUBLIC_WP_BACKEND_URL || "https://mantriva.in";
const username = process.argv[2] || "TestUser001";
const password = process.argv[3] || "invalid-password-probe";

const LOGIN = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user { id email firstName lastName }
    }
  }
`;

async function gql(query, variables) {
  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  return { httpStatus: res.status, body };
}

console.log("Mantriva Auth Diagnostic\n");
console.log(`GraphQL: ${graphqlUrl}`);
console.log(`Backend: ${backendUrl}`);
console.log(`Test user: ${username}\n`);

console.log("--- Auth method ---");
console.log("Active: WPGraphQL JWT Authentication (GraphQL `login` mutation)");
console.log("NOT used: REST /wp-json/jwt-auth/v1/token\n");

const healthUrl = `${backendUrl.replace(/\/$/, "")}/wp-json/mantriva/v1/auth-health`;
const healthRes = await fetch(healthUrl);
console.log("--- WordPress auth-health ---");
console.log(`GET ${healthUrl}`);
console.log(`HTTP ${healthRes.status}`);
if (healthRes.ok) {
  console.log(JSON.stringify(await healthRes.json(), null, 2));
} else {
  console.log(
    "Plugin not installed. Upload wordpress/mantriva-headless-auth.zip via WP Admin → Plugins.",
  );
}

console.log("\n--- GraphQL login mutation (REAL backend response) ---");
const login = await gql(LOGIN, { username, password });
console.log(`HTTP ${login.httpStatus}`);
console.log(JSON.stringify(login.body, null, 2));

const err = login.body.errors?.[0]?.message;
if (/JWT Auth is not configured correctly/i.test(err || "")) {
  console.log("\nROOT CAUSE: GRAPHQL_JWT_AUTH_SECRET_KEY is missing on WordPress.");
  console.log("FIX: Install Mantriva Headless Auth plugin from wordpress/mantriva-headless-auth.zip");
  process.exit(1);
}

if (login.body.data?.login?.authToken) {
  console.log("\nLOGIN SUCCESS — JWT issued by WordPress.");
  process.exit(0);
}

if (/invalid username|incorrect password/i.test(err || "")) {
  console.log("\nJWT is configured. Credentials rejected (expected if password wrong).");
  process.exit(0);
}

process.exit(1);
