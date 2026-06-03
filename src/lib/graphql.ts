import {
  parsePriceValue as parsePriceValueImpl,
  stripHtml as stripHtmlImpl,
} from "@/lib/strings";

if (typeof window !== "undefined") {
  throw new Error(
    "[mantram] @/lib/graphql is server-only. It must not be imported, directly or transitively, by a Client Component. Use @/lib/strings for shared utilities and @/lib/wp-client for client-side GraphQL calls.",
  );
}

export type ProductImage = {
  sourceUrl: string | null;
  altText: string | null;
};

export type ProductCategorySummary = {
  id: string;
  slug: string;
  name: string;
};

export type ProductAttribute = {
  name: string | null;
  options?: string[] | null;
  visible?: boolean | null;
  variation?: boolean | null;
};

export type ProductVariationAttribute = {
  name: string | null;
  value: string | null;
};

export type ProductVariation = {
  id: string;
  databaseId: number;
  name: string;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  attributes?: {
    nodes: ProductVariationAttribute[];
  } | null;
};

export type Product = {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  image: ProductImage | null;
  price?: string | null;
  regularPrice?: string | null;
  salePrice?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  galleryImages?: {
    nodes: ProductImage[];
  } | null;
  productCategories?: {
    nodes: ProductCategorySummary[];
  } | null;
  attributes?: {
    nodes: ProductAttribute[];
  } | null;
  variations?: {
    nodes: ProductVariation[];
  } | null;
  related?: {
    nodes: Product[];
  } | null;
};

export type ProductCategory = {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  image: ProductImage | null;
  count: number | null;
};

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
};

export type ProductConnection = {
  nodes: Product[];
  pageInfo: PageInfo;
  found?: number | null;
};

export type ProductSort = "newest" | "price-asc" | "price-desc" | "best-selling" | "name";

export type ProductListingInput = {
  first?: number;
  after?: string | null;
  categoryIn?: string | null;
  sort?: ProductSort;
  minPrice?: number | null;
  maxPrice?: number | null;
  attribute?: string | null;
  search?: string | null;
};

export type PostCategory = {
  id: string;
  slug: string;
  name: string;
  count: number | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string | null;
  date: string | null;
  featuredImage: {
    node: ProductImage | null;
  } | null;
  categories?: {
    nodes: Array<{ name: string; slug: string }>;
  } | null;
};

export type WordPressPage = {
  id: string;
  title: string;
  content: string | null;
  featuredImage: {
    node: ProductImage | null;
  } | null;
};

export type SiteSettings = {
  title: string;
  description: string;
  url: string;
};

type GraphQLError = {
  message: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

function getGraphQLEndpoint(): string {
  // Literal `process.env.NEXT_PUBLIC_*` access — Next.js requires the property
  // name to be a literal (not a dynamic key) for it to inline the value.
  const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_WP_GRAPHQL_URL is not configured. Add it to .env.local at the project root and restart the dev server.",
    );
  }

  return endpoint;
}

async function graphQLRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const endpoint = getGraphQLEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(
      `WPGraphQL request failed with ${response.status} ${response.statusText}.`,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("\n"));
  }

  if (!payload.data) {
    throw new Error("WPGraphQL returned an empty response.");
  }

  return payload.data;
}

export const PRODUCT_FIELDS = `
  id
  databaseId
  slug
  name
  image {
    sourceUrl
    altText
  }
  ... on SimpleProduct {
    price
    regularPrice
    salePrice
    galleryImages {
      nodes {
        sourceUrl
        altText
      }
    }
  }
  ... on VariableProduct {
    price
    regularPrice
    salePrice
    galleryImages {
      nodes {
        sourceUrl
        altText
      }
    }
  }
  ... on ExternalProduct {
    price
    regularPrice
    salePrice
    galleryImages {
      nodes {
        sourceUrl
        altText
      }
    }
  }
  ... on GroupProduct {
    galleryImages {
      nodes {
        sourceUrl
        altText
      }
    }
  }
`;

export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String, $categoryIn: [String], $orderby: [ProductsOrderbyInput], $search: String) {
    products(first: $first, after: $after, where: { categoryIn: $categoryIn, orderby: $orderby, search: $search }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
        ... on SimpleProduct {
          attributes {
            nodes {
              name
              options
              visible
              variation
            }
          }
        }
        ... on VariableProduct {
          attributes {
            nodes {
              name
              options
              visible
              variation
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      found
    }
  }
`;

export const GET_FEATURED_PRODUCTS = `
  query GetFeaturedProducts($first: Int!) {
    products(first: $first, where: { featured: true }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
    }
  }
`;

export const GET_LATEST_PRODUCTS = `
  query GetLatestProducts($first: Int!) {
    products(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_CATEGORIES = `
  query GetProductCategories($first: Int!) {
    productCategories(first: $first, where: { hideEmpty: false }) {
      nodes {
        id
        databaseId
        slug
        name
        count
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_HOME_QUERY = `
  query GetHomeData {
    featuredHeroProducts: products(first: 1, where: { featured: true }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
    }
    heroProducts: products(first: 1, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
    }
    bestSellers: products(first: 8, where: { orderby: { field: TOTAL_SALES, order: DESC } }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
      found
    }
    featuredProducts: products(first: 8, where: { featured: true }) {
      nodes {
        ${PRODUCT_FIELDS}
        productCategories {
          nodes {
            id
            slug
            name
          }
        }
      }
    }
    categories: productCategories(first: 80, where: { hideEmpty: false }) {
      nodes {
        id
        databaseId
        slug
        name
        count
        image {
          sourceUrl
          altText
        }
      }
    }
    posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        excerpt
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
    generalSettings {
      title
      description
      url
    }
  }
`;

function getProductsOrderBy(sort: ProductSort = "newest") {
  switch (sort) {
    case "price-asc":
      return [{ field: "PRICE", order: "ASC" }];
    case "price-desc":
      return [{ field: "PRICE", order: "DESC" }];
    case "best-selling":
      return [{ field: "TOTAL_SALES", order: "DESC" }];
    case "name":
      return [{ field: "NAME", order: "ASC" }];
    case "newest":
    default:
      return [{ field: "DATE", order: "DESC" }];
  }
}

export const stripHtml = stripHtmlImpl;
export const parsePriceValue = parsePriceValueImpl;

function filterProducts(
  products: Product[],
  minPrice?: number | null,
  maxPrice?: number | null,
  attribute?: string | null,
): Product[] {
  return products.filter((product) => {
    const parsedPrice = parsePriceValue(product.price);
    const withinMin = minPrice == null || parsedPrice == null || parsedPrice >= minPrice;
    const withinMax = maxPrice == null || parsedPrice == null || parsedPrice <= maxPrice;
    const matchesAttribute =
      !attribute ||
      product.attributes?.nodes.some((productAttribute) =>
        productAttribute.options?.some(
          (option) => option.toLowerCase() === attribute.toLowerCase(),
        ),
      );

    return withinMin && withinMax && matchesAttribute;
  });
}

export async function getProducts(
  limit: number,
  categoryIn?: string,
): Promise<Product[]> {
  const data = await graphQLRequest<{
    products: ProductConnection | null;
  }>(GET_PRODUCTS_QUERY, {
    first: limit,
    after: null,
    categoryIn: categoryIn ? [categoryIn] : null,
    orderby: getProductsOrderBy(),
  });

  return data.products?.nodes ?? [];
}

export async function getProductListing({
  first = 12,
  after = null,
  categoryIn = null,
  sort = "newest",
  minPrice = null,
  maxPrice = null,
  attribute = null,
  search = null,
}: ProductListingInput = {}): Promise<ProductConnection> {
  const data = await graphQLRequest<{
    products: ProductConnection | null;
  }>(GET_PRODUCTS_QUERY, {
    first,
    after,
    categoryIn: categoryIn ? [categoryIn] : null,
    orderby: getProductsOrderBy(sort),
    search: search ?? null,
  });

  const connection = data.products ?? {
    nodes: [],
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
    found: 0,
  };

  return {
    ...connection,
    nodes: filterProducts(connection.nodes, minPrice, maxPrice, attribute),
  };
}

export async function getFeaturedProducts(limit: number): Promise<Product[]> {
  const data = await graphQLRequest<{
    products: {
      nodes: Product[];
    } | null;
  }>(GET_FEATURED_PRODUCTS, {
    first: limit,
  });

  return data.products?.nodes ?? [];
}

export async function getLatestProducts(limit: number): Promise<Product[]> {
  const data = await graphQLRequest<{
    products: {
      nodes: Product[];
    } | null;
  }>(GET_LATEST_PRODUCTS, {
    first: limit,
  });

  return data.products?.nodes ?? [];
}

export async function getProductCategories(
  limit: number,
): Promise<ProductCategory[]> {
  const data = await graphQLRequest<{
    productCategories: {
      nodes: ProductCategory[];
    } | null;
  }>(GET_PRODUCT_CATEGORIES, {
    first: limit,
  });

  return data.productCategories?.nodes ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await graphQLRequest<{
    product: Product | null;
  }>(
    `
      query GetProductBySlug($slug: ID!) {
        product(id: $slug, idType: SLUG) {
          ${PRODUCT_FIELDS}
          shortDescription
          description
          productCategories {
            nodes {
              id
              slug
              name
            }
          }
          ... on SimpleProduct {
            attributes {
              nodes {
                name
                options
                visible
                variation
              }
            }
          }
          ... on VariableProduct {
            attributes {
              nodes {
                name
                options
                visible
                variation
              }
            }
            variations(first: 50) {
              nodes {
                id
                databaseId
                name
                price
                regularPrice
                salePrice
                attributes {
                  nodes {
                    name
                    value
                  }
                }
              }
            }
          }
          related(first: 4) {
            nodes {
              ${PRODUCT_FIELDS}
            }
          }
        }
      }
    `,
    {
      slug,
    },
  );

  return data.product;
}

export async function getHomeData(): Promise<{
  heroProduct: Product | null;
  bestSellers: Product[];
  featuredProducts: Product[];
  categories: ProductCategory[];
  posts: BlogPost[];
  settings: SiteSettings | null;
  productCount: number;
}> {
  const data = await graphQLRequest<{
    featuredHeroProducts: { nodes: Product[] } | null;
    heroProducts: { nodes: Product[] } | null;
    bestSellers: { nodes: Product[]; found?: number | null } | null;
    featuredProducts: { nodes: Product[] } | null;
    categories: { nodes: ProductCategory[] } | null;
    posts: { nodes: BlogPost[] } | null;
    generalSettings: SiteSettings | null;
  }>(GET_HOME_QUERY);

  return {
    heroProduct:
      data.featuredHeroProducts?.nodes.find((product) => product.image?.sourceUrl) ??
      data.heroProducts?.nodes.find((product) => product.image?.sourceUrl) ??
      data.featuredHeroProducts?.nodes[0] ??
      data.heroProducts?.nodes[0] ??
      null,
    bestSellers: data.bestSellers?.nodes ?? [],
    featuredProducts: data.featuredProducts?.nodes ?? [],
    categories: data.categories?.nodes ?? [],
    posts: data.posts?.nodes ?? [],
    settings: data.generalSettings,
    productCount: data.bestSellers?.found ?? 0,
  };
}

const POST_FIELDS = `
  id
  slug
  title
  excerpt
  date
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
  categories(first: 3) {
    nodes {
      name
      slug
    }
  }
`;

export async function getLatestPosts(limit: number): Promise<BlogPost[]> {
  const data = await graphQLRequest<{
    posts: { nodes: BlogPost[] } | null;
  }>(
    `
      query GetLatestPosts($first: Int!) {
        posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            ${POST_FIELDS}
          }
        }
      }
    `,
    {
      first: limit,
    },
  );

  return data.posts?.nodes ?? [];
}

export async function getPosts(input: {
  first?: number;
  categorySlug?: string | null;
  excludeIds?: number[];
} = {}): Promise<BlogPost[]> {
  const { first = 12, categorySlug = null, excludeIds = [] } = input;

  const data = await graphQLRequest<{
    posts: { nodes: BlogPost[] } | null;
  }>(
    `
      query GetPosts($first: Int!, $categoryName: String, $notIn: [ID]) {
        posts(
          first: $first,
          where: {
            orderby: { field: DATE, order: DESC },
            categoryName: $categoryName,
            notIn: $notIn
          }
        ) {
          nodes {
            ${POST_FIELDS}
          }
        }
      }
    `,
    {
      first,
      categoryName: categorySlug,
      notIn: excludeIds.length ? excludeIds : null,
    },
  );

  return data.posts?.nodes ?? [];
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  // The "featured" article on Editorial is the most recently published post.
  // (WPGraphQL's `onlySticky` arg isn't exposed on every WP install, so we
  //  avoid depending on it.)
  try {
    const data = await graphQLRequest<{
      latest: { nodes: BlogPost[] } | null;
    }>(
      `
        query GetFeaturedPost {
          latest: posts(first: 1, where: { orderby: { field: DATE, order: DESC } }) {
            nodes {
              ${POST_FIELDS}
            }
          }
        }
      `,
    );
    return data.latest?.nodes[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPostCategories(limit = 20): Promise<PostCategory[]> {
  const data = await graphQLRequest<{
    categories: { nodes: PostCategory[] } | null;
  }>(
    `
      query GetPostCategories($first: Int!) {
        categories(first: $first, where: { hideEmpty: true }) {
          nodes {
            id
            slug
            name
            count
          }
        }
      }
    `,
    {
      first: limit,
    },
  );

  return data.categories?.nodes ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const data = await graphQLRequest<{
    post: BlogPost | null;
  }>(
    `
      query GetPostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          slug
          title
          excerpt
          content
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    `,
    {
      slug,
    },
  );

  return data.post;
}

export async function getPageByUri(uri: string): Promise<WordPressPage | null> {
  const data = await graphQLRequest<{
    page: WordPressPage | null;
  }>(
    `
      query GetPageByUri($uri: ID!) {
        page(id: $uri, idType: URI) {
          id
          title
          content
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    `,
    {
      uri,
    },
  );

  return data.page;
}

export type SearchProductHit = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: ProductImage | null;
  price: string | null;
  category: { name: string; slug: string } | null;
};

export type SearchCategoryHit = {
  id: string;
  slug: string;
  name: string;
  count: number | null;
};

export type SearchSuggestions = {
  products: SearchProductHit[];
  categories: SearchCategoryHit[];
};

type RawSearchProduct = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: ProductImage | null;
  price?: string | null;
  productCategories?: { nodes: Array<{ name: string; slug: string }> } | null;
};

const SEARCH_SUGGESTIONS_QUERY = `
  query SearchSuggestions($q: String!, $productLimit: Int!, $categoryLimit: Int!) {
    products(first: $productLimit, where: { search: $q, status: "publish" }) {
      nodes {
        id
        databaseId
        name
        slug
        image {
          sourceUrl
          altText
        }
        productCategories(first: 1) {
          nodes {
            name
            slug
          }
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
    productCategories(first: $categoryLimit, where: { search: $q, hideEmpty: true }) {
      nodes {
        id
        slug
        name
        count
      }
    }
  }
`;

const TRENDING_QUERY = `
  query TrendingCategories($limit: Int!) {
    productCategories(first: $limit, where: { hideEmpty: true, orderby: COUNT, order: DESC }) {
      nodes {
        id
        slug
        name
        count
      }
    }
  }
`;

function mapSearchProduct(product: RawSearchProduct): SearchProductHit {
  const category = product.productCategories?.nodes?.[0] ?? null;
  return {
    id: product.id,
    databaseId: product.databaseId,
    name: product.name,
    slug: product.slug,
    image: product.image,
    price: product.price ?? null,
    category: category ? { name: category.name, slug: category.slug } : null,
  };
}

export async function searchSuggestions(
  query: string,
  options: { productLimit?: number; categoryLimit?: number } = {},
): Promise<SearchSuggestions> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { products: [], categories: [] };
  }

  const data = await graphQLRequest<{
    products: { nodes: RawSearchProduct[] } | null;
    productCategories: { nodes: SearchCategoryHit[] } | null;
  }>(SEARCH_SUGGESTIONS_QUERY, {
    q: trimmed,
    productLimit: options.productLimit ?? 6,
    categoryLimit: options.categoryLimit ?? 6,
  });

  return {
    products: (data.products?.nodes ?? []).map(mapSearchProduct),
    categories: data.productCategories?.nodes ?? [],
  };
}

export async function getTrendingCategories(limit = 6): Promise<SearchCategoryHit[]> {
  try {
    const data = await graphQLRequest<{
      productCategories: { nodes: SearchCategoryHit[] } | null;
    }>(TRENDING_QUERY, { limit });
    return data.productCategories?.nodes ?? [];
  } catch {
    // Fallback for stores that don't expose COUNT orderby on term connections
    return getProductCategories(limit);
  }
}
