import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, Section } from "@/components/site/primitives";
import { insightQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/insights/$slug")({
  loader: async ({ context, params }) => {
    const row = await context.queryClient.ensureQueryData(insightQuery(params.slug));
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? pageHead({ title: loaderData.title, description: loaderData.excerpt ?? "", path: `/insights/${params.slug}`, type: "article", jsonLd: { "@type": "Article", headline: loaderData.title, datePublished: loaderData.published_at ?? undefined, author: { "@type": "Organization", name: "Bengal Studio" } } })
      : { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <SiteLayout><Section className="pt-40"><h1 className="text-headline-lg">This note doesn't exist.</h1><Button asChild className="mt-6"><Link to="/insights">All insights</Link></Button></Section></SiteLayout>
  ),
  component: Insight,
});

function Insight() {
  const { slug } = Route.useParams();
  const { data: i } = useSuspenseQuery(insightQuery(slug));
  if (!i) return null;
  return (
    <SiteLayout>
      <article className="pt-36 md:pt-44 pb-24">
        <div className="container-site max-w-3xl">
          <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="size-4" /> Insights</Link>
          <Eyebrow className="mb-4">{i.category}{i.read_minutes ? ` · ${i.read_minutes} min read` : ""}</Eyebrow>
          <h1 className="text-headline-lg">{i.title}</h1>
          {i.excerpt && <p className="mt-5 text-body-lg text-muted-foreground">{i.excerpt}</p>}
          {i.cover_image && <img src={i.cover_image} alt="" className="mt-10 w-full rounded-lg border border-border" />}
          <div className="prose-studio mt-10">{(i.body ?? "").split("\n\n").map((p, k) => <p key={k}>{p}</p>)}</div>
        </div>
      </article>
    </SiteLayout>
  );
}
