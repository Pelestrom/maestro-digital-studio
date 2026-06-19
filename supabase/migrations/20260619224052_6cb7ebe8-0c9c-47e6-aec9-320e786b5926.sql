
DO $$ BEGIN
  CREATE TYPE public.message_status AS ENUM ('new','read','in_progress','replied','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS status public.message_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS ip_address text;

UPDATE public.messages SET status = 'read' WHERE is_read = true AND status = 'new';
