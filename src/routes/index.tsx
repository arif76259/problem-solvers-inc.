import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Droplets, Wind, Zap, Armchair, Quote, Search, FlaskConical, Hammer, ClipboardCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLink, Eyebrow, FeatureCard, Section, SectionHeader, Stat } from "@/components/site/primitives";
import { ProductCard } from "@/components/site/ProductCard";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { campaignStatsQuery, productsQuery, reviewsQuery } from "@/lib/queries";
import { IMAGES, SITE } from "@/lib/site";
import { pageHead } from "@/lib/seo";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery({ featured: true })),
      context.queryClient.ensureQueryData(reviewsQuery),
      context.queryClient.ensureQueryData(campaignStatsQuery),
    ]);
  },
  head: () =>
    pageHead({
      title: `${SITE.name} — We're building what people will need next`,
      description: SITE.description,
      path: "/",
      jsonLd: { "@type": "WebSite", name: SITE.name, url: "/" },
    }),
  component: Home,
});

const PIPELINE = [
  { icon: Search, title: "Discover", text: "We sit in homes, offices and workshops across Dhaka and log the frustrations people have stopped noticing." },
  { icon: FlaskConical, title: "Research", text: "Field measurements, market data and a five-year demand view decide whether a problem deserves a product." },
  { icon: Hammer, title: "Build", text: "Concepts become prototypes with precision manufacturing partners in Osaka, Tokyo and Shenzhen." },
  { icon: ClipboardCheck, title: "Test", text: "Our first 100 customers live with each prototype for 14 days and report back, honestly." },
  { icon: RefreshCw, title: "Improve", text: "Feedback becomes revisions. Only then do we import a small batch and launch in Bangladesh." },
];

const PRINCIPLES = [
  { icon: Droplets, title: "Humidity-safe by default", text: "Every product is specified for 80%+ relative humidity, not a temperate lab." },
  { icon: Wind, title: "Particulate-aware", text: "Dhaka's winter PM2.5 shapes our filters, seals and service intervals." },
  { icon: Zap, title: "Voltage-tolerant", text: "Rated for 160–260V swings and daily load-shedding, without a stabiliser." },
  { icon: Armchair, title: "Ergonomic for real homes", text: "Sized and weighted for compact apartments and shared desks." },
];

function Home() {
  const { data: featured } = useSuspenseQuery(productsQuery({ featured: true }));
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const { data: stats } = useSuspenseQuery(campaignStatsQuery);
  const lead = featured[0];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface grid-paper pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 animate-rise">
            <Eyebrow dot className="mb-6">Cohort 01 · {stats.remaining} of {stats.capacity} seats remaining</Eyebrow>
            <h1 className="text-display text-foreground max-w-2xl">{SITE.tagline}</h1>
            <p className="mt-7 max-w-xl text-body-lg text-muted-foreground">
              Bengal Studio is a Dhaka product studio. We discover the problems people live with, engineer better answers with manufacturing partners in Japan and China, and launch them together with our first 100 customers.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="ember" size="xl">
                <Link to="/early-customers" onClick={() => track("cta_click", { cta: "hero_become_one" })}>
                  Become One of the 100 <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/products" onClick={() => track("cta_click", { cta: "hero_explore_products" })}>Explore Our Products</Link>
              </Button>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8 max-w-lg">
              <Stat value="03" label="Products in pipeline" />
              <Stat value="14d" label="Field trial per prototype" />
              <Stat value="3" label="Manufacturing hubs" />
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="corner-marks overflow-hidden rounded-lg border border-border bg-surface-lowest shadow-lift">
              <img src={IMAGES.heroDesk} alt="Prototype under evaluation on a workbench at Bengal Studio" width={960} height={1200} fetchPriority="high" className="aspect-[4/5] w-full object-cover" />
            </div>
            {lead && (
              <Link to="/products/$slug" params={{ slug: lead.slug }} className="absolute -bottom-6 left-4 right-4 md:left-auto md:-left-10 md:right-auto md:w-72 card-tech p-4 flex gap-4 items-center">
                <div className="size-14 shrink-0 overflow-hidden rounded-sm bg-surface-low">
                  {lead.images?.[0] && <img src={lead.images[0]} alt="" className="size-full object-cover" loading="lazy" />}
                </div>
                <div className="min-w-0">
                  <p className="text-label-xs text-ember">{lead.stage_label ?? "In development"}</p>
                  <p className="font-display font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.launch_window}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How we work */}
      <Section tone="lowest" id="how">
        <SectionHeader
          eyebrow="The Bengal Studio method"
          title="Five stages between a real problem and a product worth owning."
          description="No catalogue imports. Every product starts as an observed frustration and earns each stage of development."
          right={<ArrowLink to="/how-we-build">See the full process</ArrowLink>}
        />
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-5">
          {PIPELINE.map((s, i) => (
            <li key={s.title} className="bg-surface-lowest p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-primary" strokeWidth={1.75} />
                <span className="text-label-xs text-outline">0{i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-medium">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Featured products */}
      <Section>
        <SectionHeader
          eyebrow="Current pipeline"
          title="Products in development right now."
          description="Each carries a serial reference, a stage and a launch window. You can follow them from prototype to shelf."
          right={<ArrowLink to="/upcoming-products">All upcoming products</ArrowLink>}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      {/* Principles */}
      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow className="mb-4">Built for this climate</Eyebrow>
            <h2 className="text-headline-lg">Designed for Bangladesh first. Then everywhere with the same stress.</h2>
            <p className="mt-5 text-primary-foreground/70 leading-relaxed">
              Most products sold here were designed for somewhere else. We start from the conditions our customers actually live in, and only then look outward.
            </p>
            <Button asChild variant="inverse-outline" className="mt-8">
              <Link to="/about">Our story</Link>
            </Button>
          </div>
          <div className="lg:col-span-8 grid gap-px overflow-hidden rounded-lg border border-primary-foreground/10 bg-primary-foreground/10 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="bg-primary p-7">
                <p.icon className="size-6 text-ember" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/65 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Campaign */}
      <Section tone="low" id="campaign">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={IMAGES.inspection} alt="Incoming inspection of a prototype batch" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <Eyebrow dot className="mb-4">100 Early Customers</Eyebrow>
            <h2 className="text-headline-lg">Help us build the next product. Own it first.</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              We're recruiting 100 people in Bangladesh to test upcoming products, tell us what breaks, and shape the final version before anyone else can buy it.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["First hands-on delivery", "40% preferred pricing on launch", "2-year warranty", "Name on the Founders Wall"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm font-medium">
                  <span className="size-1.5 rounded-full bg-ember" /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-6">
              <Button asChild variant="ember" size="lg">
                <Link to="/early-customers" onClick={() => track("cta_click", { cta: "campaign_section_become_one" })}>Become One of the 100</Link>
              </Button>
              <div className="text-label-xs text-muted-foreground">
                <span className="text-foreground font-semibold text-base font-display">{stats.claimed}</span> / {stats.capacity} claimed
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Social proof */}
      {reviews.length > 0 && (
        <Section>
          <SectionHeader eyebrow="From the cohort" title="What early customers are telling us." />
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.slice(0, 2).map((r) => (
              <figure key={r.id} className="card-tech p-8 flex flex-col gap-6">
                <Quote className="size-6 text-ember" />
                <blockquote className="text-lg leading-relaxed text-foreground">"{r.body}"</blockquote>
                <figcaption className="mt-auto flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{r.reviewer_name}</p>
                    <p className="text-muted-foreground">{r.reviewer_role}</p>
                  </div>
                  <span className="text-label-xs text-outline">{r.products?.serial_ref} · {r.cohort_number ? `#${String(r.cohort_number).padStart(3, "0")}` : ""}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* Vision + newsletter */}
      <Section tone="lowest">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-4">Where this goes</Eyebrow>
            <h2 className="text-headline-lg">From Dhaka homes to export markets with the same climate stress.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Launch in Bangladesh, refine with real customers, scale distribution nationally, and then carry products proven in one of the world's hardest environments to South and Southeast Asia, the Gulf and beyond.
            </p>
          </div>
          <div className="card-tech p-8">
            <p className="text-label text-ember mb-2">Field notes & early access</p>
            <h3 className="text-headline-sm mb-4">Get notified before each launch.</h3>
            <NewsletterForm source="home" />
            <p className="mt-3 text-xs text-muted-foreground">No spam. Roughly two emails a month. Unsubscribe anytime.</p>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}
