import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, PageHero, Section } from "@/components/site/primitives";
import { faqsQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery()),
  head: ({ loaderData }) =>
    pageHead({
      title: "FAQ",
      description: "Answers about the 100 Early Customers cohort, Bengal Studio products, warranties and partnerships.",
      path: "/faq",
      jsonLd: loaderData ? { "@type": "FAQPage", mainEntity: loaderData.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } : undefined,
    }),
  component: Faq,
});

const LABELS: Record<string, string> = { "early-customers": "100 Early Customers", general: "General", b2b: "Partnerships" };

function Faq() {
  const { data } = useSuspenseQuery(faqsQuery());
  const groups = [...new Set(data.map((f) => f.category))];
  return (
    <SiteLayout>
      <PageHero eyebrow="FAQ" title="Frequently asked questions." />
      <Section tone="lowest">
        <div className="max-w-3xl space-y-14">
          {groups.map((g) => (
            <div key={g}>
              <Eyebrow className="mb-4">{LABELS[g] ?? g}</Eyebrow>
              <Accordion type="single" collapsible>
                {data.filter((f) => f.category === g).map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="text-left font-display text-base">{f.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
