"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchApiResponse } from "@/app/api/search/route";
import type {
  SearchCategoryHit,
  SearchProductHit,
} from "@/lib/graphql";

export type SearchState = {
  query: string;
  setQuery: (value: string) => void;
  reset: () => void;

  status: "idle" | "trending" | "loading" | "ready" | "error";
  products: SearchProductHit[];
  categories: SearchCategoryHit[];
  trendingCategories: SearchCategoryHit[];
  error: string | null;
  hasResults: boolean;
};

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

let trendingCache: SearchCategoryHit[] | null = null;

async function fetchSearch(
  url: string,
  signal: AbortSignal,
): Promise<SearchApiResponse> {
  const response = await fetch(url, {
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const message = `Search request failed (${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as SearchApiResponse;
}

export function useSearch(enabled = true): SearchState {
  const [query, setQueryState] = useState("");
  const [status, setStatus] = useState<SearchState["status"]>("idle");
  const [products, setProducts] = useState<SearchProductHit[]>([]);
  const [categories, setCategories] = useState<SearchCategoryHit[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<
    SearchCategoryHit[]
  >(trendingCache ?? []);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setQueryState("");
    setProducts([]);
    setCategories([]);
    setError(null);
    setStatus(trendingCache && trendingCache.length ? "trending" : "idle");
  }, [cancel]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  // Hydrate trending suggestions once when the hook is first enabled.
  useEffect(() => {
    if (!enabled) return;
    if (trendingCache && trendingCache.length) {
      setTrendingCategories(trendingCache);
      if (status === "idle") setStatus("trending");
      return;
    }

    const controller = new AbortController();
    fetchSearch("/api/search?q=", controller.signal)
      .then((data) => {
        if (data.mode !== "trending") return;
        trendingCache = data.trendingCategories;
        setTrendingCategories(data.trendingCategories);
        if (status === "idle") setStatus("trending");
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
      });

    return () => controller.abort();
    // status is intentionally captured at mount-time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const trimmed = query.trim();

    if (trimmed.length === 0) {
      cancel();
      setProducts([]);
      setCategories([]);
      setError(null);
      setStatus(trendingCategories.length ? "trending" : "idle");
      return;
    }

    if (trimmed.length < MIN_QUERY_LENGTH) {
      cancel();
      setProducts([]);
      setCategories([]);
      setError(null);
      setStatus("idle");
      return;
    }

    cancel();
    setStatus("loading");

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      fetchSearch(
        `/api/search?q=${encodeURIComponent(trimmed)}`,
        controller.signal,
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          if (data.mode !== "suggestions") return;
          setProducts(data.products);
          setCategories(data.categories);
          setError(null);
          setStatus("ready");
        })
        .catch((reason: unknown) => {
          if (reason instanceof Error && reason.name === "AbortError") return;
          setProducts([]);
          setCategories([]);
          setError(
            reason instanceof Error && reason.message
              ? reason.message
              : "Search failed. Please try again.",
          );
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // trendingCategories.length is read but not depended on for re-trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, query, cancel]);

  useEffect(() => () => cancel(), [cancel]);

  const hasResults =
    status === "ready" && (products.length > 0 || categories.length > 0);

  return {
    query,
    setQuery,
    reset,
    status,
    products,
    categories,
    trendingCategories,
    error,
    hasResults,
  };
}
