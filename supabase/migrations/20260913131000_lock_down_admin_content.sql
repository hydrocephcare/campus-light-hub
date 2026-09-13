-- Security hardening: public content remains readable, but only explicit admins
-- may create/update/delete church-managed content.
--
-- This migration intentionally removes any legacy permissive policies (including
-- old "full access" policies) from managed content tables.

DO $$
DECLARE
  tbl text;
  pol record;
  managed_tables text[] := ARRAY[
    'announcements','archive_videos','blog_posts','daily_schedule',
    'election_candidates','elections','events','faqs','fellowships',
    'hero_slides','home_fellowships','leaders','leadership_terms',
    'media_gallery','ministries','mission_media','missions','notifications',
    'sermons','site_settings','special_programs','volunteer_opportunities',
    'weekly_activities'
  ];
BEGIN
  FOREACH tbl IN ARRAY managed_tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

      FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = tbl
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
      END LOOP;

      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', tbl);
      EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', tbl);
      EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl);

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (true)',
        tbl || '_public_read', tbl
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))',
        tbl || '_admin_write', tbl
      );
    END IF;
  END LOOP;
END $$;

-- Role and department assignments are security-sensitive. Users may read their
-- own assignment; only an existing admin can change assignments.
DO $$
DECLARE pol record;
BEGIN
  IF to_regclass('public.user_roles') IS NOT NULL THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;
    REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
    GRANT SELECT ON public.user_roles TO authenticated;
    GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
    CREATE POLICY user_roles_self_or_admin_read ON public.user_roles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
    CREATE POLICY user_roles_admin_write ON public.user_roles
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF to_regclass('public.admin_departments') IS NOT NULL THEN
    ALTER TABLE public.admin_departments ENABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='admin_departments' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_departments', pol.policyname);
    END LOOP;
    REVOKE INSERT, UPDATE, DELETE ON public.admin_departments FROM anon;
    GRANT SELECT ON public.admin_departments TO authenticated;
    GRANT INSERT, UPDATE, DELETE ON public.admin_departments TO authenticated;
    CREATE POLICY admin_departments_self_or_admin_read ON public.admin_departments
      FOR SELECT TO authenticated
      USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
    CREATE POLICY admin_departments_admin_write ON public.admin_departments
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Profiles: a user may view/update their own basic profile; admins can inspect
-- profiles for account administration. Profile ownership never grants admin rights.
DO $$
DECLARE pol record;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
    GRANT SELECT, UPDATE ON public.profiles TO authenticated;
    CREATE POLICY profiles_self_or_admin_read ON public.profiles
      FOR SELECT TO authenticated
      USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
    CREATE POLICY profiles_self_update ON public.profiles
      FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;
