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

import type { AuthUser, CustomerProfile } from "@/lib/auth-types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isWorking: boolean;
  login: (input: { username: string; password: string }) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (input: {
    key: string;
    login: string;
    password: string;
  }) => Promise<void>;
  fetchProfile: () => Promise<CustomerProfile | null>;
  saveProfile: (input: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    billing?: CustomerProfile["billing"] | null;
    shipping?: CustomerProfile["shipping"] | null;
  }) => Promise<CustomerProfile | null>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body == null ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });

  let payload: { error?: string } & Record<string, unknown> = {};
  try {
    payload = await response.json();
  } catch {
    // empty body
  }

  if (!response.ok) {
    const message =
      typeof payload.error === "string" && payload.error
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

async function putJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });

  let payload: { error?: string } & Record<string, unknown> = {};
  try {
    payload = await response.json();
  } catch {
    // empty body
  }

  if (!response.ok) {
    const message =
      typeof payload.error === "string" && payload.error
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: AuthUser | null;
};

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isReady, setIsReady] = useState(initialUser !== undefined);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (initialUser !== null) {
      setIsReady(true);
      return;
    }

    let cancelled = false;
    getJson<{ user: AuthUser | null }>("/api/auth/me")
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const refreshSession = useCallback(async () => {
    const data = await getJson<{ user: AuthUser | null }>("/api/auth/me");
    setUser(data.user);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(
    async ({ username, password }) => {
      setIsWorking(true);
      try {
        const data = await postJson<{ user: AuthUser }>("/api/auth/login", {
          username,
          password,
        });
        setUser(data.user);
      } finally {
        setIsWorking(false);
      }
    },
    [],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async ({ email, password, firstName, lastName }) => {
      setIsWorking(true);
      try {
        const data = await postJson<{ user: AuthUser }>("/api/auth/register", {
          email,
          password,
          firstName,
          lastName,
        });
        setUser(data.user);
      } finally {
        setIsWorking(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsWorking(true);
    try {
      await postJson("/api/auth/logout");
      setUser(null);
    } finally {
      setIsWorking(false);
    }
  }, []);

  const requestPasswordReset = useCallback<
    AuthContextValue["requestPasswordReset"]
  >(async (email) => {
    setIsWorking(true);
    try {
      await postJson("/api/auth/forgot-password", { email });
    } finally {
      setIsWorking(false);
    }
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(
    async ({ key, login, password }) => {
      setIsWorking(true);
      try {
        await postJson("/api/auth/reset-password", { key, login, password });
      } finally {
        setIsWorking(false);
      }
    },
    [],
  );

  const fetchProfile = useCallback<AuthContextValue["fetchProfile"]>(async () => {
    try {
      const data = await getJson<{ profile: CustomerProfile | null }>(
        "/api/account/profile",
      );
      return data.profile;
    } catch {
      return null;
    }
  }, []);

  const saveProfile = useCallback<AuthContextValue["saveProfile"]>(
    async (input) => {
      const data = await putJson<{ profile: CustomerProfile | null }>(
        "/api/account/profile",
        input,
      );
      if (data.profile) {
        setUser((current) =>
          current
            ? {
                ...current,
                firstName: data.profile?.firstName ?? current.firstName,
                lastName: data.profile?.lastName ?? current.lastName,
                email: data.profile?.email ?? current.email,
              }
            : current,
        );
      }
      return data.profile;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      isWorking,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      fetchProfile,
      saveProfile,
      refreshSession,
    }),
    [
      user,
      isReady,
      isWorking,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      fetchProfile,
      saveProfile,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
