import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./Header";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo inverse />
            <p className="mt-6 max-w-sm text-primary-foreground/70 leading-relaxed">
              A product research and development studio built in Dhaka. We find real problems, engineer better answers with precision partners abroad, and launch them with our customers — not ahead of them.
            </p>
            <div className="mt-8">
              <p className="text-label-xs text-primary-foreground/50 mb-3">Early access & field notes</p>
              <NewsletterForm variant="dark" source="footer" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-label-xs text-primary-foreground/50 mb-5">Studio</p>
            <ul className="space-y-3 text-sm">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">{n.label}</Link>
                </li>
              ))}
              <li><Link to="/early-customers" className="text-ember hover:text-primary-foreground transition-colors">100 Early Customers</Link></li>
              <li><Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="text-label-xs text-primary-foreground/50 mb-5">Offices</p>
            <ul className="space-y-4 text-sm">
              {SITE.offices.map((o) => (
                <li key={o.name}>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-primary-foreground/60">{o.address}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-label-xs text-primary-foreground/50 mb-5">Reach us</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                  <Mail className="size-4" /> {SITE.email}
                </a>
              </li>
              <li>
                <a href={SITE.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
                  <MessageCircle className="size-4" /> WhatsApp Advisory Desk
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-primary-foreground/10 pt-6 text-label-xs text-primary-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.legalName} · Dhaka · Tokyo · Shenzhen</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-primary-foreground">Terms</Link>
            <Link to="/admin" className="hover:text-primary-foreground">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
