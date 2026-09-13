-- Record admin changes so future unauthorized/accidental edits are traceable.
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  table_name text NOT NULL,
  row_id text,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

DROP POLICY IF EXISTS admin_audit_log_admin_read ON public.admin_audit_log;
CREATE POLICY admin_audit_log_admin_read
  ON public.admin_audit_log
  FOR SELECT TO authenticated
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
  IF TG_OP = 'DELETE' THEN
    rid := COALESCE(to_jsonb(OLD)->>'id', NULL);
    INSERT INTO public.admin_audit_log(actor_user_id, table_name, row_id, action, old_data, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, rid, TG_OP, to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    rid := COALESCE(to_jsonb(NEW)->>'id', to_jsonb(OLD)->>'id');
    INSERT INTO public.admin_audit_log(actor_user_id, table_name, row_id, action, old_data, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, rid, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    rid := COALESCE(to_jsonb(NEW)->>'id', NULL);
    INSERT INTO public.admin_audit_log(actor_user_id, table_name, row_id, action, old_data, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, rid, TG_OP, NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

DO $$
DECLARE
  tbl text;
  trigger_name text;
  audited_tables text[] := ARRAY[
    'events','media_gallery','missions','mission_media','announcements',
    'blog_posts','leaders','leadership_terms','hero_slides','daily_schedule',
    'weekly_activities','ministries','fellowships','home_fellowships',
    'sermons','site_settings','special_programs','volunteer_opportunities',
    'faqs','elections','election_candidates','archive_videos'
  ];
BEGIN
  FOREACH tbl IN ARRAY audited_tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      trigger_name := 'audit_' || tbl || '_changes';
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, tbl);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_admin_change()',
        trigger_name, tbl
      );
    END IF;
  END LOOP;
END $$;
