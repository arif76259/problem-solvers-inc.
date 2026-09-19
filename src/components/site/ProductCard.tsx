import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { STAGE_LABELS, formatBDT } from "@/lib/site";
import { StageBadge } from "./primitives";

export type ProductCardData = {
  slug: string;
  name: string;
  tagline?: string | null;
  images?: string[] | null;
  stage: string;
  stage_label?: string | null;
  launch_window?: string | null;
  price_bdt?: number | null;
  serial_ref?: string | null;
  source_country?: string | null;
};

export function ProductCard({ p, large }: { p: ProductCardData; large?: boolean }) {
  const img = p.images?.[0];
  return (
    <Link to="/products/$slug" params={{ slug: p.slug }} className="card-tech group flex flex-col overflow-hidden">
      <div className={large ? "aspect-[16/10] overflow-hidden bg-surface-low" : "aspect-[4/3] overflow-hidden bg-surface-low"}>
        {img ? (
          <img src={img} alt={p.name} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid-paper size-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <StageBadge stage={p.stage} label={STAGE_LABELS[p.stage] ?? p.stage} />
          {p.serial_ref && <span className="text-label-xs text-outline">{p.serial_ref}</span>}
        </div>
        <h3 className="text-headline-sm text-foreground flex items-start justify-between gap-2">
          {p.name}
          <ArrowUpRight className="size-4 shrink-0 mt-1.5 text-outline transition-colors group-hover:text-ember" />
        </h3>
        {p.tagline && <p className="text-sm text-muted-foreground leading-relaxed">{p.tagline}</p>}
        <div className="mt-auto flex items-center justify-between pt-3 text-label-xs text-muted-foreground">
          <span>{p.stage_label ?? p.launch_window ?? (p.source_country ? `Built in ${p.source_country}` : "")}</span>
          {p.price_bdt != null && <span className="text-foreground">{formatBDT(p.price_bdt)}</span>}
        </div>
      </div>
    </Link>
  );
}
