CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text,
  location text,
  description text,
  start_date date,
  end_date date,
  cover_image text,
  youtube_playlist_url text,
  highlights text[],
  status text NOT NULL DEFAULT 'completed',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mission_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  thumbnail_url text,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mission_media_mission_id_idx ON public.mission_media(mission_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO anon, authenticated;
GRANT ALL ON public.missions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_media TO anon, authenticated;
GRANT ALL ON public.mission_media TO service_role;

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions full access" ON public.missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Mission media full access" ON public.mission_media FOR ALL USING (true) WITH CHECK (true);