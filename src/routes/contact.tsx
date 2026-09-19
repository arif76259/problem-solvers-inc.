import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Mail, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/primitives";
import { LeadForm } from "@/components/site/LeadForm";
import { SITE } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  validateSearch: z.object({ subject: z.string().max(160).optional() }),
  head: () => pageHead({ title: "Contact", description: "Reach the Bengal Studio desk in Dhaka by email, WhatsApp or the contact form.", path: "/contact" }),
  component: Contact,
});

function Contact() {
  const { subject } = Route.useSearch();
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Talk to the desk." description="Product questions, orders, press, or anything else. A person replies, usually within two working days." />
      <Section tone="lowest">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-8 text-sm">
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 font-medium"><Mail className="size-5 text-ember" />{SITE.email}</a>
            <a href={SITE.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-medium"><MessageCircle className="size-5 text-ember" />WhatsApp Advisory Desk</a>
            {SITE.offices.map((o) => (<div key={o.name}><p className="font-medium">{o.name}</p><p className="text-muted-foreground">{o.address}</p></div>))}
          </div>
          <div className="lg:col-span-8"><LeadForm category="general_customer" allowCategory="all" subject={subject} source="contact" /></div>
        </div>
      </Section>
    </SiteLayout>
  );
}
