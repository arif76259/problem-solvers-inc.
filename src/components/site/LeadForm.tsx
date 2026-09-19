import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { getAttribution, track } from "@/lib/analytics";
import { submitLead } from "@/lib/public.functions";
import { leadSchema } from "@/lib/validation";
import { LEAD_CATEGORY_LABELS } from "@/lib/site";

type Category = Parameters<typeof leadSchema.parse>[0] extends infer T ? (T extends { category: infer C } ? C : never) : never;

const B2B_CATEGORIES = ["b2b_lead", "distributor", "retailer", "manufacturer", "partnership", "media", "investor"] as const;

export function LeadForm({
  category,
  allowCategory,
  productId,
  subject,
  compact,
  source = "website",
}: {
  category: Category | string;
  allowCategory?: "b2b" | "all";
  productId?: string;
  subject?: string;
  compact?: boolean;
  source?: string;
}) {
  const send = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cat, setCat] = useState<string>(category);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = leadSchema.safeParse({
      ...raw,
      category: cat,
      product_id: productId,
      subject: raw["subject"] || subject,
      phone: raw["phone"] || undefined,
      company: raw["company"] || undefined,
      country: raw["country"] || undefined,
      source,
      ...getAttribution(),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("busy");
    try {
      await send({ data: parsed.data });
      track("lead_submitted", { category: cat, source });
      setState("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong" });
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="card-tech p-6 flex items-start gap-3">
        <Check className="size-5 text-ember shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-medium">Received. Thank you.</p>
          <p className="text-sm text-muted-foreground mt-1">We'll reply from desk@bengalstudio.com within two working days.</p>
        </div>
      </div>
    );
  }

  const cats = allowCategory === "b2b" ? B2B_CATEGORIES : allowCategory === "all" ? (Object.keys(LEAD_CATEGORY_LABELS) as string[]) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      {cats && (
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="lf-cat">I'm reaching out as</label>
          <select id="lf-cat" className="field" value={cat} onChange={(e) => setCat(e.target.value)}>
            {cats.map((c) => <option key={c} value={c}>{LEAD_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
      )}
      <Field id="full_name" label="Full name" error={errors["full_name"]} required />
      <Field id="email" label="Email" type="email" error={errors["email"]} required />
      {!compact && (
        <>
          <Field id="phone" label="Phone (optional)" type="tel" error={errors["phone"]} />
          <Field id="company" label="Company / organisation (optional)" error={errors["company"]} />
          <Field id="country" label="Country" error={errors["country"]} defaultValue="Bangladesh" />
          <Field id="subject" label="Subject" error={errors["subject"]} defaultValue={subject} />
        </>
      )}
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="lf-message">Message</label>
        <textarea id="lf-message" name="message" rows={compact ? 4 : 6} required className="field" aria-invalid={!!errors["message"]} placeholder="What would you like to discuss?" />
        {errors["message"] && <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="sm:col-span-2 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">Protected by server-side validation and rate limiting. See our <a href="/privacy" className="underline">privacy policy</a>.</p>
        <Button type="submit" variant="default" size="lg" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send"}</Button>
      </div>
      {errors["form"] && <p className="sm:col-span-2 text-sm text-destructive">{errors["form"]}</p>}
    </form>
  );
}

export function Field({ id, label, type = "text", error, required, defaultValue, placeholder, className }: { id: string; label: string; type?: string; error?: string; required?: boolean; defaultValue?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={`f-${id}`}>{label}</label>
      <input id={`f-${id}`} name={id} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className="field" aria-invalid={!!error} />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
