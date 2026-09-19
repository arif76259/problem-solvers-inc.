import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, dot }: { children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("text-label inline-flex items-center gap-2 text-ember", className)}>
      {dot && <span className="size-1.5 rounded-full bg-ember animate-pulse-dot" />}
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  right,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("mb-12 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between", align === "center" && "text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="text-headline-lg text-foreground">{title}</h2>
        {description && <p className="mt-4 text-body-lg text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function Section({ children, className, id, tone = "default" }: { children: ReactNode; className?: string; id?: string; tone?: "default" | "low" | "dark" | "lowest" }) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
        tone === "low" && "bg-surface-low",
        tone === "lowest" && "bg-surface-lowest",
        tone === "dark" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      <div className="container-site">{children}</div>
    </section>
  );
}

export function FeatureCard({ icon: Icon, index, title, children, meta }: { icon: LucideIcon; index?: string; title: string; children: ReactNode; meta?: string }) {
  return (
    <div className="card-tech p-7 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-md bg-secondary-container text-primary">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        {index && <span className="text-label-xs text-outline">{index}</span>}
      </div>
      <h3 className="text-headline-sm text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
      {meta && <p className="text-label-xs text-ember mt-auto pt-2">{meta}</p>}
    </div>
  );
}

export function Stat({ value, label, className }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{value}</span>
      <span className="text-label-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function ArrowLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline", className)}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function PageHero({ eyebrow, title, description, children, tone = "default" }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; children?: ReactNode; tone?: "default" | "dark" }) {
  const dark = tone === "dark";
  return (
    <section className={cn("relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24", dark ? "bg-primary text-primary-foreground grid-paper-dark" : "bg-surface grid-paper")}>
      <div className="container-site relative">
        <div className="max-w-3xl animate-rise">
          {eyebrow && <Eyebrow className="mb-5" dot>{eyebrow}</Eyebrow>}
          <h1 className="text-display">{title}</h1>
          {description && <p className={cn("mt-6 text-body-lg max-w-2xl", dark ? "text-primary-foreground/75" : "text-muted-foreground")}>{description}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function StageBadge({ stage, label, className }: { stage: string; label?: string | null | undefined; className?: string }) {
  const tone =
    stage === "available" || stage === "early_access"
      ? "bg-secondary-container text-secondary-container-foreground"
      : stage === "testing" || stage === "launching_soon"
        ? "bg-ember/10 text-ember-container"
        : stage === "sold_out" || stage === "discontinued"
          ? "bg-surface-high text-muted-foreground"
          : "bg-surface-high text-foreground";
  return <span className={cn("text-label-xs inline-flex items-center rounded-sm px-2 py-1", tone, className)}>{label ?? stage.replace("_", " ")}</span>;
}
