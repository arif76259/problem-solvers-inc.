import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/primitives";
import { insightsQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/insights/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(insightsQuery),
  head: () => pageHead({ title: "Product Research & Insights", description: "Field logs, measurements and research notes from Bengal Studio's product development work in Bangladesh.", path: "/insights" }),
  component: Insights,
});

function Insights() {
  const { data } = useSuspenseQuery(insightsQuery);
  return (
    <SiteLayout>
      <PageHero eyebrow="Research & insights" title="Field notes from the work." description="What we measured, what surprised us, and what it changed in the products." />
      <Section tone="lowest">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((i) => (
            <Link key={i.id} to="/insights/$slug" params={{ slug: i.slug }} className="card-tech flex flex-col overflow-hidden">
              {i.cover_image && <img src={i.cover_image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />}
              <div className="p-6 flex flex-col gap-3">
                <p className="text-label-xs text-ember">{i.category}{i.read_minutes ? ` · ${i.read_minutes} min` : ""}</p>
                <h2 className="text-headline-sm">{i.title}</h2>
                {i.excerpt && <p className="text-sm text-muted-foreground leading-relaxed">{i.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
