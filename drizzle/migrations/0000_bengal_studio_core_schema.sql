-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== Shared updated_at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ===== Enums =====
CREATE TYPE public.product_stage AS ENUM ('research','concept','prototype','testing','early_access','launching_soon','available','sold_out','discontinued');
CREATE TYPE public.lead_category AS ENUM ('early_customer','general_customer','b2b_lead','distributor','retailer','manufacturer','partnership','media','investor');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','closed','archived');
CREATE TYPE public.registration_status AS ENUM ('pending','approved','waitlisted','rejected');
CREATE TYPE public.feedback_status AS ENUM ('new','reviewed','actioned','archived');
CREATE TYPE public.campaign_status AS ENUM ('draft','active','closed');

-- ===== Product categories =====
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.product_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage categories" ON public.product_categories FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== Products =====
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  tagline text,
  description text,
  problem_solved text,
  key_features text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  videos text[] NOT NULL DEFAULT '{}',
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_country text,
  stage public.product_stage NOT NULL DEFAULT 'research',
  stage_label text,
  launch_window text,
  price_bdt numeric(12,2),
  price_note text,
  serial_ref text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published products" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage products" ON public.products FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_relations (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, related_product_id)
);
GRANT SELECT ON public.product_relations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_relations TO authenticated;
GRANT ALL ON public.product_relations TO service_role;
ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read relations" ON public.product_relations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage relations" ON public.product_relations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== Product reviews (curated social proof) =====
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_location text,
  cohort_number int,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL,
  tested_days int,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published reviews" ON public.product_reviews FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage reviews" ON public.product_reviews FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== Campaigns =====
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  capacity int NOT NULL DEFAULT 100,
  status public.campaign_status NOT NULL DEFAULT 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read campaigns" ON public.campaigns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== Early customer registrations (PII: no anon access) =====
CREATE TABLE public.early_customer_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code text NOT NULL UNIQUE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  age_range text,
  occupation text,
  product_interest text,
  main_problem text,
  price_range text,
  discovered_via text,
  consent boolean NOT NULL DEFAULT false,
  status public.registration_status NOT NULL DEFAULT 'pending',
  source text,
  utm_source text, utm_medium text, utm_campaign text, referrer text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email),
  UNIQUE (campaign_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.early_customer_registrations TO authenticated;
GRANT ALL ON public.early_customer_registrations TO service_role;
ALTER TABLE public.early_customer_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage registrations" ON public.early_customer_registrations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON public.early_customer_registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public-safe seat counter (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_campaign_stats(_slug text)
RETURNS TABLE (capacity int, claimed bigint, status public.campaign_status)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.capacity,
         (SELECT count(*) FROM public.early_customer_registrations r WHERE r.campaign_id = c.id AND r.status <> 'rejected') AS claimed,
         c.status
  FROM public.campaigns c WHERE c.slug = _slug
$$;
GRANT EXECUTE ON FUNCTION public.get_campaign_stats(text) TO anon, authenticated;

-- ===== Leads (PII: no anon access) =====
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.lead_category NOT NULL DEFAULT 'general_customer',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  country text,
  subject text,
  message text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  status public.lead_status NOT NULL DEFAULT 'new',
  source text,
  utm_source text, utm_medium text, utm_campaign text, referrer text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage leads" ON public.leads FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Product feedback (PII: no anon access) =====
CREATE TABLE public.product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  registration_code text,
  name text NOT NULL,
  email text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  experience text,
  problems text,
  improvements text,
  feature_requests text,
  media_urls text[] NOT NULL DEFAULT '{}',
  category text,
  status public.feedback_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_feedback TO authenticated;
GRANT ALL ON public.product_feedback TO service_role;
ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage feedback" ON public.product_feedback FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER feedback_updated_at BEFORE UPDATE ON public.product_feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Newsletter =====
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  utm_source text, utm_medium text, utm_campaign text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== FAQs =====
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ===== Insights / research posts =====
CREATE TABLE public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text,
  cover_image text,
  category text NOT NULL DEFAULT 'research',
  read_minutes int,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.insights TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published insights" ON public.insights FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage insights" ON public.insights FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER insights_updated_at BEFORE UPDATE ON public.insights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Analytics events (first-party, privacy-conscious) =====
CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  event_name text NOT NULL,
  path text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  device text,
  country text,
  utm_source text, utm_medium text, utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_name_created_idx ON public.analytics_events (event_name, created_at DESC);
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ===== Rate limiting (server-side only) =====
CREATE TABLE public.rate_limits (
  bucket text NOT NULL,
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  count int NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, key)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket text, _key text, _limit int, _window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cur record;
BEGIN
  SELECT * INTO cur FROM public.rate_limits WHERE bucket=_bucket AND key=_key FOR UPDATE;
  IF NOT FOUND OR cur.window_start < now() - make_interval(secs => _window_seconds) THEN
    INSERT INTO public.rate_limits(bucket,key,window_start,count) VALUES (_bucket,_key,now(),1)
      ON CONFLICT (bucket,key) DO UPDATE SET window_start=now(), count=1;
    RETURN true;
  END IF;
  IF cur.count >= _limit THEN RETURN false; END IF;
  UPDATE public.rate_limits SET count = count+1 WHERE bucket=_bucket AND key=_key;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.check_rate_limit(text,text,int,int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text,text,int,int) TO service_role;

-- ===== Seed data =====
INSERT INTO public.product_categories (slug,name,description,sort_order) VALUES
 ('air-quality','Air Quality','Purification and environmental sensing tuned for Bangladeshi cities.',1),
 ('desk-and-kitchen','Desk & Kitchen','Thermal and ceramic objects for daily rituals.',2),
 ('home-ergonomics','Home Ergonomics','Workspace elevation and humidity-safe cable systems.',3);

INSERT INTO public.campaigns (slug,name,description,capacity,status,starts_at) VALUES
 ('cohort-01','100 Early Customers — Cohort 01','Founding cohort of 100 testers in Bangladesh.',100,'active',now());

INSERT INTO public.products (slug,name,category_id,tagline,description,problem_solved,key_features,images,specifications,faqs,source_country,stage,stage_label,launch_window,price_bdt,price_note,serial_ref,is_featured,sort_order) VALUES
 ('auraflow-compact-air-purifier','AuraFlow Compact Modular Air Purifier',(SELECT id FROM public.product_categories WHERE slug='air-quality'),
  'Whisper-quiet purification calibrated for Dhaka winter dust.',
  'A compact, modular purifier engineered around the particulate profile of Dhaka apartments. Extruded champagne aluminum body, acoustic fabric grille, and a washable pre-filter mesh designed for quick local wash cycles.',
  'Dense particulate and seasonal pollution in compact Dhaka apartments — without deafening fan noise and intrusive industrial plastic housing.',
  ARRAY['Extruded champagne aluminum body','Acoustic fabric grille','<28dB whisper-quiet operation','Washable local-dust pre-filter mesh','Wide-band surge suppression (160V–260V)'],
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuCChjA5pSzTpkAQqsZLz_sCEu32oeFJBVyW6olloazmoNlZZskTbXAvisNhJTKedURK36LZt_1eii4bREEtVHGKHJlSN0ZGOIHx0rhdAy6xD6uZpeqLn2FcpI9RNwwyezCG5PUeip19hVyQENxRTm2tmMB9Dir6_PnleDQlYQk8a3HwFrrqJUGh7itr4xj_TmcsWdRnzAgrJhK0hH1qksT2WluLBvPZyc2S7Iwd5AVEC9t8XwF7cf8v0Q','https://lh3.googleusercontent.com/aida-public/AB6AXuCK6iY5s-ao3cNXfnKySWP6QKdoiqZaaVDfWV746BKRNJZaerEvUmzIcQ49HrDEyfGvfEsuGks3Xk1moPLRCQaRM6-mrg_q_7hPzgHPAPI1hTRQfxCR8db0qvrEgIZZ0wA6xUa1Y7n1CAk0QJS0hOdtMJiNP-j6VB3hCQuDhg7reLiZ72a7IXxFNs3-RVqcD6M7_eVGIR2Lhv67MhqG2MwvY1MQ74IiBWUEhfzvAXDKdrmk97CxGcNwHg'],
  '[{"label":"Noise level","value":"<28 dB"},{"label":"Coverage","value":"Up to 28 m²"},{"label":"Filter","value":"Washable pre-filter + HEPA H13"},{"label":"Input voltage","value":"160V–260V AC"},{"label":"Body","value":"6063 extruded aluminum"}]'::jsonb,
  '[{"q":"Can the pre-filter be washed with tap water?","a":"Yes. The mesh is designed for a 2-minute rinse and air-dry cycle every 10 days in the dry season."},{"q":"Does it survive voltage fluctuation?","a":"Every board carries wide-band galvanic surge suppression rated 160V–260V."}]'::jsonb,
  'Japan / China','testing','Stage 04: Functional Field Testing','Q3 2025',18500,'Cohort patron pricing 40% below retail','AF-01-V3',true,1),
 ('komorebi-ceramic-desk-vessel','Komorebi Precision Ceramic Desk Vessel',(SELECT id FROM public.product_categories WHERE slug='desk-and-kitchen'),
  'Keeps cha at 58°C without scorching the tannins.',
  'A slip-cast matte ceramic vessel with a weighted kinetic base and wireless induction heating held at a gentle 58°C — designed for heavily air-conditioned Dhaka workspaces.',
  'Tea and coffee cool within 8 minutes in air-conditioned offices; conventional electric mug heaters scorch tea tannins.',
  ARRAY['Slip-cast matte ceramic','Wireless induction held at 58°C','Weighted kinetic base','Food-grade LFGB-certified glaze'],
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuBUaiDnj92R5drrT-yCoKcxG0Ts8f2fcK2DdlqAgwNYnWopH6Gpt8nxBs8PqCeNXAheQy7Z2MbKRfZ8kN62SYmLEdONJHOf0pFieQpLf6ouzsY9CTM0QnbuXE9cXbUEp3_GMQXvKXnEbORY1RsCEW1Ypz-0iUb3n1jOvsgL6jnUihYEBalfii454L9epuDghhcjYWT1v9Pzzo5HarlFpJAiWcnq8DGSeoDzl0hvPpiz3CPt0LUAV6NE6A'],
  '[{"label":"Hold temperature","value":"58°C ±1°C"},{"label":"Capacity","value":"320 ml"},{"label":"Material","value":"Medical-grade ceramic"},{"label":"Base","value":"Weighted kinetic induction base"}]'::jsonb,
  '[{"q":"Is the glaze food safe?","a":"Yes — chemically inert glaze certified to LFGB standards."}]'::jsonb,
  'Japan','prototype','Stage 03: Tooling & Mold Refinement','Q4 2025',6900,'Waitlist pricing to be announced','KM-01-R1',true,2),
 ('home-ergonomics-system','Humidity-Safe Home Ergonomics System',(SELECT id FROM public.product_categories WHERE slug='home-ergonomics'),
  'Monitor elevation and cable systems that survive monsoon air.',
  'A modular monitor riser and cable management system using passivated fasteners and sealed joints, built for compact apartment desks.',
  'Compact apartment workspaces with poor ergonomics and fasteners that rust within one monsoon.',
  ARRAY['Passivated stainless fasteners','Sealed joints for 94% humidity','Compact-desk footprint'],
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuDtIeEJkTT_Hqi036NChjBn8zLrNsrti_0Rp-4fKvKf_sGXT--JV8kQXenLDVh5mHZHnQwwrg3lDHqBQwUOei7zC07smzkHj29tpoY0z9wIQCrQGon_FsDJ7az6dPznm6xHbB6hb_5BRAMAwQF6RE0ojqANSr0BYBsX14oon5xNwHPw1yHX-cgRkctEMNE8a03hgPheyF3w8ws2HrfjZt2SCimer0pw8DGgPOhgGc45X_wnB2In2BLQ6A'],
  '[]'::jsonb,'[]'::jsonb,'China','concept','Stage 02: Concept & Research','2026',NULL,NULL,'HE-01-C0',false,3);

INSERT INTO public.product_relations VALUES
 ((SELECT id FROM public.products WHERE slug='auraflow-compact-air-purifier'),(SELECT id FROM public.products WHERE slug='komorebi-ceramic-desk-vessel')),
 ((SELECT id FROM public.products WHERE slug='komorebi-ceramic-desk-vessel'),(SELECT id FROM public.products WHERE slug='auraflow-compact-air-purifier'));

INSERT INTO public.product_reviews (product_id,author_name,author_location,cohort_number,rating,body,tested_days,is_published) VALUES
 ((SELECT id FROM public.products WHERE slug='auraflow-compact-air-purifier'),'Tanvir A.','Gulshan 2, Dhaka',12,5,'I didn’t know I needed an air purifier tuned specifically for our fine winter dust until I saw the filter telemetry after 14 days. Night and day.',45,true),
 ((SELECT id FROM public.products WHERE slug='komorebi-ceramic-desk-vessel'),'Nadia M.','Dhanmondi, Dhaka',28,5,'The weight distribution and thermal retention of the mug feels like something from a Ginza boutique, but built for daily cha.',30,true);

INSERT INTO public.faqs (question,answer,category,sort_order) VALUES
 ('Do I get to keep the test products?','Yes, absolutely. All physical cohort hardware delivered to you is yours to keep permanently. You do not return prototypes unless an engineering failure requires analysis in our Banani lab, in which case we replace the unit.','early-customers',1),
 ('What if a prototype fails or breaks during testing?','That is the entire purpose of this initiative. If a contact burns out, a latch fractures, or a finish rubs off, you did nothing wrong — our engineering was tested and revealed a weakness. Report it and we ship a replacement.','early-customers',2),
 ('Is there a membership fee to join?','There are zero membership fees, application costs, or subscriptions. You only cover the subsidized patron manufacturing contribution (40% below retail) when an approved production unit is allocated to you.','early-customers',3),
 ('How are the 100 participants selected?','Admissions are balanced across living situations (high-rise apartments, coastal residences in Chattogram, urban desks in Dhaka), daily power and dust exposure, and evidence of thoughtful observation in your application.','early-customers',4),
 ('Where are products manufactured?','We design in Dhaka and manufacture with tier-1 precision partners in Osaka, Tokyo and Shenzhen. Every geometry is bespoke — we never white-label existing molds.','general',5),
 ('Do you sell to businesses or distributors?','Yes. We are opening B2B, retail and distribution partnerships for Bangladesh, with export markets to follow. Use the Partnership page to start a conversation.','b2b',6);

INSERT INTO public.insights (slug,title,excerpt,body,cover_image,category,read_minutes,is_published,published_at) VALUES
 ('dhaka-winter-pm25-field-log','Field Log: 280 µg/m³ — what Dhaka winter dust does to imported filters','We ran six imported purifiers through a 60-day Dhaka dry season. Four clogged in under three weeks.','Over 60 days across Gulshan, Mirpur and Dhanmondi, we logged particulate density against filter pressure drop on six imported units. The results reshaped the AuraFlow pre-filter geometry: a washable mesh that catches the coarse fraction before it reaches the HEPA layer.

Key findings: average PM2.5 exceeded 280 µg/m³ on 31 of 60 days; four of six imported filters lost 40% airflow within 21 days; a washable pre-filter recovered 96% of airflow after a 2-minute rinse.','https://lh3.googleusercontent.com/aida-public/AB6AXuBujVwbs2tf75RQhct6YHa7CFKaqdoaxtgiFdYi3mDvQLYwupCQjO9WhLlG3ajLQtAnzYq069OsXO-vZj4RIlYuXEbXplCVExeSPXdbBeX4mPYcAEMnFYRCkwmG0l3Hf7Jj2h0gYeOpESRglym_NVEXczHPaUaGjytuRKNegjIjnIIjztCHAIkKVHOuZeI-Y6FhKH2AVPGNeIbXouFSUMBH8IpkMrYiKS0WkdHOHA0ctAf5uOAdpicjbg','research',6,true,now() - interval '20 days'),
 ('why-160v-260v-matters','Why every Bengal Studio board is rated 160V–260V','Brownouts and inverter switching kill microcontrollers. Here is how we design around the grid instead of pretending it is stable.','Line transients in Dhaka residential grids routinely swing between 160V and 260V. Most imported appliances are specified for a ±10% band. We add wide-band galvanic surge suppression natively to every board, and stress-test each prototype through 500 simulated brownout cycles before cohort dispatch.','https://lh3.googleusercontent.com/aida-public/AB6AXuDtIeEJkTT_Hqi036NChjBn8zLrNsrti_0Rp-4fKvKf_sGXT--JV8kQXenLDVh5mHZHnQwwrg3lDHqBQwUOei7zC07smzkHj29tpoY0z9wIQCrQGon_FsDJ7az6dPznm6xHbB6hb_5BRAMAwQF6RE0ojqANSr0BYBsX14oon5xNwHPw1yHX-cgRkctEMNE8a03hgPheyF3w8ws2HrfjZt2SCimer0pw8DGgPOhgGc45X_wnB2In2BLQ6A','engineering',4,true,now() - interval '8 days');