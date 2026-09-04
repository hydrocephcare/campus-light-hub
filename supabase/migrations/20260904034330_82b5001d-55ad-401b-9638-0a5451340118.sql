CREATE TABLE public.leadership_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  label TEXT,
  scripture TEXT,
  poster_url TEXT,
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leadership_terms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leadership_terms TO authenticated;
GRANT ALL ON public.leadership_terms TO service_role;

ALTER TABLE public.leadership_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership terms are viewable by everyone"
  ON public.leadership_terms FOR SELECT USING (true);

CREATE POLICY "Admins can manage leadership terms"
  ON public.leadership_terms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_leadership_terms_updated_at
  BEFORE UPDATE ON public.leadership_terms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.leadership_terms (term, label, scripture, is_current, display_order)
VALUES
  ('2026-2027', 'Executive Committee', NULL, true, 1),
  ('2025-2026', 'Executive Committee', '1 Peter 2:9', false, 2)
ON CONFLICT (term) DO NOTHING;