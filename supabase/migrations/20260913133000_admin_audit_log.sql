-- Record every content mutation so unexpected changes can be traced.
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  old_data jsonb,
  new_data jsonb
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_audit_log FROM anon;
GRANT SELECT ON public.admin_audit_log TO authenticated;

DROP POLICY IF EXISTS admin_audit_log_admin_read ON public.admin_audit_log;
CREATE POLICY admin_audit_log_admin_read
ON public.admin_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid text;
BEGIN
  rid := COALESCE((CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'id', NULL);
  INSERT INTO public.admin_audit_log(table_name, record_id, action, changed_by, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    rid,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DO $$
DECLARE
  tbl text;
  managed_tables text[] := ARRAY[
    'announcements','archive_videos','blog_posts','daily_schedule',
    'election_candidates','elections','events','faqs','fellowships',
    'hero_slides','home_fellowships','leaders','leadership_terms',
    'media_gallery','ministries','mission_media','missions','notifications',
    'sermons','site_settings','special_programs','volunteer_opportunities',
    'weekly_activities','user_roles','admin_departments'
  ];
BEGIN
  FOREACH tbl IN ARRAY managed_tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'audit_' || tbl, tbl);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_admin_change()',
        'audit_' || tbl, tbl
      );
    END IF;
  END LOOP;
END $$;
