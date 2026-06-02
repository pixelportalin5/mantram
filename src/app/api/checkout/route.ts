import { NextResponse } from "next/server";

import { readSession } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_WP_BACKEND_URL;

type Item = { databaseId: number; quantity: number };

function isItem(value: unknown): value is Item {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.databaseId === "number" &&
    typeof v.quantity === "number" &&
    v.quantity > 0
  );
}

export async function POST(request: Request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Checkout backend is not configured." },
      { status: 500 },
    );
  }

  let payload: { items?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const items = Array.isArray(payload.items)
    ? payload.items.filter(isItem)
    : [];

  const session = await readSession();

  const url = new URL("/checkout/", BACKEND_URL);

  if (items.length) {
    const cartSync = items
      .map((item) => `${item.databaseId}:${item.quantity}`)
      .join(",");
    url.searchParams.set("cart_sync", cartSync);
  }

  // Attach the authenticated user's JWT so WordPress can resolve the active
  // WooCommerce customer and link the resulting order to their account.
  // WPGraphQL JWT Authentication validates this token via the
  // `?auth_token=<jwt>` query parameter (see plugin documentation).
  if (session?.authToken) {
    url.searchParams.set("auth_token", session.authToken);
    if (session.user?.email) {
      url.searchParams.set("customer_email", session.user.email);
    }
  }

  return NextResponse.json({ url: url.toString() });
}
