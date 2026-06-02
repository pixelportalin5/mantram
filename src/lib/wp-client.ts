type GraphQLError = { message: string };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

if (!WP_GRAPHQL_URL && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_WP_GRAPHQL_URL is not configured.");
}

export class GraphQLClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "GraphQLClientError";
  }
}

export async function wpRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  authToken?: string | null,
): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new GraphQLClientError("WPGraphQL endpoint is not configured.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
  } catch {
    throw new GraphQLClientError("Network error. Please try again.");
  }

  let payload: GraphQLResponse<T>;
  try {
    payload = (await response.json()) as GraphQLResponse<T>;
  } catch {
    throw new GraphQLClientError("Unexpected response from the server.");
  }

  if (payload.errors?.length) {
    const first = payload.errors[0];
    const cleaned = first.message.replace(/<[^>]*>/g, "").trim();
    throw new GraphQLClientError(cleaned || "Request failed.");
  }

  if (!payload.data) {
    throw new GraphQLClientError("The server returned an empty response.");
  }

  return payload.data;
}
