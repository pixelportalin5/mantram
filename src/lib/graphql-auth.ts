if (typeof window !== "undefined") {
  throw new Error(
    "[mantriva] @/lib/graphql-auth is server-only. It must not be imported from a Client Component or client-side bundle.",
  );
}

/**
 * WordPress authentication via WPGraphQL JWT Authentication + WooGraphQL customer.
 */

import { AUTH_ERRORS } from "@/lib/auth-errors";
import type {
  AuthUser,
  CustomerAddress,
  CustomerProfile,
} from "@/lib/auth-types";
import { GraphQLClientError, wpRequest } from "@/lib/wp-client";

/** WPGraphQL JWT Authentication — primary sign-in mutation */
export const GRAPHQL_LOGIN_MUTATION = `
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

export type GraphQLSessionPayload = {
  authToken: string;
  refreshToken: string | null;
  user: AuthUser;
};

const REGISTER_CUSTOMER_MUTATION = `
  mutation RegisterCustomer(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    registerCustomer(
      input: {
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      customer {
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

/** WooGraphQL — profile + addresses (no nested orders). */
const CUSTOMER_PROFILE_QUERY = `
  query CustomerProfile {
    customer {
      id
      databaseId
      email
      firstName
      lastName
      displayName
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
    }
  }
`;

/** WooGraphQL — orders with line items (separate query for easier failure isolation). */
const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders {
    customer {
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
              quantity
              total
              product {
                node {
                  id
                  name
                  slug
                  ... on Product {
                    image {
                      sourceUrl
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ENSURE_CUSTOMER_MUTATION = `
  mutation EnsureCustomer($email: String) {
    updateCustomer(input: { email: $email }) {
      customer {
        id
        databaseId
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

/**
 * Links the authenticated WP user to a WooCommerce customer record.
 * Users created via registerUser may lack a WC customer — customer queries then fail.
 */
export async function graphqlEnsureCustomer(
  authToken: string,
  email?: string | null,
): Promise<void> {
  try {
    await wpRequest(ENSURE_CUSTOMER_MUTATION, { email: email ?? null }, authToken);
  } catch (error) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.warn("[graphql-auth] ensureCustomer failed (non-fatal):", error);
    }
  }
}

export async function graphqlLogin(
  username: string,
  password: string,
): Promise<GraphQLSessionPayload> {
  const data = await wpRequest<{
    login: {
      authToken: string | null;
      refreshToken: string | null;
      user: AuthUser | null;
    } | null;
  }>(GRAPHQL_LOGIN_MUTATION, { username, password });

  if (!data.login?.authToken || !data.login?.user) {
    throw new GraphQLClientError(
      AUTH_ERRORS.invalidCredentials,
      "login returned no authToken or user",
    );
  }

  const session: GraphQLSessionPayload = {
    authToken: data.login.authToken,
    refreshToken: data.login.refreshToken ?? null,
    user: data.login.user,
  };

  await graphqlEnsureCustomer(session.authToken, session.user.email);

  return session;
}

export type GraphQLRegisterResult =
  | { status: "authenticated"; session: GraphQLSessionPayload }
  | { status: "registered"; email: string };

export async function graphqlRegister(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<GraphQLRegisterResult> {
  try {
    await wpRequest(REGISTER_CUSTOMER_MUTATION, {
      email: input.email,
      password: input.password,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    });
  } catch (registerCustomerError) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.warn(
        "[graphql-auth] registerCustomer failed, user may already exist:",
        registerCustomerError,
      );
    }
  }

  try {
    const session = await graphqlLogin(input.email, input.password);
    return { status: "authenticated", session };
  } catch {
    return { status: "registered", email: input.email };
  }
}

export async function graphqlForgotPassword(username: string): Promise<void> {
  await wpRequest(FORGOT_PASSWORD_MUTATION, { username });
}

export async function graphqlResetPassword(input: {
  key: string;
  login: string;
  password: string;
}): Promise<void> {
  await wpRequest(RESET_PASSWORD_MUTATION, input);
}

export async function graphqlFetchViewer(
  authToken: string,
): Promise<AuthUser | null> {
  try {
    const data = await wpRequest<{ viewer: AuthUser | null }>(
      VIEWER_QUERY,
      undefined,
      authToken,
    );
    return data.viewer;
  } catch (error) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.error("[graphql-auth] fetchViewer failed:", error);
    }
    return null;
  }
}

export async function graphqlFetchCustomer(
  authToken: string,
): Promise<CustomerProfile | null> {
  if (!authToken) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.error("[graphql-auth] fetchCustomer: missing authToken");
    }
    return null;
  }

  let profile: CustomerProfile | null = null;

  try {
    const data = await wpRequest<{ customer: CustomerProfile | null }>(
      CUSTOMER_PROFILE_QUERY,
      undefined,
      authToken,
    );
    profile = data.customer;
  } catch (profileError) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.error("[graphql-auth] customer profile query failed:", profileError);
    }

    await graphqlEnsureCustomer(authToken);

    try {
      const retry = await wpRequest<{ customer: CustomerProfile | null }>(
        CUSTOMER_PROFILE_QUERY,
        undefined,
        authToken,
      );
      profile = retry.customer;
    } catch (retryError) {
      if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
        console.error("[graphql-auth] customer profile retry failed:", retryError);
      }
    }
  }

  if (!profile || profile.id === "guest") {
    const viewer = await graphqlFetchViewer(authToken);
    if (!viewer) return null;

    profile = {
      ...viewer,
      username: viewer.email?.split("@")[0] ?? null,
      billing: null,
      shipping: null,
      orders: { nodes: [] },
    };
  }

  try {
    const ordersData = await wpRequest<{
      customer: { orders: CustomerProfile["orders"] } | null;
    }>(CUSTOMER_ORDERS_QUERY, undefined, authToken);

    if (ordersData.customer?.orders) {
      profile = { ...profile, orders: ordersData.customer.orders };
    }
  } catch (ordersError) {
    if (process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true") {
      console.error("[graphql-auth] customer orders query failed:", ordersError);
    }
    if (!profile.orders) {
      profile = { ...profile, orders: { nodes: [] } };
    }
  }

  return profile;
}

export async function graphqlUpdateCustomer(
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

export async function graphqlRefreshAuthToken(
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
