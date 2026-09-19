import { queryOptions } from "@tanstack/react-query";
import {
  getCampaignStats,
  getInsightBySlug,
  getProductBySlug,
  listCategories,
  listFaqs,
  listInsights,
  listProducts,
  listReviews,
} from "./public.functions";

export const productsQuery = (opts: { featured?: boolean; upcoming?: boolean } = {}) =>
  queryOptions({ queryKey: ["products", opts], queryFn: () => listProducts({ data: opts }), staleTime: 60_000 });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProductBySlug({ data: { slug } }), staleTime: 60_000 });

export const categoriesQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories(), staleTime: 300_000 });

export const reviewsQuery = queryOptions({ queryKey: ["reviews"], queryFn: () => listReviews(), staleTime: 60_000 });

export const faqsQuery = (category?: string) =>
  queryOptions({ queryKey: ["faqs", category ?? "all"], queryFn: () => listFaqs({ data: { category } }), staleTime: 60_000 });

export const insightsQuery = queryOptions({ queryKey: ["insights"], queryFn: () => listInsights(), staleTime: 60_000 });

export const insightQuery = (slug: string) =>
  queryOptions({ queryKey: ["insight", slug], queryFn: () => getInsightBySlug({ data: { slug } }), staleTime: 60_000 });

export const campaignStatsQuery = queryOptions({
  queryKey: ["campaign-stats"],
  queryFn: () => getCampaignStats({ data: {} }),
  staleTime: 30_000,
});
