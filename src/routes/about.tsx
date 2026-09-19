import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, PageHero, Section, SectionHeader, Stat } from "@/components/site/primitives";
import { IMAGES, SITE } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Bengal Studio",
      description: "Why a Dhaka product studio designs for humidity, dust and voltage swings first — and how we work with manufacturing partners in Japan and China to build products worth owning.",
      path: "/about",
    }),
  component: About,
});

const MILESTONES = [
  { when: "Origin", what: "Started as a notebook of household frustrations collected across Dhaka, Chattogram and Sylhet." },
  { when: "Research", what: "Twelve months of field measurement: indoor PM2.5, humidity, voltage logs, desk ergonomics in small apartments." },
  { when: "Partners", what: "Tooling and component relationships established in Osaka, Tokyo and Shenzhen — selected for precision, not price alone." },
  { when: "Cohort 01", what: "First 100 early customers recruited to live with prototypes and decide what ships." },
  { when: "Next", what: "Small-batch launch in Bangladesh, national distribution, then export to markets with the same climate stress." },
];

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About the studio" title="A product company that starts with the problem, not the shipment." description="Bengal Studio exists because most things sold in Bangladesh were designed for somewhere else. We reverse that: observe here, engineer with the best partners anywhere, launch here first.">
        <Button asChild variant="ember" size="lg"><Link to="/early-customers">Join the first 100</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/how-we-build">How we build</Link></Button>
      </PageHero>

      <Section tone="lowest">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 overflow-hidden rounded-lg border border-border corner-marks">
            <img src={IMAGES.inspection} alt="Bengal Studio team inspecting a prototype batch" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="lg:col-span-7 prose-studio">
            <Eyebrow className="mb-4">What we are</Eyebrow>
            <h2 className="text-headline-lg mb-6">Not a trading house. A research-led product studio.</h2>
            <p>We are not an importer that scans catalogues for margin. We are a small team of researchers, engineers and operators who identify problems people in Bangladesh actually live with, and develop products that solve them properly.</p>
            <p>Manufacturing happens where it can be done with precision — today primarily Japan and China. Design, testing and accountability stay in Dhaka, with the people who will use what we make.</p>
            <p>Our model is deliberately slow at the front and fast at the back: months of discovery and testing, then small-batch import, honest launch, rapid revision, and only then scale.</p>
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <Stat value="3" label="Cities of field research" />
              <Stat value="100" label="Early customers, cohort 01" />
              <Stat value="3" label="Manufacturing hubs" />
              <Stat value="2y" label="Standard warranty" />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Timeline" title="From notebook to national distribution." />
        <ol className="relative border-l border-border ml-3 space-y-10">
          {MILESTONES.map((m) => (
            <li key={m.when} className="pl-8 relative">
              <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-ember" />
              <p className="text-label text-ember mb-1">{m.when}</p>
              <p className="text-body-lg text-foreground max-w-2xl">{m.what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="dark">
        <SectionHeader eyebrow="Where we work" title="Three desks, one accountability." description="Design and customer relationships in Dhaka. Precision engineering and sourcing through liaison offices in Tokyo and Shenzhen." />
        <div className="grid gap-px overflow-hidden rounded-lg border border-primary-foreground/10 bg-primary-foreground/10 md:grid-cols-3">
          {SITE.offices.map((o, i) => (
            <div key={o.name} className="bg-primary p-7">
              <p className="text-label-xs text-primary-foreground/50">0{i + 1}</p>
              <h3 className="mt-3 font-display text-lg font-medium">{o.name}</h3>
              <p className="mt-2 text-sm text-primary-foreground/65">{o.address}</p>
            </div>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
