import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, PageHero, Section, SectionHeader } from "@/components/site/primitives";
import { IMAGES } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/how-we-build")({
  head: () =>
    pageHead({
      title: "How We Build",
      description: "The Bengal Studio development pipeline: problem discovery, market and future-demand research, concept, overseas prototyping, customer testing, small-batch import, Bangladesh launch, improvement and scale.",
      path: "/how-we-build",
    }),
  component: HowWeBuild,
});

const STAGES = [
  { n: "01", title: "Problem identification", body: "Home visits, workplace observation and structured interviews. We look for problems people have normalised — the air purifier that dies in monsoon, the mug that never keeps tea hot, the desk that hurts.", out: "Problem brief" },
  { n: "02", title: "Market research", body: "What exists today, what it costs, why it fails here. We test competing products under Dhaka conditions and log the results.", out: "Competitive teardown" },
  { n: "03", title: "Future-demand analysis", body: "Income trends, urbanisation, grid reliability, climate projections. A product must matter more in five years, not less.", out: "Demand thesis" },
  { n: "04", title: "Product concept", body: "Specification written against local stress: humidity, particulates, voltage, space. Target price set for the Bangladeshi household, not converted from a foreign one.", out: "Concept spec" },
  { n: "05", title: "Sourcing & manufacturing", body: "Partner selection in Japan, China and elsewhere on precision, material traceability and willingness to iterate in small runs.", out: "Partner agreement" },
  { n: "06", title: "Prototype", body: "Engineering samples built, then re-built. Each revision carries a serial reference visible on the product page.", out: "Serialised prototype" },
  { n: "07", title: "Customer testing", body: "Our 100 early customers receive prototypes for a 14-day trial with structured feedback: rating, problems, improvements, feature requests.", out: "Field report" },
  { n: "08", title: "Small-batch import", body: "A limited first run clears customs, inspection and warranty setup before any public availability.", out: "Batch 01" },
  { n: "09", title: "Bangladesh launch", body: "Early customers first at preferred pricing. Then general availability, honestly described with known limitations.", out: "Launch" },
  { n: "10", title: "Improve, scale, export", body: "Revisions from real use feed the next batch. Distribution grows nationally, then to markets with the same climate stress.", out: "Version 2 →" },
];

function HowWeBuild() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Process" title="Ten stages. No shortcuts between them." description="Every Bengal Studio product must earn its way through the same pipeline. Here is what happens at each step, and what has to exist before we move on.">
        <Button asChild variant="ember" size="lg"><Link to="/early-customers">Take part in stage 07</Link></Button>
      </PageHero>

      <Section tone="lowest">
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {STAGES.map((s) => (
            <li key={s.n} className="bg-surface-lowest p-7 md:p-9 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-label text-ember">Stage {s.n}</span>
                <span className="text-label-xs text-outline">Output · {s.out}</span>
              </div>
              <h2 className="text-headline-sm">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow className="mb-4">Supply-chain architecture</Eyebrow>
            <h2 className="text-headline-lg">Precision where it exists. Accountability where we live.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Osaka for ceramics and tooling discipline. Tokyo for component sourcing and quality systems. Shenzhen for electronics, enclosures and rapid iteration. Dhaka for specification, testing, warranty and every customer conversation.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {["Material traceability on every batch", "Incoming inspection in Dhaka before release", "Spare parts stocked locally for the warranty period", "Small runs first — never a container of untested product"].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 rounded-full bg-ember shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={IMAGES.auraflowHero} alt="Prototype modules laid out for inspection" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader align="center" eyebrow="Your role" title="Stage 07 needs 100 honest people." description="Prototypes only get better when someone tells us what's wrong with them. That's the job." />
        <div className="text-center">
          <Button asChild variant="ember" size="xl"><Link to="/early-customers">Become One of the 100</Link></Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
