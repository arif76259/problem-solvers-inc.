import { createFileRoute } from "@tanstack/react-router";
import { Building2, Factory, Store, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FeatureCard, PageHero, Section, SectionHeader } from "@/components/site/primitives";
import { LeadForm } from "@/components/site/LeadForm";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/partners")({
  head: () => pageHead({ title: "B2B & Partnerships", description: "Distribute, retail, manufacture or co-develop with Bengal Studio. Partnership routes for distributors, retailers, manufacturers, media and investors.", path: "/partners" }),
  component: Partners,
});

function Partners() {
  return (
    <SiteLayout>
      <PageHero eyebrow="B2B & partnerships" title="Build the distribution with us." description="We're assembling the partners who will carry proven products across Bangladesh and, later, to export markets." />
      <Section tone="lowest">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Truck} index="01" title="Distributors">Regional and national distribution for launched products, with warranty and spare-part support from Dhaka.</FeatureCard>
          <FeatureCard icon={Store} index="02" title="Retailers">Curated retail and showroom placements for products with proven field performance.</FeatureCard>
          <FeatureCard icon={Factory} index="03" title="Manufacturers">Precision partners in Japan, China and beyond who can iterate in small runs with material traceability.</FeatureCard>
          <FeatureCard icon={Building2} index="04" title="Corporate & investors">Bulk programmes for offices and institutions; business and investment inquiries.</FeatureCard>
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Start a conversation" title="Tell us who you are and what you have in mind." />
        <div className="max-w-3xl"><LeadForm category="b2b_lead" allowCategory="b2b" source="partners" /></div>
      </Section>
    </SiteLayout>
  );
}
