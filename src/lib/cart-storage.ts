import type { AuthUser } from "@/lib/auth-types";

export type CartItem = {
  databaseId: number;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
  slug?: string;
  categoryName?: string;
};

export const GUEST_CART_KEY = "cart:guest";
const LEGACY_CART_KEY = "luxury_cart";

const CART_DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.AUTH_EXPOSE_BACKEND_ERRORS === "true";

/** Stable localStorage key per cart owner. */
export function getCartOwnerKey(user: AuthUser | null): string {
  if (!user) {
    return GUEST_CART_KEY;
  }

  if (user.databaseId) {
    return `cart:user:${user.databaseId}`;
  }

  if (user.email) {
    return `cart:user:${user.email.toLowerCase()}`;
  }

  return `cart:user:${user.id}`;
}

export function getCartUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return String(user.databaseId ?? user.email ?? user.id);
}

function migrateLegacyCart(): void {
  if (typeof window === "undefined") return;

  const legacy = window.localStorage.getItem(LEGACY_CART_KEY);
  if (!legacy) return;

  try {
    const parsed = JSON.parse(legacy) as CartItem[];
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(LEGACY_CART_KEY);
      return;
    }

    const existingGuest = readCartFromKey(GUEST_CART_KEY);
    if (existingGuest.length === 0 && parsed.length > 0) {
      writeCartToKey(GUEST_CART_KEY, parsed);
    }
  } catch {
    // discard corrupt legacy cart
  }

  window.localStorage.removeItem(LEGACY_CART_KEY);
}

function readCartFromKey(key: string): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCartToKey(key: string, items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function readCart(key: string): CartItem[] {
  migrateLegacyCart();
  return readCartFromKey(key);
}

export function writeCart(key: string, items: CartItem[]): void {
  writeCartToKey(key, items);
}

export function removeCart(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function mergeCartItems(
  base: CartItem[],
  incoming: CartItem[],
): CartItem[] {
  const merged = base.map((item) => ({ ...item }));

  for (const item of incoming) {
    const existing = merged.find(
      (entry) => entry.databaseId === item.databaseId,
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }

  return merged;
}

export function logCartState(
  user: AuthUser | null,
  cartOwner: string,
  items: CartItem[],
): void {
  if (!CART_DEBUG) return;

  console.log("Current User", getCartUserId(user));
  console.log("Cart Owner", cartOwner);
  console.log("Cart Items", items);
}
