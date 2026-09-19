/**
 * Privacy-conscious analytics.
 * - First-party events go to our own database via trackEvent (no PII).
 * - GA4 / Meta Pixel are loaded only when VITE_GA4_ID / VITE_META_PIXEL_ID are set.
 * - UTM parameters are captured once per session and attached to every submission.
 */
import { trackEvent } from "./public.functions";

const UTM_KEY = "bs_utm";
const SESSION_KEY = "bs_sid";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  session_id?: string;
  device?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getDevice(): string {
  if (!isBrowser()) return "unknown";
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export function captureAttribution() {
  if (!isBrowser()) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const existing = JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "null") as Attribution | null;
    const fresh: Attribution = {
      utm_source: params.get("utm_source") ?? existing?.utm_source ?? undefined,
      utm_medium: params.get("utm_medium") ?? existing?.utm_medium ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? existing?.utm_campaign ?? undefined,
      referrer: existing?.referrer ?? (document.referrer && !document.referrer.includes(location.host) ? document.referrer.slice(0, 500) : undefined),
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(fresh));
    if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, crypto.randomUUID());
  } catch {
    /* storage unavailable */
  }
}

export function getAttribution(): Attribution {
  if (!isBrowser()) return {};
  try {
    const utm = JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "{}") as Attribution;
    return { ...utm, session_id: sessionStorage.getItem(SESSION_KEY) ?? undefined, device: getDevice() };
  } catch {
    return { device: getDevice() };
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initThirdPartyAnalytics() {
  if (!isBrowser()) return;
  const ga = import.meta.env["VITE_GA4_ID"] as string | undefined;
  const pixel = import.meta.env["VITE_META_PIXEL_ID"] as string | undefined;
  if (ga && !window.gtag) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga, { anonymize_ip: true });
  }
  if (pixel && !window.fbq) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    const queue: unknown[][] = [];
    const fbq = ((...args: unknown[]) => queue.push(args)) as unknown as NonNullable<Window["fbq"]> & { queue?: unknown[][] };
    fbq.queue = queue;
    window.fbq = fbq;
    window.fbq("init", pixel);
    window.fbq("track", "PageView");
  }
}

let lastPath = "";
export function track(event: string, props: Record<string, string | number | boolean> = {}) {
  if (!isBrowser()) return;
  const attr = getAttribution();
  const path = window.location.pathname;
  if (event === "page_view") {
    if (lastPath === path) return;
    lastPath = path;
  }
  try {
    window.gtag?.("event", event, props);
    if (event === "early_customer_registered") window.fbq?.("track", "CompleteRegistration");
    else if (event === "lead_submitted") window.fbq?.("track", "Lead");
    else if (event === "newsletter_subscribed") window.fbq?.("track", "Subscribe");
  } catch {
    /* ignore */
  }
  void trackEvent({
    data: {
      event_name: event,
      path,
      properties: props,
      session_id: attr.session_id,
      device: attr.device,
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      utm_campaign: attr.utm_campaign,
    },
  }).catch(() => undefined);
}
