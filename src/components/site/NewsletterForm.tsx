import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { getAttribution, track } from "@/lib/analytics";
import { subscribeNewsletter } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "light", source = "newsletter" }: { variant?: "light" | "dark"; source?: string }) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await subscribe({ data: { email, website: String(fd.get("website") ?? ""), source, ...getAttribution() } });
      track("newsletter_subscribed", { source });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className={cn("inline-flex items-center gap-2 text-sm", variant === "dark" ? "text-primary-foreground" : "text-foreground")}>
        <Check className="size-4 text-ember" /> You're on the list. Field notes arrive roughly twice a month.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
      <label htmlFor={`nl-${source}`} className="sr-only">Email address</label>
      <input
        id={`nl-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={cn(
          "field sm:flex-1",
          variant === "dark" && "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:border-ember",
        )}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Button type="submit" variant={variant === "dark" ? "ember" : "default"} disabled={state === "busy"}>
        {state === "busy" ? "Joining…" : "Join"} <ArrowRight className="size-4" />
      </Button>
      {error && <p className="text-xs text-destructive sm:basis-full">{error}</p>}
    </form>
  );
}
