import { NextResponse } from "next/server";

import {
  fetchCustomer,
  requireSession,
  updateCustomer,
} from "@/lib/auth-server";
import type { CustomerAddress } from "@/lib/auth-types";
import { GraphQLClientError } from "@/lib/wp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitiseAddress(value: unknown): CustomerAddress | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const next: CustomerAddress = {};
  const keys: Array<keyof CustomerAddress> = [
    "firstName",
    "lastName",
    "company",
    "address1",
    "address2",
    "city",
    "state",
    "postcode",
    "country",
    "email",
    "phone",
  ];
  for (const key of keys) {
    const raw = source[key];
    if (typeof raw === "string") next[key] = raw.trim();
  }
  return next;
}

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const profile = await fetchCustomer(session.authToken);
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const firstName =
    typeof payload.firstName === "string" ? payload.firstName.trim() : null;
  const lastName =
    typeof payload.lastName === "string" ? payload.lastName.trim() : null;
  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;
  const billing = sanitiseAddress(payload.billing);
  const shipping = sanitiseAddress(payload.shipping);

  try {
    await updateCustomer(session.authToken, {
      firstName,
      lastName,
      email,
      billing,
      shipping,
    });
    const profile = await fetchCustomer(session.authToken);
    return NextResponse.json({ profile });
  } catch (caught) {
    const message =
      caught instanceof GraphQLClientError
        ? caught.message
        : "Could not update your profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
