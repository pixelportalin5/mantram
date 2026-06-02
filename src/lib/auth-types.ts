export type AuthUser = {
  id: string;
  databaseId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
};

export type AuthSession = {
  user: AuthUser;
  authToken: string;
  refreshToken: string | null;
};

export type AuthError = {
  message: string;
  code?: string;
};

export type CustomerOrder = {
  id: string;
  databaseId: number;
  orderNumber: string;
  status: string;
  date: string | null;
  total: string | null;
  lineItems: {
    nodes: Array<{
      product: {
        node: {
          id: string;
          name: string;
          slug: string;
          image: { sourceUrl: string | null; altText: string | null } | null;
        } | null;
      } | null;
      quantity: number | null;
      total: string | null;
    }>;
  } | null;
};

export type CustomerAddress = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type CustomerProfile = AuthUser & {
  username?: string | null;
  billing?: CustomerAddress | null;
  shipping?: CustomerAddress | null;
  orders?: { nodes: CustomerOrder[] } | null;
};
