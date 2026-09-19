import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

/** Publishable-key client for public, RLS-respecting reads inside server functions. */
export function createPublicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export function getClientIp(): string {
  try {
    const req = getRequest();
    const fwd = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "";
    return fwd.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export function getClientCountry(): string | null {
  try {
    return getRequest().headers.get("cf-ipcountry");
  } catch {
    return null;
  }
}

export async function enforceRateLimit(bucket: string, limit: number, windowSeconds: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = getClientIp();
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    _bucket: bucket,
    _key: ip,
    _limit: limit,
    _window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error);
    return; // fail open, but logged
  }
  if (data === false) {
    throw new Error("Too many requests. Please wait a few minutes and try again.");
  }
}

export function generateRegistrationCode(prefix = "BS") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${prefix}-${out.slice(0, 3)}-${out.slice(3)}`;
}
