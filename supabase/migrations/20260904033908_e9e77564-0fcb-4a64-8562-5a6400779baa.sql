ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS term text NOT NULL DEFAULT '2026-2027',
  ADD COLUMN IF NOT EXISTS docket text;

CREATE INDEX IF NOT EXISTS leaders_term_order_idx ON public.leaders (term, display_order);