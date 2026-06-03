import { NextResponse } from "next/server";

import {
  getTrendingCategories,
  searchSuggestions,
  type SearchCategoryHit,
  type SearchSuggestions,
} from "@/lib/graphql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_LIMIT = 6;
const CATEGORY_LIMIT = 6;
const TRENDING_LIMIT = 6;

export type SearchApiResponse =
  | ({
      mode: "suggestions";
      query: string;
    } & SearchSuggestions)
  | {
      mode: "trending";
      query: "";
      trendingCategories: SearchCategoryHit[];
    };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").trim();

  try {
    if (rawQuery.length < 2) {
      const trendingCategories = await getTrendingCategories(TRENDING_LIMIT);
      const payload: SearchApiResponse = {
        mode: "trending",
        query: "",
        trendingCategories,
      };
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    const suggestions = await searchSuggestions(rawQuery, {
      productLimit: PRODUCT_LIMIT,
      categoryLimit: CATEGORY_LIMIT,
    });

    const payload: SearchApiResponse = {
      mode: "suggestions",
      query: rawQuery,
      products: suggestions.products,
      categories: suggestions.categories,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (caught) {
    const message =
      caught instanceof Error && caught.message
        ? caught.message
        : "Search failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
