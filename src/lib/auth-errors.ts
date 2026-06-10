/** User-facing messages — never expose internal JWT / WordPress plugin errors */
export const AUTH_ERRORS = {
  invalidCredentials: "Incorrect email or password.",
  noAccount: "No account found with that email.",
  signInUnavailable:
    "Sign-in is temporarily unavailable. Please try again in a few minutes.",
  network: "Unable to connect. Please try again.",
  generic: "Something went wrong. Please try again.",
  registeredWithoutSession:
    "Your account was created. Sign in with your email and password.",
} as const;

export const REGISTERED_WITHOUT_SESSION_MESSAGE =
  AUTH_ERRORS.registeredWithoutSession;

/** Client-side error with optional API `code` from /api/auth/* routes */
export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

/**
 * Map raw WordPress / GraphQL error text to a safe user-facing message.
 * WPGraphQL JWT Authentication is used via GraphQL `login` — not REST JWT.
 */
export function mapAuthErrorMessage(raw: string): string {
  const message = raw.replace(/<[^>]*>/g, "").trim();
  const lower = message.toLowerCase();

  if (!message) {
    return AUTH_ERRORS.generic;
  }

  if (
    /jwt auth is not configured correctly/i.test(message) ||
    /jwt is not configured properly/i.test(message) ||
    /graphql jwt auth secret/i.test(message) ||
    /invalid-secret-key/i.test(lower)
  ) {
    return AUTH_ERRORS.signInUnavailable;
  }

  if (
    /invalid username|incorrect password|wrong password|invalid credentials/i.test(
      lower,
    ) ||
    /password you entered for the email address is incorrect/i.test(lower)
  ) {
    return AUTH_ERRORS.invalidCredentials;
  }

  if (
    /unknown email|no user|user does not exist|invalid email address/i.test(
      lower,
    ) ||
    /there is no user registered with that email/i.test(lower)
  ) {
    return AUTH_ERRORS.noAccount;
  }

  if (/network|fetch failed|econnrefused|timeout/i.test(lower)) {
    return AUTH_ERRORS.network;
  }

  if (
    /internal server error/i.test(lower) ||
    /graphql/i.test(lower) ||
    /jwt/i.test(lower) ||
    /token/i.test(lower)
  ) {
    return AUTH_ERRORS.generic;
  }

  return message;
}
