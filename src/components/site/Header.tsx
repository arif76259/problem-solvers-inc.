import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NAV, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-8 bg-primary text-primary-foreground">
      <div className="container-site flex h-full items-center justify-between text-label-xs">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-ember animate-pulse-dot" />
          100 Early Customers Initiative
        </span>
        <Link to="/early-customers" className="hidden sm:inline text-primary-foreground/70 hover:text-primary-foreground transition-colors">
          Cohort 01 · Applications open →
        </Link>
      </div>
    </div>
  );
}

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${SITE.name} home`}>
      <span className={cn("flex size-8 items-center justify-center rounded-sm font-display text-sm font-bold", inverse ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground")}>
        BS
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">{SITE.name}</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-8 z-40 transition-all", scrolled || open ? "bg-surface/95 backdrop-blur-md border-b border-border" : "bg-surface/80 backdrop-blur-sm")}>
      <div className="container-site flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-sm font-medium text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/contact">Contact</Link>
          </Button>
          <Button asChild variant="ember" size="sm">
            <Link to="/early-customers" onClick={() => track("cta_click", { cta: "header_become_one" })}>
              Become One of the 100
            </Link>
          </Button>
        </div>
        <button
          type="button"
          className="lg:hidden inline-flex size-10 items-center justify-center rounded-md text-foreground"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-surface">
          <nav className="container-site flex flex-col py-4" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="py-3 text-base font-medium border-b border-border last:border-0" activeProps={{ className: "py-3 text-base font-medium border-b border-border text-ember" }}>
                {n.label}
              </Link>
            ))}
            <Link to="/contact" className="py-3 text-base font-medium">Contact</Link>
            <Button asChild variant="ember" size="lg" className="mt-3">
              <Link to="/early-customers" onClick={() => track("cta_click", { cta: "mobile_menu_become_one" })}>Become One of the 100</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
