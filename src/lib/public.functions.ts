import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createPublicClient,
  enforceRateLimit,
  generateRegistrationCode,
  getClientCountry,
} from "./supabase-public.server";
import { eventSchema, feedbackSchema, leadSchema, newsletterSchema, registrationSchema } from "./validation";
import { SITE, UPCOMING_STAGES } from "./site";

const PRODUCT_COLUMNS =
  "id, slug, name, tagline, description, problem_solved, key_features, images, videos, specifications, faqs, source_country, stage, stage_label, launch_window, price_bdt, price_note, serial_ref, is_featured, sort_order, category_id, product_categories(slug, name)";

// ---------- Public reads ----------

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { featured?: boolean; upcoming?: boolean; category?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sb = createPublicClient();
    let q = sb.from("products").select(PRODUCT_COLUMNS).order("sort_order");
    if (data.featured) q = q.eq("is_featured", true);
    if (data.upcoming) q = q.in("stage", UPCOMING_STAGES as never[]);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = createPublicClient();
    const { data: product, error } = await sb.from("products").select(PRODUCT_COLUMNS).eq("slug", data.slug).maybeSingle();
    if (error) throw error;
    if (!product) return null;
    const [{ data: reviews }, { data: rel }] = await Promise.all([
      sb.from("product_reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false }),
      sb.from("product_relations").select("related_product_id").eq("product_id", product.id),
    ]);
    const relIds = (rel ?? []).map((r) => r.related_product_id);
    const { data: related } = relIds.length
      ? await sb.from("products").select("id, slug, name, tagline, images, stage, stage_label").in("id", relIds)
      : { data: [] };
    return { ...product, reviews: reviews ?? [], related: related ?? [] };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await createPublicClient().from("product_categories").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await createPublicClient()
    .from("product_reviews")
    .select("*, products(name, slug, serial_ref)")
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data ?? [];
});

export const listFaqs = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string } = {}) => input)
  .handler(async ({ data }) => {
    let q = createPublicClient().from("faqs").select("*").order("sort_order");
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const listInsights = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await createPublicClient()
    .from("insights")
    .select("id, slug, title, excerpt, cover_image, category, read_minutes, published_at")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getInsightBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().max(160) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await createPublicClient().from("insights").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw error;
    return row;
  });

export const getCampaignStats = createServerFn({ method: "GET" })
  .inputValidator((input: { slug?: string } = {}) => input)
  .handler(async ({ data }) => {
    const { data: rows, error } = await createPublicClient().rpc("get_campaign_stats", {
      _slug: data.slug ?? SITE.cohortSlug,
    });
    if (error) throw error;
    const row = rows?.[0];
    const capacity = row?.capacity ?? 100;
    const claimed = Number(row?.claimed ?? 0);
    return { capacity, claimed, remaining: Math.max(capacity - claimed, 0), status: row?.status ?? "active" };
  });

// ---------- Public writes (validated, rate-limited, admin client after checks) ----------

async function logEvent(name: string, props: Record<string, unknown>, ctx: { utm_source?: string; utm_medium?: string; utm_campaign?: string; session_id?: string; device?: string; path?: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("analytics_events").insert({
    event_name: name,
    properties: props as never,
    utm_source: ctx.utm_source ?? null,
    utm_medium: ctx.utm_medium ?? null,
    utm_campaign: ctx.utm_campaign ?? null,
    session_id: ctx.session_id ?? null,
    device: ctx.device ?? null,
    path: ctx.path ?? null,
    country: getClientCountry(),
  });
}

export const submitEarlyRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const, code: "BS-000-000", duplicate: false }; // honeypot: pretend success
    await enforceRateLimit("register", 5, 600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: campaign } = await supabaseAdmin.from("campaigns").select("id, capacity, status").eq("slug", SITE.cohortSlug).single();
    if (!campaign || campaign.status !== "active") throw new Error("This cohort is not accepting applications right now.");

    const { data: existing } = await supabaseAdmin
      .from("early_customer_registrations")
      .select("registration_code")
      .eq("campaign_id", campaign.id)
      .or(`email.eq.${data.email},phone.eq.${data.phone}`)
      .maybeSingle();
    if (existing) return { ok: true as const, code: existing.registration_code, duplicate: true };

    const { count } = await supabaseAdmin
      .from("early_customer_registrations")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .neq("status", "rejected");
    const waitlisted = (count ?? 0) >= campaign.capacity;

    let code = generateRegistrationCode("BS");
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabaseAdmin.from("early_customer_registrations").insert({
        registration_code: code,
        campaign_id: campaign.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        age_range: data.age_range ?? null,
        occupation: data.occupation ?? null,
        product_interest: data.product_interest,
        main_problem: data.main_problem ?? null,
        price_range: data.price_range ?? null,
        discovered_via: data.discovered_via ?? null,
        consent: data.consent,
        status: waitlisted ? "waitlisted" : "pending",
        source: data.source ?? "website",
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        utm_campaign: data.utm_campaign ?? null,
        referrer: data.referrer ?? null,
      });
      if (!error) break;
      if (error.code === "23505" && error.message.includes("registration_code")) {
        code = generateRegistrationCode("BS");
        continue;
      }
      if (error.code === "23505") {
        const { data: dup } = await supabaseAdmin
          .from("early_customer_registrations")
          .select("registration_code")
          .eq("campaign_id", campaign.id)
          .or(`email.eq.${data.email},phone.eq.${data.phone}`)
          .maybeSingle();
        return { ok: true as const, code: dup?.registration_code ?? code, duplicate: true };
      }
      console.error(error);
      throw new Error("We couldn't save your application. Please try again.");
    }

    await supabaseAdmin.from("leads").insert({
      category: "early_customer",
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      subject: `Cohort application ${code}`,
      message: data.main_problem ?? null,
      source: data.source ?? "website",
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      referrer: data.referrer ?? null,
    });
    await logEvent("early_customer_registered", { product_interest: data.product_interest, waitlisted }, data);
    return { ok: true as const, code, duplicate: false, waitlisted };
  });

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    await enforceRateLimit("lead", 8, 600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      category: data.category,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      company: data.company ?? null,
      country: data.country ?? null,
      subject: data.subject ?? null,
      message: data.message,
      product_id: data.product_id ?? null,
      source: data.source ?? "website",
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      referrer: data.referrer ?? null,
    });
    if (error) {
      console.error(error);
      throw new Error("We couldn't send your message. Please try again.");
    }
    await logEvent("lead_submitted", { category: data.category }, data);
    return { ok: true as const };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    await enforceRateLimit("newsletter", 6, 600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email: data.email,
        source: data.source ?? "website",
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        utm_campaign: data.utm_campaign ?? null,
        is_active: true,
      },
      { onConflict: "email" },
    );
    if (error) {
      console.error(error);
      throw new Error("Subscription failed. Please try again.");
    }
    await logEvent("newsletter_subscribed", {}, data);
    return { ok: true as const };
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => feedbackSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    await enforceRateLimit("feedback", 6, 600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_feedback").insert({
      product_id: data.product_id ?? null,
      registration_code: data.registration_code?.toUpperCase() ?? null,
      name: data.name,
      email: data.email,
      rating: data.rating,
      experience: data.experience ?? null,
      problems: data.problems ?? null,
      improvements: data.improvements ?? null,
      feature_requests: data.feature_requests ?? null,
      media_urls: data.media_urls ?? [],
    });
    if (error) {
      console.error(error);
      throw new Error("We couldn't save your feedback. Please try again.");
    }
    await logEvent("feedback_submitted", { rating: data.rating }, data);
    return { ok: true as const };
  });

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => eventSchema.parse(input))
  .handler(async ({ data }) => {
    await enforceRateLimit("events", 120, 60);
    await logEvent(data.event_name, data.properties ?? {}, data);
    return { ok: true as const };
  });
