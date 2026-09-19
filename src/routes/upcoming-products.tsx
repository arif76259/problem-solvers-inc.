import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section, SectionHeader } from "@/components/site/primitives";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import { STAGE_LABELS, UPCOMING_STAGES } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/upcoming-products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery({ upcoming: true })),
  head: () =>
    pageHead({
      title: "Upcoming Products",
      description: "Products Bengal Studio is researching, prototyping and testing right now — with stages, launch windows and how to get early access.",
      path: "/upcoming-products",
    }),
  component: Upcoming,
});

function Upcoming() {
  const { data: products } = useSuspenseQuery(productsQuery({ upcoming: true }));
  return (
    <SiteLayout>
      <PageHero eyebrow="Pipeline" title="What's coming, and how far along it is." description="Every upcoming product moves through Research → Concept → Prototype → Testing → Early Access → Launching Soon. Early customers get each one first.">
        <Button asChild variant="ember" size="lg"><Link to="/early-customers">Get early access</Link></Button>
      </PageHero>
      <Section tone="lowest">
        <div className="mb-12 flex flex-wrap gap-2">
          {UPCOMING_STAGES.map((s, i) => (
            <span key={s} className="text-label-xs inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2">
              <span className="text-outline">0{i + 1}</span> {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
        <SectionHeader eyebrow={`${products.length} in development`} title="Follow them from prototype to shelf." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>
    </SiteLayout>
  );
}
