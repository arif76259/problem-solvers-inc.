import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/primitives";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/")({
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(productsQuery()), context.queryClient.ensureQueryData(categoriesQuery)]);
  },
  head: () =>
    pageHead({
      title: "Products",
      description: "Every Bengal Studio product with its development stage, serial reference, source country and launch window — from research concepts to products available in Bangladesh.",
      path: "/products",
    }),
  component: Products,
});

function Products() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [cat, setCat] = useState<string | null>(null);
  const shown = cat ? products.filter((p) => p.product_categories?.slug === cat) : products;

  return (
    <SiteLayout>
      <PageHero eyebrow="Catalogue" title="Products, and where each one stands." description="We publish the stage, serial reference and launch window of everything we're working on. Available products can be ordered; everything else can be followed.">
        <Button asChild variant="ember" size="lg"><Link to="/early-customers">Test them first</Link></Button>
      </PageHero>
      <Section tone="lowest">
        <div className="mb-10 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCat(null)} className={cn("text-label-xs rounded-sm border px-3 py-2 transition-colors", !cat ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-outline-variant")}>All</button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => setCat(c.slug)} className={cn("text-label-xs rounded-sm border px-3 py-2 transition-colors", cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-outline-variant")}>
              {c.name}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
