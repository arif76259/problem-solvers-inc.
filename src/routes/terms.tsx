import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/primitives";
import { SITE } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageHead({ title: "Terms & Conditions", description: "Terms for using the Bengal Studio website and taking part in the 100 Early Customers programme.", path: "/terms" }),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="Last updated: 2025" />
      <Section tone="lowest">
        <div className="prose-studio max-w-3xl">
          <h2>The programme</h2>
          <p>The 100 Early Customers programme is operated by {SITE.legalName}. Applying does not guarantee a seat. Selected participants receive prototypes for a fixed trial period and agree to provide honest feedback.</p>
          <h2>Prototypes</h2>
          <p>Prototypes are pre-production units and may have defects. Participants must not resell prototypes. Preferred pricing and warranty terms apply to launched products as published on each product page.</p>
          <h2>Pricing and availability</h2>
          <p>Prices shown in BDT are indicative until a product reaches "Available" status. Launch windows may change.</p>
          <h2>Website use</h2>
          <p>Content on this site is owned by {SITE.legalName}. You may not misuse forms, attempt automated submissions, or interfere with the service.</p>
          <h2>Contact</h2>
          <p>Questions about these terms: {SITE.email}.</p>
        </div>
      </Section>
    </SiteLayout>
  ),
});
