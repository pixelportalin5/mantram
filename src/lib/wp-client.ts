/**
 * GraphQL client for WordPress (WPGraphQL + WooGraphQL + WPGraphQL JWT).
 */
import { AUTH_ERRORS, mapAuthErrorMessage } from "@/lib/auth-errors";

type GraphQLError = {
  message?: string;
  extensions?: Record<string, unknown>;
  path?: string[];
  locations?: unknown;
};

type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;
const AUTH_DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true";

if (!WP_GRAPHQL_URL && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_WP_GRAPHQL_URL is not configured.");
}

export class GraphQLClientError extends Error {
  readonly rawMessage: string;
  readonly graphqlErrors?: GraphQLError[];

  constructor(
    userMessage: string,
    rawMessage: string,
    public readonly httpStatus?: number,
    graphqlErrors?: GraphQLError[],
  ) {
    super(userMessage);
    this.name = "GraphQLClientError";
    this.rawMessage = rawMessage;
    this.graphqlErrors = graphqlErrors;
  }
}

function formatGraphQLFailure(
  status: number,
  json: GraphQLResponse<unknown>,
): string {
  return JSON.stringify(
    {
      status,
      errors: json?.errors,
      data: json?.data,
    },
    null,
    2,
  );
}

export async function wpRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  authToken?: string | null,
): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new GraphQLClientError(
      AUTH_ERRORS.generic,
      "NEXT_PUBLIC_WP_GRAPHQL_URL is not configured.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (AUTH_DEBUG) {
    console.log("GRAPHQL REQUEST");
    console.log({
      endpoint: WP_GRAPHQL_URL,
      query: query.trim().slice(0, 200),
      variables,
      headers: {
        ...headers,
        Authorization: headers.Authorization
          ? `Bearer ${authToken?.slice(0, 12)}…${authToken?.slice(-8)}`
          : undefined,
      },
    });
    console.log("AUTH TOKEN", authToken ? `${authToken.slice(0, 12)}…` : null);
    console.log("AUTH HEADER", headers.Authorization ?? "none");
  }

  let response: Response;
  try {
    response = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
  } catch (cause) {
    const raw =
      cause instanceof Error ? cause.message : "Network request failed";
    if (AUTH_DEBUG) {
      console.error("[wp-client] network error:", raw);
    }
    throw new GraphQLClientError(AUTH_ERRORS.network, raw);
  }

  let payload: GraphQLResponse<T>;
  try {
    payload = (await response.json()) as GraphQLResponse<T>;
  } catch {
    throw new GraphQLClientError(
      AUTH_ERRORS.generic,
      "Response was not valid JSON.",
      response.status,
    );
  }

  if (AUTH_DEBUG) {
    console.log("GRAPHQL RESPONSE");
    console.log(response.status);
    console.log("GRAPHQL JSON");
    console.dir(payload, { depth: null });
  }

  if (payload.errors?.length) {
    const first = payload.errors[0];
    const raw =
      (first.message ?? "").replace(/<[^>]*>/g, "").trim() ||
      formatGraphQLFailure(response.status, payload);

    if (AUTH_DEBUG) {
      console.error("[wp-client] GraphQL errors:", payload.errors);
    }

    const userMessage = mapAuthErrorMessage(raw);
    const debugPayload = formatGraphQLFailure(response.status, payload);

    throw new GraphQLClientError(
      AUTH_DEBUG ? debugPayload : userMessage,
      raw,
      response.status,
      payload.errors,
    );
  }

  if (!payload.data) {
    const debugPayload = formatGraphQLFailure(response.status, payload);
    throw new GraphQLClientError(
      AUTH_DEBUG ? debugPayload : AUTH_ERRORS.generic,
      "GraphQL response contained no data.",
      response.status,
    );
  }

  return payload.data;
}
