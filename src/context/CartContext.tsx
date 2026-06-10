"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { AUTH_DEBUG } from "@/lib/auth-guard";
import {
  type CartItem,
  GUEST_CART_KEY,
  getCartOwnerKey,
  logCartState,
  mergeCartItems,
  readCart,
  removeCart,
  writeCart,
} from "@/lib/cart-storage";

export type { CartItem };

type AddToCartItem = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  cartOwner: string;
  addToCart: (item: AddToCartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOwner, setCartOwner] = useState<string>(GUEST_CART_KEY);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const previousOwnerRef = useRef<string | null>(null);

  const ownerKey = useMemo(() => getCartOwnerKey(user), [user]);

  // Load / switch cart when auth identity changes.
  useEffect(() => {
    if (!authReady) return;

    const previousOwner = previousOwnerRef.current;

    if (previousOwner === null) {
      // First hydration after auth is ready.
      if (user) {
        const guestItems = readCart(GUEST_CART_KEY);
        const userItems = readCart(ownerKey);

        if (guestItems.length > 0) {
          const merged = mergeCartItems(userItems, guestItems);
          writeCart(ownerKey, merged);
          removeCart(GUEST_CART_KEY);
          setItems(merged);
        } else {
          setItems(userItems);
        }
      } else {
        setItems(readCart(GUEST_CART_KEY));
      }

      previousOwnerRef.current = ownerKey;
      setCartOwner(ownerKey);
      setIsHydrated(true);
      logCartState(user, ownerKey, readCart(ownerKey));
      return;
    }

    if (previousOwner === ownerKey) {
      return;
    }

    // Logout: signed-in → guest — clear UI cart and start fresh guest session.
    if (!user && previousOwner.startsWith("cart:user:")) {
      writeCart(GUEST_CART_KEY, []);
      setItems([]);
      setCartOwner(GUEST_CART_KEY);
      previousOwnerRef.current = GUEST_CART_KEY;
      if (AUTH_DEBUG) {
        console.log("Cart Cleared");
      }
      logCartState(null, GUEST_CART_KEY, []);
      return;
    }

    // Login: guest → user — merge guest cart into user cart, then drop guest key.
    if (user && previousOwner === GUEST_CART_KEY) {
      const guestItems = readCart(GUEST_CART_KEY);
      const userItems = readCart(ownerKey);
      const merged = mergeCartItems(userItems, guestItems);

      writeCart(ownerKey, merged);
      removeCart(GUEST_CART_KEY);
      setItems(merged);
      setCartOwner(ownerKey);
      previousOwnerRef.current = ownerKey;
      logCartState(user, ownerKey, merged);
      return;
    }

    // User switch (A → B) or other owner change — load only the new owner's cart.
    const nextItems = readCart(ownerKey);
    setItems(nextItems);
    setCartOwner(ownerKey);
    previousOwnerRef.current = ownerKey;
    logCartState(user, ownerKey, nextItems);
  }, [authReady, ownerKey, user]);

  // Persist in-memory cart to the active owner's key only.
  useEffect(() => {
    if (!isHydrated || !authReady) return;

    writeCart(cartOwner, items);
    logCartState(user, cartOwner, items);
  }, [cartOwner, items, isHydrated, authReady, user]);

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

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const updateQuantity = useCallback(
    (id: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.databaseId === id ? { ...item, quantity } : item,
        ),
      );
    },
    [removeFromCart],
  );

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + parseWooCommercePrice(item.price) * item.quantity,
        0,
      ),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
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
      cartOwner,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      itemCount,
      checkoutAction,
      isCheckingOut,
    }),
    [
      addToCart,
      cartOwner,
      cartTotal,
      checkoutAction,
      isCheckingOut,
      itemCount,
      items,
      removeFromCart,
      clearCart,
      updateQuantity,
    ],
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
