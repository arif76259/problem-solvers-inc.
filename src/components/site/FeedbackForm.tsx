import { useServerFn } from "@tanstack/react-start";
import { Check, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { getAttribution, track } from "@/lib/analytics";
import { submitFeedback } from "@/lib/public.functions";
import { feedbackSchema } from "@/lib/validation";
import { Field } from "./LeadForm";

export function FeedbackForm({ productId }: { productId?: string }) {
  const send = useServerFn(submitFeedback);
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const media = (raw["media"] ?? "").split(/\s|,/).map((s) => s.trim()).filter(Boolean);
    const parsed = feedbackSchema.safeParse({
      ...raw,
      product_id: productId,
      rating,
      registration_code: raw["registration_code"] || undefined,
      media_urls: media.length ? media : undefined,
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
      track("feedback_submitted", { rating });
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
        <div><p className="font-display font-medium">Feedback logged.</p><p className="text-sm text-muted-foreground mt-1">It goes straight to the engineering review each Friday. Thank you for being specific.</p></div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Your name" required error={errors["name"]} />
      <Field id="email" label="Email" type="email" required error={errors["email"]} />
      <Field id="registration_code" label="Registration ID (e.g. BS-A7K-3M2)" placeholder="BS-XXX-XXX" error={errors["registration_code"]} className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <p className="field-label">Overall rating</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="p-1 text-ember">
              <Star className={`size-6 ${n <= rating ? "fill-current" : "opacity-30"}`} />
            </button>
          ))}
        </div>
        {errors["rating"] && <p className="mt-1 text-xs text-destructive">{errors["rating"]}</p>}
      </div>
      <Area id="experience" label="Overall experience" />
      <Area id="problems" label="Problems you encountered" />
      <Area id="improvements" label="Suggested improvements" />
      <Area id="feature_requests" label="Feature requests" />
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="fb-media">Photo / video links (optional, up to 5)</label>
        <input id="fb-media" name="media" className="field" placeholder="Paste links separated by spaces" />
        {errors["media_urls"] && <p className="mt-1 text-xs text-destructive">{errors["media_urls"]}</p>}
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" size="lg" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Submit feedback"}</Button>
      </div>
      {errors["form"] && <p className="sm:col-span-2 text-sm text-destructive">{errors["form"]}</p>}
    </form>
  );
}

function Area({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <label className="field-label" htmlFor={`fb-${id}`}>{label}</label>
      <textarea id={`fb-${id}`} name={id} rows={3} className="field" />
    </div>
  );
}
