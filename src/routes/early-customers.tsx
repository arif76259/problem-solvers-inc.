import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Award, Copy, Package, ShieldCheck, Tag, Users } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, Section, SectionHeader } from "@/components/site/primitives";
import { Field } from "@/components/site/LeadForm";
import { campaignStatsQuery, faqsQuery, productsQuery } from "@/lib/queries";
import { submitEarlyRegistration } from "@/lib/public.functions";
import { registrationSchema } from "@/lib/validation";
import { AGE_RANGES, DISCOVERY_SOURCES, PRICE_RANGES } from "@/lib/site";
import { getAttribution, track } from "@/lib/analytics";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/early-customers")({
  validateSearch: z.object({ focus: z.string().max(120).optional() }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(campaignStatsQuery),
      context.queryClient.ensureQueryData(productsQuery({ upcoming: true })),
      context.queryClient.ensureQueryData(faqsQuery("early-customers")),
    ]);
  },
  head: () =>
    pageHead({
      title: "100 Early Customers — Become One of the 100",
      description: "Join Bengal Studio's first cohort: test upcoming products for 14 days, give structured feedback, get first delivery, 40% preferred pricing, a 2-year warranty and your name on the Founders Wall.",
      path: "/early-customers",
    }),
  component: EarlyCustomers,
});

const PRIVILEGES = [
  { icon: Package, title: "First hands-on delivery", text: "Prototypes and first batches reach you before anyone else in Bangladesh." },
  { icon: Tag, title: "40% preferred pricing", text: "Locked-in launch pricing on every product you helped test." },
  { icon: ShieldCheck, title: "2-year warranty", text: "Double our standard cover, serviced from Dhaka with local spare parts." },
  { icon: Award, title: "Founders Wall", text: "Your name and cohort number, permanently, on every product page you shaped." },
];

const PROFILE = ["Everyday problem spotters", "Honest critics", "Tech explorers", "Thoughtful communicators"];
const FLOW = ["90-second application", "Review & registration ID", "Prototype allocation", "14-day field trial & feedback"];

type Result = { code: string; duplicate: boolean; waitlisted?: boolean };

function EarlyCustomers() {
  const { focus } = Route.useSearch();
  const { data: stats } = useSuspenseQuery(campaignStatsQuery);
  const { data: products } = useSuspenseQuery(productsQuery({ upcoming: true }));
  const { data: faqs } = useSuspenseQuery(faqsQuery("early-customers"));
  const register = useServerFn(submitEarlyRegistration);
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const started = useRef(false);
  const pct = Math.min(100, Math.round((stats.claimed / stats.capacity) * 100));

  function onFocusForm() {
    if (started.current) return;
    started.current = true;
    track("form_start", { form: "early_customer" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const parsed = registrationSchema.safeParse({
      ...raw,
      consent: raw["consent"] === "on",
      age_range: raw["age_range"] || undefined,
      occupation: raw["occupation"] || undefined,
      main_problem: raw["main_problem"] || undefined,
      price_range: raw["price_range"] || undefined,
      discovered_via: raw["discovered_via"] || undefined,
      source: "early-customers-page",
      ...getAttribution(),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      track("form_error", { form: "early_customer", fields: Object.keys(errs).join(",") });
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setState("busy");
    try {
      const r = await register({ data: parsed.data });
      setResult(r);
      if (!r.duplicate) track("early_customer_registered", { product_interest: parsed.data.product_interest, waitlisted: !!r.waitlisted });
      window.scrollTo({ top: (document.getElementById("apply")?.offsetTop ?? 0) - 120, behavior: "smooth" });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setState("idle");
    }
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-primary text-primary-foreground grid-paper-dark pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Eyebrow dot className="mb-5">100 Early Customers · Cohort 01</Eyebrow>
            <h1 className="text-display">Become one of the 100 people who decide what we ship.</h1>
            <p className="mt-7 max-w-2xl text-body-lg text-primary-foreground/75">
              Live with our prototypes for 14 days. Tell us what breaks, what delights, what's missing. In return: first delivery, preferred pricing, a longer warranty, and your name on the products you shaped.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="ember" size="xl"><a href="#apply" onClick={() => track("cta_click", { cta: "campaign_hero_apply" })}>Apply now</a></Button>
              <Button asChild variant="inverse-outline" size="xl"><a href="#privileges">What you get</a></Button>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-label-xs text-primary-foreground/50">Seats claimed</p>
                  <p className="font-display text-5xl font-semibold mt-1">{stats.claimed}<span className="text-2xl text-primary-foreground/50"> / {stats.capacity}</span></p>
                </div>
                <Users className="size-8 text-ember" strokeWidth={1.5} />
              </div>
              <div className="mt-5 h-1.5 w-full rounded-full bg-primary-foreground/10 overflow-hidden"><div className="h-full bg-ember transition-all" style={{ width: `${pct}%` }} /></div>
              <p className="mt-3 text-xs text-primary-foreground/60">{stats.remaining > 0 ? `${stats.remaining} seats remaining. Applications after capacity join the waitlist for Cohort 02.` : "Cohort 01 is full — new applications join the Cohort 02 waitlist."}</p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="lowest" id="privileges">
        <SectionHeader eyebrow="Patron privileges" title="Four things every early customer receives." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVILEGES.map((p, i) => (
            <div key={p.title} className="card-tech p-7">
              <div className="flex items-center justify-between"><p.icon className="size-6 text-primary" strokeWidth={1.5} /><span className="text-label-xs text-outline">0{i + 1}</span></div>
              <h3 className="mt-5 font-display text-lg font-medium">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-4">Who we're looking for</Eyebrow>
            <h2 className="text-headline-md">Not influencers. Observers.</h2>
            <ul className="mt-6 grid gap-3">
              {PROFILE.map((p) => <li key={p} className="flex items-center gap-3 border-b border-border pb-3 font-medium"><span className="size-1.5 rounded-full bg-ember" />{p}</li>)}
            </ul>
          </div>
          <div>
            <Eyebrow className="mb-4">How the cohort works</Eyebrow>
            <h2 className="text-headline-md">Four steps from application to field report.</h2>
            <ol className="mt-6 grid gap-3">
              {FLOW.map((f, i) => <li key={f} className="flex items-center gap-4 border-b border-border pb-3"><span className="text-label text-ember">0{i + 1}</span><span className="font-medium">{f}</span></li>)}
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="low" id="apply">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow dot className="mb-4">Application</Eyebrow>
            <h2 className="text-headline-lg">90 seconds. Honest answers.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">We review every application personally. You'll receive a registration ID immediately and a confirmation by email. Your details are stored securely and never sold.</p>
            <p className="mt-6 text-xs text-muted-foreground">Read our <Link to="/privacy" className="underline">privacy policy</Link> and <Link to="/terms" className="underline">terms</Link>.</p>
          </div>
          <div className="lg:col-span-8">
            {result ? (
              <ResultCard result={result} />
            ) : (
              <form onSubmit={onSubmit} onFocus={onFocusForm} noValidate className="card-tech p-6 md:p-8 grid gap-5 sm:grid-cols-2">
                <Field id="full_name" label="Full name" required error={errors["full_name"]} />
                <Field id="email" label="Email" type="email" required error={errors["email"]} />
                <Field id="phone" label="Phone (WhatsApp preferred)" type="tel" required placeholder="017XXXXXXXX" error={errors["phone"]} />
                <Field id="location" label="City / area" required placeholder="e.g. Banani, Dhaka" error={errors["location"]} />
                <Select id="age_range" label="Age range" options={AGE_RANGES} />
                <Field id="occupation" label="Occupation" error={errors["occupation"]} />
                <fieldset className="sm:col-span-2">
                  <legend className="field-label">Prototype focus</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[...products.map((p) => p.name), "Generalist — allocate me anywhere"].map((name) => (
                      <label key={name} className="flex items-center gap-3 rounded-md border border-input bg-surface-lowest px-4 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary-container/40 cursor-pointer">
                        <input type="radio" name="product_interest" value={name} defaultChecked={focus ? focus === name : false} className="accent-primary" />
                        {name}
                      </label>
                    ))}
                  </div>
                  {errors["product_interest"] && <p className="mt-1 text-xs text-destructive">{errors["product_interest"]}</p>}
                </fieldset>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="f-main_problem">What everyday frustration would you most like solved? (optional)</label>
                  <textarea id="f-main_problem" name="main_problem" rows={4} className="field" placeholder="Be specific — the more ordinary, the better." />
                </div>
                <Select id="price_range" label="Comfortable price range for a product like this" options={PRICE_RANGES} />
                <Select id="discovered_via" label="How did you find us?" options={DISCOVERY_SOURCES} />
                <label className="sm:col-span-2 flex items-start gap-3 text-sm">
                  <input type="checkbox" name="consent" className="mt-1 accent-primary" />
                  <span>I agree to be contacted by Bengal Studio about the cohort, prototypes and launches, and I understand I can withdraw at any time.</span>
                </label>
                {errors["consent"] && <p className="sm:col-span-2 -mt-3 text-xs text-destructive">{errors["consent"]}</p>}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">Duplicate applications are matched by email or phone.</p>
                  <Button type="submit" variant="ember" size="xl" disabled={state === "busy"}>{state === "busy" ? "Submitting…" : "Become One of the 100"}</Button>
                </div>
                {errors["form"] && <p className="sm:col-span-2 text-sm text-destructive">{errors["form"]}</p>}
              </form>
            )}
          </div>
        </div>
      </Section>

      {faqs.length > 0 && (
        <Section tone="lowest">
          <SectionHeader eyebrow="Cohort FAQ" title="Before you apply." right={<Link to="/faq" className="text-sm font-medium underline underline-offset-4">All questions</Link>} />
          <Accordion type="single" collapsible className="max-w-3xl">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left font-display text-base">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}
    </SiteLayout>
  );
}

function Select({ id, label, options }: { id: string; label: string; options: readonly string[] }) {
  return (
    <div>
      <label className="field-label" htmlFor={`f-${id}`}>{label}</label>
      <select id={`f-${id}`} name={id} className="field" defaultValue="">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  return (
    <div className="card-tech corner-marks p-8 md:p-10">
      <Eyebrow dot className="mb-4">{result.duplicate ? "Already registered" : result.waitlisted ? "Waitlisted · Cohort 02" : "Application received"}</Eyebrow>
      <h3 className="text-headline-md">{result.duplicate ? "You're already on the list." : result.waitlisted ? "Cohort 01 is full — you're first in line for Cohort 02." : "Welcome to the review queue."}</h3>
      <p className="mt-3 text-muted-foreground">{result.duplicate ? "We found an existing application with this email or phone. Here is your registration ID again:" : "Your unique registration ID. Keep it — you'll use it when submitting prototype feedback. A confirmation is on its way to your email."}</p>
      <div className="mt-6 flex items-center gap-3">
        <code className="font-mono text-2xl md:text-3xl font-semibold tracking-wider bg-surface-low border border-border rounded-md px-5 py-3">{result.code}</code>
        <Button variant="outline" size="icon" aria-label="Copy registration ID" onClick={() => { void navigator.clipboard.writeText(result.code); toast.success("Registration ID copied"); }}>
          <Copy className="size-4" />
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">Status: <span className="font-medium text-foreground">Early customer · {result.waitlisted ? "waitlisted" : "under review"}</span>. Meanwhile, <Link to="/upcoming-products" className="underline">see what you might be testing</Link>.</p>
    </div>
  );
}
