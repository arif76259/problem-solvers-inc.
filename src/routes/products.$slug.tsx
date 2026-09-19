import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, Section, SectionHeader, StageBadge } from "@/components/site/primitives";
import { ProductCard } from "@/components/site/ProductCard";
import { FeedbackForm } from "@/components/site/FeedbackForm";
import { LeadForm } from "@/components/site/LeadForm";
import { productQuery } from "@/lib/queries";
import { STAGE_LABELS, STAGE_ORDER, formatBDT } from "@/lib/site";
import { pageHead } from "@/lib/seo";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Product not found" }, { name: "robots", content: "noindex" }] };
    const availability = loaderData.stage === "available" ? "https://schema.org/InStock" : loaderData.stage === "sold_out" ? "https://schema.org/SoldOut" : "https://schema.org/PreOrder";
    return pageHead({
      title: loaderData.name,
      description: loaderData.tagline ?? loaderData.description?.slice(0, 160) ?? "",
      path: `/products/${params.slug}`,
      type: "product",
      jsonLd: {
        "@type": "Product",
        name: loaderData.name,
        description: loaderData.description ?? loaderData.tagline ?? undefined,
        image: loaderData.images ?? undefined,
        sku: loaderData.serial_ref ?? undefined,
        brand: { "@type": "Brand", name: "Bengal Studio" },
        offers: loaderData.price_bdt != null ? { "@type": "Offer", priceCurrency: "BDT", price: loaderData.price_bdt, availability } : undefined,
      },
    });
  },
  notFoundComponent: () => (
    <SiteLayout>
      <Section className="pt-40">
        <p className="text-label text-ember">404</p>
        <h1 className="text-headline-lg mt-3">We don't have a product at this address.</h1>
        <Button asChild className="mt-8"><Link to="/products">Back to products</Link></Button>
      </Section>
    </SiteLayout>
  ),
  component: ProductPage,
});

type Spec = { label: string; value: string };
type Faq = { q: string; a: string };

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  useEffect(() => {
    if (p) track("product_view", { slug: p.slug, stage: p.stage });
  }, [p]);
  if (!p) return null;

  const specs = (p.specifications as Spec[] | null) ?? [];
  const faqs = (p.faqs as Faq[] | null) ?? [];
  const stageIdx = STAGE_ORDER.indexOf(p.stage as (typeof STAGE_ORDER)[number]);
  const pipeline = STAGE_ORDER.slice(0, 7);
  const isBuyable = p.stage === "available";
  const isTestable = ["prototype", "testing", "early_access"].includes(p.stage);
  const avgRating = p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : null;

  return (
    <SiteLayout>
      <section className="pt-32 md:pt-40 pb-16 bg-surface">
        <div className="container-site">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="size-4" /> All products</Link>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="corner-marks overflow-hidden rounded-lg border border-border bg-surface-lowest">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} width={1200} height={900} fetchPriority="high" className="aspect-[4/3] w-full object-cover" /> : <div className="grid-paper aspect-[4/3]" />}
              </div>
              {p.images && p.images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {p.images.slice(1, 5).map((src, i) => <img key={src} src={src} alt={`${p.name} view ${i + 2}`} loading="lazy" className="aspect-square rounded-md border border-border object-cover" />)}
                </div>
              )}
            </div>
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center gap-3">
                <StageBadge stage={p.stage} label={STAGE_LABELS[p.stage]} />
                {p.serial_ref && <span className="text-label-xs text-outline">{p.serial_ref}</span>}
                {p.product_categories && <span className="text-label-xs text-muted-foreground">· {p.product_categories.name}</span>}
              </div>
              <h1 className="text-headline-lg mt-5">{p.name}</h1>
              {p.tagline && <p className="mt-3 text-body-lg text-muted-foreground">{p.tagline}</p>}
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 text-sm">
                <div><dt className="text-label-xs text-muted-foreground mb-1">Price</dt><dd className="font-display text-xl font-semibold">{formatBDT(p.price_bdt) ?? "TBA"}</dd>{p.price_note && <dd className="text-xs text-muted-foreground">{p.price_note}</dd>}</div>
                <div><dt className="text-label-xs text-muted-foreground mb-1">Launch window</dt><dd className="font-medium">{p.launch_window ?? "To be announced"}</dd></div>
                <div><dt className="text-label-xs text-muted-foreground mb-1">Manufactured</dt><dd className="font-medium">{p.source_country ?? "—"}</dd></div>
                <div><dt className="text-label-xs text-muted-foreground mb-1">Current stage</dt><dd className="font-medium">{p.stage_label ?? STAGE_LABELS[p.stage]}</dd></div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                {isBuyable ? (
                  <Button asChild variant="ember" size="lg"><Link to="/contact" search={{ subject: `Order: ${p.name}` }} onClick={() => track("cta_click", { cta: "product_order", slug: p.slug })}>Order this product</Link></Button>
                ) : (
                  <Button asChild variant="ember" size="lg"><Link to="/early-customers" search={{ focus: p.name }} onClick={() => track("cta_click", { cta: "product_early_access", slug: p.slug })}>{isTestable ? "Test it as an early customer" : "Register interest"}</Link></Button>
                )}
                <Button asChild variant="outline" size="lg"><a href="#interest">Ask a question</a></Button>
              </div>
              <ol className="mt-10 flex items-center gap-1">
                {pipeline.map((s, i) => (
                  <li key={s} className="flex-1" title={STAGE_LABELS[s]}>
                    <div className={`h-1 rounded-full ${i <= stageIdx ? "bg-ember" : "bg-surface-high"}`} />
                    <p className={`mt-2 text-[9px] font-mono uppercase tracking-wider hidden sm:block ${i === stageIdx ? "text-foreground" : "text-outline"}`}>{STAGE_LABELS[s]}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <Section tone="lowest">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-14">
            {p.problem_solved && (
              <div>
                <Eyebrow className="mb-3">The problem</Eyebrow>
                <p className="text-headline-sm font-normal leading-relaxed">{p.problem_solved}</p>
              </div>
            )}
            {p.description && (
              <div className="prose-studio">
                <Eyebrow className="mb-3">Our answer</Eyebrow>
                {p.description.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}
            {p.key_features?.length > 0 && (
              <div>
                <Eyebrow className="mb-5">Key features</Eyebrow>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.key_features.map((f) => <li key={f} className="flex gap-3 text-sm"><Check className="size-4 text-ember shrink-0 mt-0.5" />{f}</li>)}
                </ul>
              </div>
            )}
            {p.videos?.length > 0 && (
              <div>
                <Eyebrow className="mb-5">Video</Eyebrow>
                {p.videos.map((v) => <video key={v} src={v} controls preload="none" className="w-full rounded-lg border border-border" />)}
              </div>
            )}
          </div>
          <aside className="lg:col-span-5">
            {specs.length > 0 && (
              <div className="card-tech p-6">
                <Eyebrow className="mb-4">Specifications</Eyebrow>
                <dl className="divide-y divide-border text-sm">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">{s.label}</dt><dd className="font-medium text-right">{s.value}</dd></div>
                  ))}
                </dl>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {p.reviews.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Customer reviews" title={avgRating ? `${avgRating.toFixed(1)} / 5 from ${p.reviews.length} early customer${p.reviews.length > 1 ? "s" : ""}` : "Reviews"} />
          <div className="grid gap-6 md:grid-cols-2">
            {p.reviews.map((r) => (
              <figure key={r.id} className="card-tech p-7">
                <div className="flex gap-0.5 text-ember mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-current" : "opacity-25"}`} />)}</div>
                <blockquote className="leading-relaxed">"{r.body}"</blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">{r.author_name}{r.author_location ? `, ${r.author_location}` : ""}{r.cohort_number ? ` · Cohort #${String(r.cohort_number).padStart(3, "0")}` : ""}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section tone="low">
          <SectionHeader eyebrow="Product FAQ" title={`Questions about the ${p.name}`} />
          <Accordion type="single" collapsible className="max-w-3xl">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f${i}`}>
                <AccordionTrigger className="text-left font-display text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}

      <Section id="interest" tone="lowest">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-3">Register interest</Eyebrow>
            <h2 className="text-headline-md">Questions or a request about the {p.name}?</h2>
            <p className="mt-3 text-muted-foreground">We reply personally, usually within two working days.</p>
            <div className="mt-6"><LeadForm category="general_customer" productId={p.id} subject={`Interest: ${p.name}`} compact /></div>
          </div>
          {isTestable && (
            <div>
              <Eyebrow className="mb-3">Tested it?</Eyebrow>
              <h2 className="text-headline-md">Send structured feedback.</h2>
              <p className="mt-3 text-muted-foreground">Early customers: include your registration ID so we can match your prototype revision.</p>
              <div className="mt-6"><FeedbackForm productId={p.id} /></div>
            </div>
          )}
        </div>
      </Section>

      {p.related.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Related" title="Also in development" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {p.related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </Section>
      )}
    </SiteLayout>
  );
}
