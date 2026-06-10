import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s+()\-.]{7,20}$/;

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string;
};

type FieldError = { field: string; message: string };

function validate(input: Record<string, unknown>): {
  data?: ContactPayload;
  errors: FieldError[];
} {
  const errors: FieldError[] = [];

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const subject =
    typeof input.subject === "string" ? input.subject.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const honeypot =
    typeof input.honeypot === "string" ? input.honeypot.trim() : "";

  if (honeypot) {
    // Silent bot rejection.
    return {
      errors: [{ field: "honeypot", message: "Submission rejected." }],
    };
  }

  if (name.length < 2 || name.length > 80) {
    errors.push({ field: "name", message: "Please enter your full name." });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.push({
      field: "email",
      message: "A valid email address is required.",
    });
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.push({
      field: "phone",
      message: "Phone number format is not recognised.",
    });
  }

  if (subject.length < 2 || subject.length > 120) {
    errors.push({ field: "subject", message: "Please add a brief subject." });
  }

  if (message.length < 10 || message.length > 2000) {
    errors.push({
      field: "message",
      message: "Message must be between 10 and 2000 characters.",
    });
  }

  if (errors.length) {
    return { errors };
  }

  return {
    errors: [],
    data: {
      name,
      email,
      phone: phone || undefined,
      subject,
      message,
    },
  };
}

async function forwardToWebhook(payload: ContactPayload): Promise<boolean> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) return true; // Nothing to forward to — treat as no-op success.

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "mantriva-storefront",
        receivedAt: new Date().toISOString(),
        ...payload,
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { data, errors } = validate(body);

  if (errors.length || !data) {
    const honeypotHit = errors.some((error) => error.field === "honeypot");
    if (honeypotHit) {
      // Pretend success so bots don't probe further.
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: errors[0]?.message ?? "Invalid submission.", fields: errors },
      { status: 400 },
    );
  }

  const forwarded = await forwardToWebhook(data);

  if (!forwarded) {
    return NextResponse.json(
      {
        error:
          "Your message couldn't be delivered. Please email us directly or try again.",
      },
      { status: 502 },
    );
  }

  // Structured server log — visible in deployment logs even when a webhook
  // isn't configured. Replaceable with a real email / CRM provider later.
  console.info("[contact] enquiry received", {
    name: data.name,
    email: data.email,
    subject: data.subject,
    hasPhone: Boolean(data.phone),
  });

  return NextResponse.json({ ok: true });
}
