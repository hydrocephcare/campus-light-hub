ALTER TABLE public.media_gallery
  ADD COLUMN IF NOT EXISTS media_kind text NOT NULL DEFAULT 'photo';

ALTER TABLE public.media_gallery
  DROP CONSTRAINT IF EXISTS media_gallery_media_kind_check;

ALTER TABLE public.media_gallery
  ADD CONSTRAINT media_gallery_media_kind_check CHECK (media_kind IN ('poster','photo'));

UPDATE public.media_gallery SET media_kind = 'photo' WHERE media_kind IS NULL;