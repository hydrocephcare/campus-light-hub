import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminDepartment {
  department: string;
  is_approved: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: { full_name: string; email: string } | null;
  isAdmin: boolean;
  departments: AdminDepartment[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasDepartmentAccess: (department: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  departments: [],
  loading: true,
  signOut: async () => {},
  hasDepartmentAccess: () => false,
});

export const useAuth = () => useContext(AuthContext);

// Map admin menu IDs to department names that can access them
const FULL = ["super_admin", "chairperson", "vice_chairperson"];
const CONTENT = [...FULL, "secretary", "multimedia", "creative", "blog", "events"];

const DEPARTMENT_MAP: Record<string, string[]> = {
  settings: ["super_admin"],
  seo: ["super_admin", "chairperson"],
  users: ["super_admin", "chairperson"],
  hero: [...FULL, "multimedia", "creative"],
  notifications: [...FULL, "secretary", "multimedia"],
  schedule: [...FULL, "secretary", "events"],
  activities: [...FULL, "secretary", "events"],
  events: [...FULL, "secretary", "events", "missions", "creative"],
  gallery: [...CONTENT, "choir", "praise_worship", "ushering", "missions", "sound", "ladies_gents", "fellowships", "bible_study", "care", "intercessory"],
  announcements: [...FULL, "secretary", "events", "multimedia"],
  sermons: [...FULL, "multimedia", "sound", "praise_worship"],
  blog: [...CONTENT, "missions", "ladies_gents", "intercessory"],
  comments: [...FULL, "blog", "secretary"],
  prayers: [...FULL, "intercessory", "care"],
  leaders: [...FULL, "secretary"],
  ministries: [...FULL, "secretary", "creative"],
  fellowships: [...FULL, "fellowships", "bible_study", "secretary"],
  homefellowships: [...FULL, "fellowships", "bible_study"],
  volunteers: [...FULL, "care", "ushering"],
  faqs: [...FULL, "secretary"],
  elections: [...FULL, "secretary"],
  guests: [...FULL, "care", "ushering", "secretary"],
  choir: [...FULL, "choir", "praise_worship"],
  praise: [...FULL, "praise_worship", "choir"],
  sound: [...FULL, "sound", "multimedia"],
  ushering: [...FULL, "ushering", "care"],
};

export const AVAILABLE_DEPARTMENTS = [
  { value: "super_admin", label: "Super Admin (Developer — Full Access)" },
  { value: "chairperson", label: "Chairperson (Full Access)" },
  { value: "vice_chairperson", label: "Vice Chairperson" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "multimedia", label: "Multimedia" },
  { value: "events", label: "Events Coordinator" },
  { value: "blog", label: "Blog & Content" },
  { value: "intercessory", label: "Intercessory / Prayer" },
  { value: "fellowships", label: "Fellowships" },
  { value: "bible_study", label: "Bible Study" },
  { value: "care", label: "Care & Volunteers" },
  { value: "choir", label: "Choir" },
  { value: "praise_worship", label: "Praise & Worship" },
  { value: "sound", label: "Sound" },
  { value: "ushering", label: "Ushering" },
  { value: "missions", label: "Missions & Evangelism" },
  { value: "creative", label: "Creative" },
  { value: "ladies_gents", label: "Ladies & Gents" },
];

const CACHE_PREFIX = "mkucu_auth_access_";

type CachedAccess = {
  profile: { full_name: string; email: string } | null;
  isAdmin: boolean;
  departments: AdminDepartment[];
};

const readCache = (userId: string): CachedAccess | null => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as CachedAccess) : null;
  } catch {
    return null;
  }
};

const writeCache = (userId: string, value: CachedAccess) => {
  try {
    localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const clearCache = (userId?: string) => {
  try {
    if (userId) localStorage.removeItem(CACHE_PREFIX + userId);
    else
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let lastLoadedUserId: string | null = null;

    const applyUser = async (currentUser: User | null) => {
      if (!mounted) return;
      setUser(currentUser);

      if (!currentUser) {
        lastLoadedUserId = null;
        setProfile(null);
        setIsAdmin(false);
        setDepartments([]);
        setLoading(false);
        return;
      }

      // 1) Hydrate instantly from cache so a refresh never shows "waiting for approval".
      const cached = readCache(currentUser.id);
      if (cached) {
        setProfile(cached.profile);
        setIsAdmin(cached.isAdmin);
        setDepartments(cached.departments || []);
        setLoading(false);
      }

      // Avoid refetching for token refresh events on the same user.
      if (lastLoadedUserId === currentUser.id && cached) return;
      lastLoadedUserId = currentUser.id;

      // 2) Then revalidate against the backend.
      try {
        const [profileRes, roleRes, deptRes] = await Promise.all([
          supabase.from("profiles").select("full_name, email").eq("id", currentUser.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", currentUser.id),
          (supabase as any)
            .from("admin_departments")
            .select("department, is_approved")
            .eq("user_id", currentUser.id),
        ]);

        if (!mounted) return;

        // Network failure: keep whatever cache gave us instead of locking the user out.
        if (roleRes.error || deptRes.error) {
          setLoading(false);
          if (!cached) lastLoadedUserId = null; // allow a later retry
          return;
        }

        const nextProfile = (profileRes.data as any) ?? cached?.profile ?? null;
        const nextIsAdmin = (roleRes.data || []).some((r: any) => r.role === "admin");
        const nextDepartments = (deptRes.data || []) as AdminDepartment[];

        setProfile(nextProfile);
        setIsAdmin(nextIsAdmin);
        setDepartments(nextDepartments);
        writeCache(currentUser.id, {
          profile: nextProfile,
          isAdmin: nextIsAdmin,
          departments: nextDepartments,
        });
      } catch {
        if (!cached) lastLoadedUserId = null;
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser(session?.user ?? null);
    });

    // Initial restore (covers cases where INITIAL_SESSION fires before storage is ready)
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      if (currentUser || lastLoadedUserId === null) void applyUser(currentUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const id = user?.id;
    await supabase.auth.signOut();
    clearCache(id);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setDepartments([]);
  };

  const hasDepartmentAccess = (menuId: string): boolean => {
    if (isAdmin) return true; // Full admin has access to everything
    const allowedDepts = DEPARTMENT_MAP[menuId] || ["super_admin"];
    return departments.some(d => d.is_approved && allowedDepts.includes(d.department));
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, departments, loading, signOut, hasDepartmentAccess }}>
      {children}
    </AuthContext.Provider>
  );
};
