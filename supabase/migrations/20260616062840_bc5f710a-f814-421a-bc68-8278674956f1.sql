
-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  client TEXT,
  year INTEGER,
  tools TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated can manage projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tools
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  icon_svg TEXT,
  brand_color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tools" ON public.tools FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Certifications
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year INTEGER,
  badge_url TEXT,
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage certifications" ON public.certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company TEXT,
  avatar_url TEXT,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible testimonials" ON public.testimonials FOR SELECT USING (is_visible = true);
CREATE POLICY "Authenticated can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- About content (single-row settings-style)
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biography TEXT,
  profile_photo TEXT,
  hero_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.about_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage about content" ON public.about_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Experience timeline
CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.experience TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience TO authenticated;
GRANT ALL ON public.experience TO service_role;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage experience" ON public.experience FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Messages inbox
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage messages" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Inserts happen through server function with service role; no anon insert needed.

-- Settings (key/value)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
