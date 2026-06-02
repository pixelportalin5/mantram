"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "luxury_cart";

export type CartItem = {
  databaseId: number;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
};

type AddToCartItem = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (id: number) => void;
  cartTotal: number;
  checkoutAction: () => Promise<void>;
  isCheckingOut: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function parseWooCommercePrice(price: string): number {
  const plainText = price
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  const firstAmount = plainText.match(/[\d,.]+/)?.[0];

  if (!firstAmount) {
    return 0;
  }

  const normalizedAmount = firstAmount.replace(/,/g, "");
  const parsedAmount = Number.parseFloat(normalizedAmount);

  return Number.isFinite(parsedAmount) ? parsedAmount : 0;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart) as CartItem[];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  const addToCart = useCallback((item: AddToCartItem) => {
    const quantityToAdd = item.quantity ?? 1;

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.databaseId === item.databaseId,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.databaseId === item.databaseId
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantityToAdd,
              }
            : cartItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: quantityToAdd,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.databaseId !== id),
    );
  }, []);

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + parseWooCommercePrice(item.price) * item.quantity,
        0,
      ),
    [items],
  );

  const checkoutAction = useCallback(async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          items: items.map((item) => ({
            databaseId: item.databaseId,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Could not start checkout.");
      }

      window.location.href = payload.url;
    } finally {
      setIsCheckingOut(false);
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      cartTotal,
      checkoutAction,
      isCheckingOut,
    }),
    [addToCart, cartTotal, checkoutAction, isCheckingOut, items, removeFromCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
