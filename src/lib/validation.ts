import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const bdPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .refine((v) => /^(\+?88)?01[3-9]\d{8}$/.test(v) || /^\+?[1-9]\d{7,14}$/.test(v), {
    message: "Enter a valid phone number (e.g. 017XXXXXXXX)",
  })
  .transform((v) => (/^01[3-9]\d{8}$/.test(v) ? `+88${v}` : v.startsWith("+") ? v : `+${v}`));

export const utmSchema = z.object({
  utm_source: trimmed(100).optional(),
  utm_medium: trimmed(100).optional(),
  utm_campaign: trimmed(100).optional(),
  referrer: trimmed(500).optional(),
  source: trimmed(100).optional(),
  session_id: trimmed(80).optional(),
  device: trimmed(20).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export const registrationSchema = z
  .object({
    full_name: trimmed(100).min(2, "Please enter your full name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
    phone: bdPhone,
    location: trimmed(160).min(2, "Tell us your city or neighbourhood"),
    age_range: trimmed(20).optional(),
    occupation: trimmed(120).optional(),
    product_interest: trimmed(120).min(1, "Choose a prototype focus"),
    main_problem: trimmed(1500).optional(),
    price_range: trimmed(40).optional(),
    discovered_via: trimmed(60).optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "Consent is required to contact you about the cohort" }) }),
  })
  .merge(utmSchema);
export type RegistrationInput = z.input<typeof registrationSchema>;

export const leadSchema = z
  .object({
    category: z.enum([
      "early_customer",
      "general_customer",
      "b2b_lead",
      "distributor",
      "retailer",
      "manufacturer",
      "partnership",
      "media",
      "investor",
    ]),
    full_name: trimmed(100).min(2, "Please enter your name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
    phone: trimmed(30).optional(),
    company: trimmed(160).optional(),
    country: trimmed(80).optional(),
    subject: trimmed(160).optional(),
    message: trimmed(3000).min(10, "Tell us a little more (at least 10 characters)"),
    product_id: z.string().uuid().optional(),
  })
  .merge(utmSchema);
export type LeadInput = z.input<typeof leadSchema>;

export const newsletterSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  })
  .merge(utmSchema);

export const feedbackSchema = z
  .object({
    product_id: z.string().uuid().optional(),
    registration_code: trimmed(30).optional(),
    name: trimmed(100).min(2, "Please enter your name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
    rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
    experience: trimmed(3000).optional(),
    problems: trimmed(3000).optional(),
    improvements: trimmed(3000).optional(),
    feature_requests: trimmed(3000).optional(),
    media_urls: z.array(z.string().url().max(500)).max(5).optional(),
  })
  .merge(utmSchema);
export type FeedbackInput = z.input<typeof feedbackSchema>;

export const eventSchema = z.object({
  event_name: trimmed(60).min(1),
  path: trimmed(300).optional(),
  properties: z.record(z.union([z.string().max(200), z.number(), z.boolean()])).optional(),
  session_id: trimmed(80).optional(),
  device: trimmed(20).optional(),
  utm_source: trimmed(100).optional(),
  utm_medium: trimmed(100).optional(),
  utm_campaign: trimmed(100).optional(),
});
