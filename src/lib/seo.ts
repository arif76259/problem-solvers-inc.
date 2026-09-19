import { SITE } from "./site";

type Script = { type: string; children: string };

export function pageHead(opts: { title: string; description: string; path: string; type?: string; image?: string; jsonLd?: Record<string, unknown> | Record<string, unknown>[] | undefined; noindex?: boolean }) {
  const title = opts.title.includes(SITE.name) ? opts.title : `${opts.title} — ${SITE.name}`;
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: opts.path },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image }, { name: "twitter:image", content: opts.image });
  }
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  const scripts: Script[] = [];
  if (opts.jsonLd) {
    const list = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
    for (const j of list) scripts.push({ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", ...j }) });
  }
  return { meta, links: [{ rel: "canonical", href: opts.path }], scripts };
}
