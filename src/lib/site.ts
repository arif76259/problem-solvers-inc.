export const SITE = {
  name: "Bengal Studio",
  legalName: "Bengal Studio Ltd.",
  tagline: "We're building what people will need next.",
  description:
    "Bengal Studio is a Bangladesh-based product research and development studio. We discover real problems, develop better products with precision manufacturing partners in Japan and China, and invite our first 100 customers to shape what comes next.",
  email: "desk@bengalstudio.com",
  phone: "+880 1700 000000",
  whatsapp: "https://wa.me/8801700000000",
  logo: "https://lh3.googleusercontent.com/aida/AEtjO1V7ujJ_3knZmeL2HdytlwsbIs_XWvzWUz_0IfbH93PvryRz9q2FZ9pXMdwObqB0HdJdvhNEy9F2b2EHj9Fo74b7h_bacZr7nfjCTgtkzlDZm02uz_jmq_Ilhm7UBN61A3wYGBj_GDFVYN4k2vImTAQnffyxRmrgHl3Dl61ZIVjw17nlb3U87YxoAOruPAZjWKptRg_FjwvaLsfWDa8fbx555SOjHgQRs7Aq3O9qZt-0Takrb-65vJ_5QIAb",
  offices: [
    { name: "Dhaka Atelier & Lab", address: "Plot 14, Road 11, Banani C/A, Dhaka 1213, Bangladesh" },
    { name: "Tokyo Liaison", address: "Minato-ku, Minami-Aoyama 4-Chome" },
    { name: "Shenzhen Sourcing Hub", address: "Nanshan High-Tech Industrial Park" },
  ],
  cohortSlug: "cohort-01",
} as const;

export const IMAGES = {
  heroDesk:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDtIeEJkTT_Hqi036NChjBn8zLrNsrti_0Rp-4fKvKf_sGXT--JV8kQXenLDVh5mHZHnQwwrg3lDHqBQwUOei7zC07smzkHj29tpoY0z9wIQCrQGon_FsDJ7az6dPznm6xHbB6hb_5BRAMAwQF6RE0ojqANSr0BYBsX14oon5xNwHPw1yHX-cgRkctEMNE8a03hgPheyF3w8ws2HrfjZt2SCimer0pw8DGgPOhgGc45X_wnB2In2BLQ6A",
  inspection:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBujVwbs2tf75RQhct6YHa7CFKaqdoaxtgiFdYi3mDvQLYwupCQjO9WhLlG3ajLQtAnzYq069OsXO-vZj4RIlYuXEbXplCVExeSPXdbBeX4mPYcAEMnFYRCkwmG0l3Hf7Jj2h0gYeOpESRglym_NVEXczHPaUaGjytuRKNegjIjnIIjztCHAIkKVHOuZeI-Y6FhKH2AVPGNeIbXouFSUMBH8IpkMrYiKS0WkdHOHA0ctAf5uOAdpicjbg",
  auraflowHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCK6iY5s-ao3cNXfnKySWP6QKdoiqZaaVDfWV746BKRNJZaerEvUmzIcQ49HrDEyfGvfEsuGks3Xk1moPLRCQaRM6-mrg_q_7hPzgHPAPI1hTRQfxCR8db0qvrEgIZZ0wA6xUa1Y7n1CAk0QJS0hOdtMJiNP-j6VB3hCQuDhg7reLiZ72a7IXxFNs3-RVqcD6M7_eVGIR2Lhv67MhqG2MwvY1MQ74IiBWUEhfzvAXDKdrmk97CxGcNwHg",
} as const;

export const NAV = [
  { to: "/about", label: "About" },
  { to: "/how-we-build", label: "How We Build" },
  { to: "/products", label: "Products" },
  { to: "/upcoming-products", label: "Upcoming" },
  { to: "/insights", label: "Insights" },
  { to: "/partners", label: "Partners" },
] as const;

export const STAGE_LABELS: Record<string, string> = {
  research: "Research",
  concept: "Concept",
  prototype: "Prototype",
  testing: "Testing",
  early_access: "Early Access",
  launching_soon: "Launching Soon",
  available: "Available",
  sold_out: "Sold Out",
  discontinued: "Discontinued",
};

export const STAGE_ORDER = [
  "research",
  "concept",
  "prototype",
  "testing",
  "early_access",
  "launching_soon",
  "available",
  "sold_out",
  "discontinued",
] as const;

export const UPCOMING_STAGES = ["research", "concept", "prototype", "testing", "early_access", "launching_soon"];

export const LEAD_CATEGORY_LABELS: Record<string, string> = {
  early_customer: "Early Customer",
  general_customer: "General Customer",
  b2b_lead: "B2B Lead",
  distributor: "Distributor",
  retailer: "Retailer",
  manufacturer: "Manufacturer",
  partnership: "Partnership",
  media: "Media",
  investor: "Investor / Business Inquiry",
};

export const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];
export const PRICE_RANGES = ["Under ৳2,000", "৳2,000–5,000", "৳5,000–10,000", "৳10,000–20,000", "৳20,000+"];
export const DISCOVERY_SOURCES = ["Facebook / Instagram", "Friend or colleague", "LinkedIn", "Search", "News / Media", "Event", "Other"];

export function formatBDT(value: number | null | undefined) {
  if (value == null) return null;
  return `৳${new Intl.NumberFormat("en-BD").format(value)}`;
}

export function stageBadgeClass(stage: string) {
  switch (stage) {
    case "available":
    case "early_access":
      return "bg-secondary-container text-secondary-container-foreground";
    case "testing":
    case "launching_soon":
      return "bg-ember/10 text-ember-container";
    case "sold_out":
    case "discontinued":
      return "bg-surface-high text-muted-foreground";
    default:
      return "bg-surface-high text-foreground";
  }
}
