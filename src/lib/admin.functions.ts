import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Ctx = { supabase: ReturnType<typeof import("@supabase/supabase-js").createClient<import("@/integrations/supabase/types").Database>>; userId: string };

async function assertStaff(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc("is_staff", { _user_id: ctx.userId });
  if (error || !data) throw new Error("Forbidden");
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { roles, isStaff: roles.includes("admin") || roles.includes("editor") };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const sb = context.supabase;
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const [regs, leads, feedback, subs, b2b, events, regRows, leadRows, feedbackRows, prodViews] = await Promise.all([
      sb.from("early_customer_registrations").select("id", { count: "exact", head: true }),
      sb.from("leads").select("id", { count: "exact", head: true }),
      sb.from("product_feedback").select("id", { count: "exact", head: true }),
      sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
      sb.from("leads").select("id", { count: "exact", head: true }).in("category", ["b2b_lead", "distributor", "retailer", "manufacturer", "partnership"]),
      sb.from("analytics_events").select("event_name, created_at, device, country, path, properties").gte("created_at", since).limit(5000),
      sb.from("early_customer_registrations").select("product_interest, source, utm_source, created_at, status"),
      sb.from("leads").select("category, source, utm_source, created_at"),
      sb.from("product_feedback").select("rating, product_id, status, products(name)").limit(500),
      sb.from("products").select("id, name, stage"),
    ]);

    const tally = (arr: (string | null | undefined)[]) => {
      const m = new Map<string, number>();
      for (const a of arr) m.set(a || "unknown", (m.get(a || "unknown") ?? 0) + 1);
      return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };
    const ev = events.data ?? [];
    const ctaClicks = ev.filter((e) => e.event_name === "cta_click").length;
    const pageViews = ev.filter((e) => e.event_name === "page_view").length;
    const productViews = ev.filter((e) => e.event_name === "product_view");
    const regEvents = ev.filter((e) => e.event_name === "early_customer_registered").length;
    const formStarts = ev.filter((e) => e.event_name === "form_start").length;
    const productPerf = (prodViews.data ?? []).map((p) => ({
      name: p.name,
      stage: p.stage,
      views: productViews.filter((e) => (e.properties as { slug?: string })?.slug && p.name && (e.path ?? "").endsWith((e.properties as { slug: string }).slug)).length,
      interest: (regRows.data ?? []).filter((r) => r.product_interest === p.name).length,
      feedback: (feedbackRows.data ?? []).filter((f) => f.product_id === p.id).length,
    }));

    // registrations per day (last 30)
    const byDay = new Map<string, number>();
    for (const r of regRows.data ?? []) {
      const d = r.created_at.slice(0, 10);
      byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const series = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

    return {
      totals: {
        registrations: regs.count ?? 0,
        earlyCustomers: (regRows.data ?? []).filter((r) => r.status !== "rejected").length,
        leads: leads.count ?? 0,
        feedback: feedback.count ?? 0,
        subscribers: subs.count ?? 0,
        b2b: b2b.count ?? 0,
        pageViews,
        ctaClicks,
        conversionRate: pageViews ? Math.round((regEvents / pageViews) * 1000) / 10 : 0,
        formAbandonRate: formStarts ? Math.round(((formStarts - regEvents) / formStarts) * 1000) / 10 : 0,
      },
      productInterest: tally((regRows.data ?? []).map((r) => r.product_interest)),
      leadSources: tally((leadRows.data ?? []).map((r) => r.utm_source || r.source)),
      leadCategories: tally((leadRows.data ?? []).map((r) => r.category)),
      devices: tally(ev.map((e) => e.device)),
      countries: tally(ev.map((e) => e.country)),
      ratingDistribution: [1, 2, 3, 4, 5].map((r) => ({ name: `${r}★`, value: (feedbackRows.data ?? []).filter((f) => f.rating === r).length })),
      productPerf,
      series,
    };
  });

// ---------- Registrations ----------
export const listRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("early_customer_registrations").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data;
  });

export const updateRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; patch: TablesUpdate<"early_customer_registrations"> }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("early_customer_registrations").update(data.patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Leads ----------
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("leads").select("*, products(name)").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data;
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; patch: TablesUpdate<"leads"> }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("leads").update(data.patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Feedback ----------
export const listFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("product_feedback").select("*, products(name)").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data;
  });

export const updateFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; patch: TablesUpdate<"product_feedback"> }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("product_feedback").update(data.patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Subscribers ----------
export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return data;
  });

// ---------- Products ----------
export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const [{ data: products, error }, { data: categories }] = await Promise.all([
      context.supabase.from("products").select("*").order("sort_order"),
      context.supabase.from("product_categories").select("*").order("sort_order"),
    ]);
    if (error) throw error;
    return { products: products ?? [], categories: categories ?? [] };
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  name: z.string().trim().min(2).max(160),
  category_id: z.string().uuid().nullable().optional(),
  tagline: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  problem_solved: z.string().trim().max(2000).nullable().optional(),
  key_features: z.array(z.string().max(200)).max(20),
  images: z.array(z.string().url().max(600)).max(10),
  videos: z.array(z.string().url().max(600)).max(5),
  specifications: z.array(z.object({ label: z.string().max(80), value: z.string().max(200) })).max(30),
  faqs: z.array(z.object({ q: z.string().max(300), a: z.string().max(2000) })).max(20),
  source_country: z.string().trim().max(80).nullable().optional(),
  stage: z.enum(["research", "concept", "prototype", "testing", "early_access", "launching_soon", "available", "sold_out", "discontinued"]),
  stage_label: z.string().trim().max(120).nullable().optional(),
  launch_window: z.string().trim().max(60).nullable().optional(),
  price_bdt: z.number().nonnegative().nullable().optional(),
  price_note: z.string().trim().max(200).nullable().optional(),
  serial_ref: z.string().trim().max(40).nullable().optional(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  sort_order: z.number().int(),
});
export type ProductFormInput = z.input<typeof productSchema>;

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => productSchema.parse(i))
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { id, ...rest } = data;
    const row = { ...rest, specifications: rest.specifications as never, faqs: rest.faqs as never } satisfies TablesInsert<"products">;
    const q = id ? context.supabase.from("products").update(row).eq("id", id) : context.supabase.from("products").insert(row);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- FAQs ----------
export const adminListFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("faqs").select("*").order("sort_order");
    if (error) throw error;
    return data;
  });

export const upsertFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        question: z.string().trim().min(3).max(300),
        answer: z.string().trim().min(3).max(3000),
        category: z.string().trim().min(1).max(40),
        sort_order: z.number().int(),
        is_published: z.boolean(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { id, ...row } = data;
    const { error } = id ? await context.supabase.from("faqs").update(row).eq("id", id) : await context.supabase.from("faqs").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Insights ----------
export const adminListInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("insights").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const upsertInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
        title: z.string().trim().min(3).max(200),
        excerpt: z.string().trim().max(500).nullable().optional(),
        body: z.string().trim().max(50000).nullable().optional(),
        cover_image: z.string().url().max(600).nullable().optional().or(z.literal("").transform(() => null)),
        category: z.string().trim().min(1).max(40),
        read_minutes: z.number().int().nullable().optional(),
        is_published: z.boolean(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { id, ...row } = data;
    const payload = { ...row, published_at: row.is_published ? new Date().toISOString() : null };
    const { error } = id ? await context.supabase.from("insights").update(payload).eq("id", id) : await context.supabase.from("insights").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => i)
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { error } = await context.supabase.from("insights").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Campaigns ----------
export const adminListCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as Ctx);
    const { data, error } = await context.supabase.from("campaigns").select("*").order("created_at");
    if (error) throw error;
    return data;
  });

export const upsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
        name: z.string().trim().min(2).max(160),
        description: z.string().trim().max(1000).nullable().optional(),
        capacity: z.number().int().min(1).max(100000),
        status: z.enum(["draft", "active", "closed"]),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context as Ctx);
    const { id, ...row } = data;
    const { error } = id ? await context.supabase.from("campaigns").update(row).eq("id", id) : await context.supabase.from("campaigns").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
