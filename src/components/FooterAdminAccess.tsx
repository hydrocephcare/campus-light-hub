import { supabase } from "@/integrations/supabase/client";

/**
 * Admin entry point. There is deliberately no shared/front-end password.
 * Access is based only on the authenticated Supabase account and server-side role.
 */
export const FooterAdminAccess = () => {
  const navigate = useNavigate();

  const handleOpenAdmin = async () => {
    const { data } = await supabase.auth.getSession();
    navigate(data.session ? "/admin" : "/login");
  };

  return (
    <button
      type="button"
      onClick={handleOpenAdmin}
      className="inline-flex items-center gap-1.5 rounded-md border border-background/30 px-2.5 py-1 text-xs font-medium text-background/80 transition-colors hover:border-secondary hover:text-secondary"
    >
      <Lock className="h-3 w-3" /> Admin
    </button>
  );
};
