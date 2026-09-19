import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Section } from "@/components/site/primitives";
import { SITE } from "@/lib/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead({ title: "Privacy Policy", description: "How Bengal Studio collects, stores and uses personal information from early customers, subscribers and partners.", path: "/privacy" }),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated: 2025" />
      <Section tone="lowest">
        <div className="prose-studio max-w-3xl">
          <h2>What we collect</h2>
          <p>When you apply to the 100 Early Customers cohort, subscribe, submit feedback or contact us, we collect the information you provide: name, email, phone, location, and your answers. We also record basic usage data (page views, device type, campaign source) to understand how the site is used.</p>
          <h2>How we use it</h2>
          <p>To run the cohort, allocate prototypes, deliver products, respond to inquiries, send updates you consented to, and improve our products. We do not sell personal data.</p>
          <h2>Storage and security</h2>
          <p>Data is stored in access-controlled cloud infrastructure. Personal information is never exposed through public website interfaces; only authorised staff can view it.</p>
          <h2>Your rights</h2>
          <p>You can request a copy, correction or deletion of your data, or withdraw consent, at any time by emailing {SITE.email}.</p>
          <h2>Analytics</h2>
          <p>We use privacy-conscious first-party analytics and may use Google Analytics and Meta Pixel with IP anonymisation to measure campaigns.</p>
        </div>
      </Section>
    </SiteLayout>
  ),
});
