-- 1. Schema (backwards-compatible)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS scripture text,
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'Service',
  ADD COLUMN IF NOT EXISTS drive_folder_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.media_gallery
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS media_gallery_drive_file_id_key
  ON public.media_gallery (drive_file_id) WHERE drive_file_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS media_gallery_event_id_idx ON public.media_gallery (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_key ON public.events (slug);

CREATE TABLE IF NOT EXISTS public.archive_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL UNIQUE,
  youtube_url text NOT NULL,
  title text,
  video_date date,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  mission_id uuid REFERENCES public.missions(id) ON DELETE SET NULL,
  notes text,
  is_verified boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.archive_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_videos TO authenticated;
GRANT ALL ON public.archive_videos TO service_role;

ALTER TABLE public.archive_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Archive videos are viewable by everyone"
  ON public.archive_videos FOR SELECT USING (true);
CREATE POLICY "Admins manage archive videos"
  ON public.archive_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.archive_videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Historical events (idempotent on slug)
INSERT INTO public.events (title, slug, description, event_date, start_time, end_time, location, category, event_type, theme, scripture, drive_folder_url, is_published, is_featured)
VALUES
 ('Cultural Sunday 2026','cultural-sunday-2026',
  'MKUCU marked Cultural Sunday with a celebration of the diversity of our campus family in worship, dress and song.',
  '2026-06-21','9:00 AM','12:30 PM','MKU Main Campus','Special Service','Sunday Service',NULL,NULL,
  'https://drive.google.com/drive/folders/1qKGNhHm73TPgRPcy2uy6MrAdaG2CSAS0',true,false),
 ('Worship Night 2026','worship-night-2026',
  'Worship Night 2026 gathered the Christian Union for an evening of praise and worship under the theme Jesus Glorified. Guest Minister: Min. Winnie Moraa. Host: Pst. Dennis Mutwiri. PW Chair: Min. Melissa Musenya. Dress code: Royal Blue & White.',
  '2026-07-10','6:00 PM','10:00 PM','CC Hall','Worship Night','Worship Night','Jesus Glorified','John 17:1',
  'https://drive.google.com/drive/folders/1kJK-GhT8dTjMLMizcvFWeHrxsazC7T3u',true,true),
 ('Unverified Multimedia Archive — 16 July 2026','unverified-archive-16-july-2026',
  'Internal archive folder ("sunday service pictorols") recovered from the 2025/26 multimedia archive. The exact service it documents has not been confirmed, so it is kept unpublished pending verification.',
  '2026-07-16','12:00 PM',NULL,'MKU Main Campus','Archive','Unverified',NULL,NULL,
  'https://drive.google.com/drive/folders/1CVALmJonEgvlwnHWVcFIEmq8EN980RVv',false,false),
 ('Handing Over Service','handing-over-service-2026',
  'The Handing Over Service marking the conclusion of the 2025/26 MKUCU regime and the transition of leadership. Ministering: Bsp. Dr. Patrick Karanja and Rev. Janet Karanja.',
  '2026-08-16','9:00 AM','1:00 PM','MKU Main Campus','Special Service','Special Service',NULL,NULL,
  'https://drive.google.com/drive/folders/1LXEOC8RB7prc1ZSvZ6WG1zNnC_1VDFXf',true,false),
 ('Semester Premier Sunday Service','semester-premier-sunday-service-2026',
  'Semester premier Sunday service: Manifesting the Presence of the Lord, ministered by Pst. Kiseku Muange.',
  '2026-08-30','9:00 AM','12:30 PM','MKCC / The Auditorium','Sunday Service','Sunday Service',
  'Manifesting the Presence of the Lord','Exodus 33:15',NULL,true,true),
 ('Intercessory Kesha — Season One','intercessory-kesha-season-one',
  'Intercessory Kesha, Season One: an all-night prayer meeting under the theme Intimacy With God.',
  '2026-09-04','9:00 PM','5:00 AM','CC Hall','Kesha','Kesha','Intimacy With God','John 15:4',NULL,true,true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Link the existing 30 August photographs + article (no new images created)
UPDATE public.media_gallery m
SET event_id = e.id, media_kind = 'photo'
FROM public.events e
WHERE e.slug = 'semester-premier-sunday-service-2026'
  AND m.event_id IS NULL
  AND m.title LIKE '10004129%';

UPDATE public.events e
SET image_url = COALESCE(e.image_url, (
  SELECT m.media_url FROM public.media_gallery m WHERE m.event_id = e.id ORDER BY m.created_at LIMIT 1))
WHERE e.slug = 'semester-premier-sunday-service-2026';

-- 4. Import Drive photos (each Drive file recorded once)
INSERT INTO public.media_gallery (title, description, media_url, media_type, media_kind, category, event_id, source_url, drive_file_id, sort_order)
SELECT
  'Handing Over Service 2026 — ' || lpad(t.ord::text, 3, '0'),
  'Handing Over Service, 16 August 2026.',
  'https://lh3.googleusercontent.com/d/' || t.fid || '=w1600',
  'image', 'photo', 'Handing Over Service',
  (SELECT id FROM public.events WHERE slug = 'handing-over-service-2026'),
  'https://drive.google.com/file/d/' || t.fid || '/view',
  t.fid, t.ord
FROM unnest(ARRAY[
 '1SsMpuWfaKsHkF0DHB1SF8dMp_yj8nbBy','1CIwE_tYQrYIABrGg2BhQ4jknPTAqigPs','1K_DGlvCysN9JAX970yMaRDWFo4YSkzpH',
 '1BnhQhktdqKRNcCaMr_F89mN9KzAXdYQ6','1IbHHMg6tcn0on08BKPNSO19cchQBKo7D','1aahAAOKMfgW8v_mz3qBTIimm3MLBllVK',
 '19JiY83y4nRb0ENAH0kPpaB4LsxvWnmAs','13QKU6qM8m2SE9jR4Wu1KrqLkOdusPm2_','1POnMO2RrkPYepNcE27dP5xHHrRgXpwEU',
 '1SzXHv7qaVFkl5fzffKT5Rsprb7uNQHQ5','14X0oVJc9HMX7XwW2KFJQJZk8O7MTtcLB','1SOr3Eg0hjiX-mB6G5bmKHEmWVx1NfOKP',
 '1nc4RKliGlJmRkSRj3_YdM-MPEuELnhHZ','1PlS3gk5BqbM5usAkppQNEqFtcIdz6xcN','1tNNrnNF85QZbSv90smxKdixZSS1jRanT',
 '1uZDXQDS_v6vP0dkd4AaUQytMV0-YgJwn','1Chy_ToMT5fujNVI8IgXU8YkMvjFyDMgp','14H76rMnd6B1uuhyVcNGeZJ21akAuj5NY',
 '1zEc84erey_evns2meHCO-X3oRwAMuP1C','1osjnApjg-QluO1GjBmr2D9uCWfd6QZoy','1jkbFPBBiRJVTIrMpqOTFvjqjkLOBftVv',
 '1UJBcXwXTe_xeT490qImVWdHSM8LuPhnQ','1M5shG9TqwQOgg-Fy2xiKIofSBKAtezBx','1Nup1NZNoUKadX76ce7HuvN_SnAElxc78',
 '1lmbSgPaCN2MJHqPmHrOCl4EuEVA-2lLt','1uDInYZxLHK15DjAAR7Rx_U7ZvAHXdsbn','1yiy976D92qYptr-msrUeSrleGb9ZXpwJ',
 '1U5OaEqvksAPxYZsD4_GNeAu1U96feBRK','1PXyvEWutf0Tym5dbTSRtSaRZ27Lymktx','1HJ0TFhfjSByNx0Xvp4djMAkOOMwVOKPN',
 '1bYlOptdQW6loc5evXe3EFeejdCB6v-oE','1UL8g7SrbgkLvVS30BryigrKBRj0VW69-','1_RvbHOFBzVNS1p51sQQ34etjq3zkuu3m',
 '1H6Ffm52XE4-qRdTgnMO6tsitnk5M5gK-','1x5AxfLpUFqrC8BN1mDgAo1uoOlsUMs-d','1scg-h-4tAsp-YeFbrSCS3hH73zC81wAx'
]) WITH ORDINALITY AS t(fid, ord)
ON CONFLICT DO NOTHING;

INSERT INTO public.media_gallery (title, description, media_url, media_type, media_kind, category, event_id, source_url, drive_file_id, sort_order)
SELECT
  'Unverified archive (16 July 2026) — ' || lpad(t.ord::text, 3, '0'),
  'Sunday service pictorial recovered from the 2025/26 multimedia archive; exact service not yet verified.',
  'https://lh3.googleusercontent.com/d/' || t.fid || '=w1600',
  'image', 'photo', 'Unverified Archive',
  (SELECT id FROM public.events WHERE slug = 'unverified-archive-16-july-2026'),
  'https://drive.google.com/file/d/' || t.fid || '/view',
  t.fid, t.ord
FROM unnest(ARRAY[
 '1HoR8DFzKInhfQMkxK-HeXuQHRatHaqG5','1er6gcE7logqNGF8oDGwn3em1zzBVkhNi','1iZ8VPaRawEeuHTaUsB-y6EpAlXGDVvxX',
 '18FmiU14gnNzjSC3d8KjREkYWDkia5Smw','1LSHmiQnIfu2_jJhqPa1oW1rQh2XGnupn','1W9HalYX5X6Il7te-ZwJteqML3Kjd9zhe',
 '1hux-8--w7fJPnvktjBC5OgHIAAQ9W6-5','1ORreQ1dC2u0zxoD8uJA1uJYOVQL1DjGX','1NLawBSCxWohUiqmA0o-5hQuEVRoa-Pd1',
 '1yf1CMIHyNk8WpoSAT2Dp9K7TqHYBBlZO','1oL5xPc4auGiiM601JAz3xyiygcERnqrb','1DFxYmdJ54BKlCe22FtPWrC9Uwn1lPhS4',
 '1_5hYdjcZTNUDdzurKob5qLSuIfkwgQBf','1PEpoeAq85F8_Z6Pd4YP7CsR3MRWJlH4D','12loABA9fGp81bjYDyvrDFMjYlDNZso3Q',
 '1Q4oVITZjWXPkb-pQucFjL9vstMhjSHLl','1z_80VUoGZfU3L79l2_bdHoTVb0k7Kt_l','1fKGjP9GtUK9i2NBFT4WOYNN3hiq6zNt2',
 '19d_QcQEYIrlpNRUyLyZgzA7iOVHIT5Ug','1gy6HSATxsiwqJwKMsivPOnV-vkxcBAXe','1OOvMKUxwiUCCLnpEONdnYjNjoMUaCrn9',
 '1LLiCOAmZtgPXBWK8_pr4z12UfZ_25y8t','1iaGRebroKIbAcgVGc51uos7wWdFaW4u2','1o-vv6vjvvN1oCN-sTsI2oO3ZD5sDi6nj',
 '1ufdNmo7gHQ5cqtaPXrbZmjDLe3NDO7TB','1_3iBuFQkXnl64bF4QzFPiU-Wkb01V1nl','1NULwIUVk79e_sUUogk20rczDRmiitXLO',
 '1EBic-LX6O5X7E1gS9Pxyf9EOL4K57sOo','1RKcbiqWO1FwV9gN0ADaHGLe0MpDsRSFO','1LLNlhvdu0NSQ1-DAN5NPAzKlpXeD6H-t',
 '1HsToroaCHikksVmyGIp43DYO3_VO60AO','1LwsbyjDhtDy_A6MuG0l32tMvAfgfq2qp','1Rc0CRAqZoiohvWMWXNuSpdXQCz7JMWGw',
 '10xXDBABM2gcfucBEIfNYxER60xjkNIdp','1pTuWb1txpGJMhPizi0PoJp3bRCrC7v67','1k-Q03I1NjyIHWV_YQ8shs_iB1PA7EuVt'
]) WITH ORDINALITY AS t(fid, ord)
ON CONFLICT DO NOTHING;

-- Cover images from the imported landscape photos
UPDATE public.events e SET image_url = COALESCE(e.image_url, (
  SELECT m.media_url FROM public.media_gallery m WHERE m.event_id = e.id ORDER BY m.sort_order LIMIT 1))
WHERE e.slug IN ('handing-over-service-2026','unverified-archive-16-july-2026');

-- 5. Mission: enrich the existing record (no duplicate)
UPDATE public.missions
SET title = 'Meru–Maua Main Mission 2026',
    slug = 'meru-maua-main-mission-2026',
    subtitle = COALESCE(subtitle, 'Light to All Nations'),
    location = COALESCE(location, 'Meru & Maua'),
    start_date = COALESCE(start_date, '2026-08-01'),
    description = COALESCE(NULLIF(description, ''),
      'The Meru–Maua Main Mission was the 2025/26 regime''s main outreach. Mission training was held on 1 August 2026 under the theme "Light to All Nations", after which the team moved out to Meru and Maua for the mission proper.'),
    highlights = COALESCE(highlights, ARRAY['Mission training — 1 August 2026','Training theme: Light to All Nations','Meru & Maua outreach'])
WHERE slug = 'mission-2026';

INSERT INTO public.mission_media (mission_id, media_url, media_type, caption, sort_order)
SELECT m.id, v.url, 'video', v.caption, v.ord
FROM public.missions m
CROSS JOIN (VALUES
 ('https://www.youtube.com/live/qnUZJ3jhC9Q','Mission livestream',1),
 ('https://www.youtube.com/live/YJdoE8WiRCo','Mission livestream',2),
 ('https://www.youtube.com/live/MOp7fbGEBL4','Mission livestream',3),
 ('https://www.youtube.com/live/wG35xTbG5mY','Mission livestream',4),
 ('https://www.youtube.com/live/wMItXueb_1k','Mission livestream',5),
 ('https://www.youtube.com/live/E6sRwrLn6oU','Mission livestream',6)
) AS v(url, caption, ord)
WHERE m.slug = 'meru-maua-main-mission-2026'
  AND NOT EXISTS (SELECT 1 FROM public.mission_media mm WHERE mm.mission_id = m.id AND mm.media_url = v.url);

-- 6. Video archive (deduplicated by YouTube id)
INSERT INTO public.archive_videos (youtube_id, youtube_url, title, video_date, event_id, mission_id, is_verified, notes, sort_order)
SELECT v.yid, v.url, v.title, v.vdate,
  (SELECT id FROM public.events WHERE slug = v.event_slug),
  (SELECT id FROM public.missions WHERE slug = 'meru-maua-main-mission-2026' AND v.is_mission),
  v.verified, v.notes, v.ord
FROM (VALUES
 ('HvQEfwG7u4w','https://www.youtube.com/live/HvQEfwG7u4w','Cultural Sunday 2026 — livestream','2026-06-21'::date,'cultural-sunday-2026',false,true,NULL,1),
 ('0XwJ-aTVm4c','https://www.youtube.com/live/0XwJ-aTVm4c','Cultural Sunday 2026 — livestream (part 2)','2026-06-21'::date,'cultural-sunday-2026',false,true,NULL,2),
 ('soMNnHOkmgE','https://www.youtube.com/live/soMNnHOkmgE','Worship Night 2026 — Jesus Glorified','2026-07-10'::date,'worship-night-2026',false,true,NULL,3),
 ('vgw6UR_xAeo','https://www.youtube.com/live/vgw6UR_xAeo','Handing Over Service — livestream','2026-08-16'::date,'handing-over-service-2026',false,true,NULL,4),
 ('TfyOjRJlWgA','https://www.youtube.com/live/TfyOjRJlWgA','Handing Over Service — livestream (part 2)','2026-08-16'::date,'handing-over-service-2026',false,true,NULL,5),
 ('AG8Nm068zO8','https://youtube.com/live/AG8Nm068zO8','Manifesting the Presence of the Lord — Semester Premier Sunday Service','2026-08-30'::date,'semester-premier-sunday-service-2026',false,true,NULL,6),
 ('LRe5tu5NkDk','https://www.youtube.com/live/LRe5tu5NkDk',NULL,NULL,NULL,false,false,'Shared alongside the Intercessory Kesha announcement; relationship to the event not yet verified.',7),
 ('l4hqBPaN9RM','https://www.youtube.com/live/l4hqBPaN9RM',NULL,NULL,NULL,false,false,'Shared alongside the Intercessory Kesha announcement; relationship to the event not yet verified.',8),
 ('ZQ2GVnpCEW0','https://www.youtube.com/live/ZQ2GVnpCEW0',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',9),
 ('Y8yplY0S4Og','https://www.youtube.com/live/Y8yplY0S4Og',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',10),
 ('VFPg3YJBrmY','https://www.youtube.com/live/VFPg3YJBrmY',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',11),
 ('I7AEbIc_2u4','https://www.youtube.com/live/I7AEbIc_2u4',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',12),
 ('U0iZTOxFXbQ','https://www.youtube.com/live/U0iZTOxFXbQ',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',13),
 ('bJXeNug1Vmc','https://www.youtube.com/live/bJXeNug1Vmc',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',14),
 ('R1ndfsat_xI','https://www.youtube.com/live/R1ndfsat_xI',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',15),
 ('B2znWcENBtI','https://www.youtube.com/live/B2znWcENBtI',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',16),
 ('RA-3rapohqA','https://www.youtube.com/live/RA-3rapohqA',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',17),
 ('cYbzZ-smWb0','https://www.youtube.com/live/cYbzZ-smWb0',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',18),
 ('Y4fWucSYW_0','https://www.youtube.com/live/Y4fWucSYW_0',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',19),
 ('47lIPfqnKKo','https://www.youtube.com/live/47lIPfqnKKo',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',20),
 ('nP4NalW5pq0','https://www.youtube.com/live/nP4NalW5pq0',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',21),
 ('fJM5XcgA8ak','https://www.youtube.com/live/fJM5XcgA8ak',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',22),
 ('6pPDVVXNfHs','https://www.youtube.com/live/6pPDVVXNfHs',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',23),
 ('e-6sJIFKcCw','https://www.youtube.com/live/e-6sJIFKcCw',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',24),
 ('duTY7kKZ-vg','https://www.youtube.com/live/duTY7kKZ-vg',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',25),
 ('Xq7W_5rnLAc','https://www.youtube.com/live/Xq7W_5rnLAc',NULL,NULL,NULL,false,false,'Unclassified historical livestream.',26),
 ('qnUZJ3jhC9Q','https://www.youtube.com/live/qnUZJ3jhC9Q','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,27),
 ('YJdoE8WiRCo','https://www.youtube.com/live/YJdoE8WiRCo','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,28),
 ('MOp7fbGEBL4','https://www.youtube.com/live/MOp7fbGEBL4','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,29),
 ('wG35xTbG5mY','https://www.youtube.com/live/wG35xTbG5mY','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,30),
 ('wMItXueb_1k','https://youtube.com/live/wMItXueb_1k','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,31),
 ('E6sRwrLn6oU','https://youtube.com/live/E6sRwrLn6oU','Meru–Maua Main Mission 2026 — livestream',NULL,NULL,true,true,NULL,32)
) AS v(yid, url, title, vdate, event_slug, is_mission, verified, notes, ord)
ON CONFLICT (youtube_id) DO NOTHING;
