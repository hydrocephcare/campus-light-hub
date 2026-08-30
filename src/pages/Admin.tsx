import { lazy, Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Calendar, CalendarDays, Megaphone, Video, FileText, Users, Church, 
  UsersRound, HandHelping, Menu, X, LayoutDashboard, MessageCircleHeart,
  MessageCircle, Image, ChevronRight, ClipboardList, HomeIcon, HelpCircle,
  Vote, BellRing, Presentation, Settings, Search, Shield, LogOut, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth, AVAILABLE_DEPARTMENTS } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const WeeklyActivitiesManager = lazy(() => import("@/components/admin/WeeklyActivitiesManager").then(m => ({ default: m.WeeklyActivitiesManager })));
const EventsManager = lazy(() => import("@/components/admin/EventsManager").then(m => ({ default: m.EventsManager })));
const AnnouncementsManager = lazy(() => import("@/components/admin/AnnouncementsManager").then(m => ({ default: m.AnnouncementsManager })));
const SermonsManager = lazy(() => import("@/components/admin/SermonsManager").then(m => ({ default: m.SermonsManager })));
const BlogPostsManager = lazy(() => import("@/components/admin/BlogPostsManager").then(m => ({ default: m.BlogPostsManager })));
const LeadersManager = lazy(() => import("@/components/admin/LeadersManager").then(m => ({ default: m.LeadersManager })));
const MinistriesManager = lazy(() => import("@/components/admin/MinistriesManager").then(m => ({ default: m.MinistriesManager })));
const FellowshipsManager = lazy(() => import("@/components/admin/FellowshipsManager").then(m => ({ default: m.FellowshipsManager })));
const VolunteersManager = lazy(() => import("@/components/admin/VolunteersManager").then(m => ({ default: m.VolunteersManager })));
const DailyScheduleManager = lazy(() => import("@/components/admin/DailyScheduleManager").then(m => ({ default: m.DailyScheduleManager })));
const HomeFellowshipsManager = lazy(() => import("@/components/admin/HomeFellowshipsManager").then(m => ({ default: m.HomeFellowshipsManager })));
const FAQsManager = lazy(() => import("@/components/admin/FAQsManager").then(m => ({ default: m.FAQsManager })));
const ElectionsManager = lazy(() => import("@/components/admin/ElectionsManager").then(m => ({ default: m.ElectionsManager })));
const HeroSlidesManager = lazy(() => import("@/components/admin/HeroSlidesManager").then(m => ({ default: m.HeroSlidesManager })));
const PrayerRequestsManager = lazy(() => import("@/components/admin/PrayerRequestsManager").then(m => ({ default: m.PrayerRequestsManager })));
const CommentsManager = lazy(() => import("@/components/admin/CommentsManager").then(m => ({ default: m.CommentsManager })));
const GalleryManager = lazy(() => import("@/components/admin/GalleryManager").then(m => ({ default: m.GalleryManager })));
const NotificationsManager = lazy(() => import("@/components/admin/NotificationsManager").then(m => ({ default: m.NotificationsManager })));
const SiteSettingsManager = lazy(() => import("@/components/admin/SiteSettingsManager").then(m => ({ default: m.SiteSettingsManager })));
const GuestsManager = lazy(() => import("@/components/admin/GuestsManager").then(m => ({ default: m.GuestsManager })));
const SEOManager = lazy(() => import("@/components/admin/SEOManager").then(m => ({ default: m.SEOManager })));
const UsersManager = lazy(() => import("@/components/admin/UsersManager").then(m => ({ default: m.UsersManager })));

const managerComponents = {
  settings: SiteSettingsManager,
  seo: SEOManager,
  users: UsersManager,
  hero: HeroSlidesManager,
  notifications: NotificationsManager,
  schedule: DailyScheduleManager,
  activities: WeeklyActivitiesManager,
  events: EventsManager,
  gallery: GalleryManager,
  announcements: AnnouncementsManager,
  sermons: SermonsManager,
  blog: BlogPostsManager,
  comments: CommentsManager,
  prayers: PrayerRequestsManager,
  leaders: LeadersManager,
  ministries: MinistriesManager,
  fellowships: FellowshipsManager,
  homefellowships: HomeFellowshipsManager,
  volunteers: VolunteersManager,
  faqs: FAQsManager,
  elections: ElectionsManager,
  guests: GuestsManager,
};

const ManagerFallback = () => (
  <div className="min-h-[220px] flex items-center justify-center rounded-lg bg-card border border-border">
    <div className="text-center">
      <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-primary" />
      <p className="text-sm text-muted-foreground">Opening section...</p>
    </div>
  </div>
);

const allMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Site Settings", icon: Settings },
  { id: "seo", label: "Google SEO", icon: Search },
  { id: "users", label: "Users & Roles", icon: Shield },
  { id: "hero", label: "Hero Slideshow", icon: Presentation },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "schedule", label: "Daily Schedule", icon: ClipboardList },
  { id: "activities", label: "Weekly Activities", icon: Calendar },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "sermons", label: "Sermons", icon: Video },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "comments", label: "Comments", icon: MessageCircle },
  { id: "prayers", label: "Prayers", icon: MessageCircleHeart },
  { id: "leaders", label: "Leaders", icon: Users },
  { id: "ministries", label: "Ministries", icon: Church },
  { id: "fellowships", label: "Campus Fellowships", icon: UsersRound },
  { id: "homefellowships", label: "Home Fellowships", icon: HomeIcon },
  { id: "volunteers", label: "Volunteers", icon: HandHelping },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "elections", label: "Elections", icon: Vote },
  { id: "guests", label: "Visitor Registrations", icon: UsersRound },
];

const AdminDashboard = () => {
  const { profile, departments } = useAuth();
  const approvedDepts = departments.filter(d => d.is_approved);
  const deptLabels = approvedDepts.map(d => AVAILABLE_DEPARTMENTS.find(ad => ad.value === d.department)?.label || d.department);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome, {profile?.full_name || "Admin"} 👋</CardTitle>
          <CardDescription>You're managing the MKU CU website. Here's your access overview.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Your Assigned Roles</h4>
            <div className="flex flex-wrap gap-2">
              {deptLabels.length > 0 ? deptLabels.map((label, i) => (
                <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{label}</Badge>
              )) : (
                <span className="text-sm text-muted-foreground">No roles assigned yet</span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to your sections. You can only see and edit content that's within your assigned departments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const WaitingForApproval = ({ onSignOut }: { onSignOut: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <Card className="max-w-md w-full text-center">
      <CardHeader>
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <CardTitle>Waiting for Approval</CardTitle>
        <CardDescription>
          Your account has been created successfully. A super admin needs to assign you a department role before you can access the admin panel. Please check back later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
          <Home className="w-4 h-4 mr-2" /> Back to Site
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </CardContent>
    </Card>
  </div>
);

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, departments, loading, signOut, hasDepartmentAccess } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === "undefined") return "dashboard";
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash) return fromHash;
    return localStorage.getItem("mkucu_admin_tab") || "dashboard";
  });

  // Remember the open section across refreshes / app restarts
  useEffect(() => {
    try {
      localStorage.setItem("mkucu_admin_tab", activeTab);
      if (window.location.hash.replace("#", "") !== activeTab) {
        window.history.replaceState(null, "", `#${activeTab}`);
      }
    } catch { /* ignore */ }
  }, [activeTab]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // If user has no approved departments and is not admin, show waiting screen
  const hasApprovedAccess = isAdmin || departments.some(d => d.is_approved);
  if (!hasApprovedAccess) {
    return <WaitingForApproval onSignOut={async () => { await signOut(); navigate("/login"); }} />;
  }

  // Dashboard is always accessible; filter rest by department access
  const menuItems = allMenuItems.filter(item => 
    item.id === "dashboard" || hasDepartmentAccess(item.id)
  );

  const renderContent = () => {
    if (activeTab === "dashboard") return <AdminDashboard />;

    if (!hasDepartmentAccess(activeTab)) {
      return (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">You don't have permission to access this section.</p>
        </div>
      );
    }

    const Manager = managerComponents[activeTab as keyof typeof managerComponents];
    if (!Manager) return <AdminDashboard />;

    return (
      <Suspense fallback={<ManagerFallback />}>
        <Manager />
      </Suspense>
    );
  };

  const currentMenuItem = allMenuItems.find(item => item.id === activeTab);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Get user's primary role label for display
  const primaryDept = departments.find(d => d.is_approved);
  const roleLabel = primaryDept 
    ? AVAILABLE_DEPARTMENTS.find(ad => ad.value === primaryDept.department)?.label || primaryDept.department
    : isAdmin ? "Admin" : "User";

  return (
    <div className="min-h-screen bg-muted/30 touch-manipulation">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-10 w-10 rounded-xl active:scale-95 transition-transform">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MKU CU Admin</span>
          </div>
          <Button onClick={() => navigate("/")} variant="ghost" size="icon" className="h-10 w-10 rounded-xl active:scale-95 transition-transform">
            <Home className="w-5 h-5" />
          </Button>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2 border-t border-border/50 pt-2 bg-muted/30">
          {currentMenuItem && (
            <>
              <currentMenuItem.icon className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">{currentMenuItem.label}</span>
            </>
          )}
        </div>
      </header>

      <div className="flex lg:pt-0 pt-[104px]">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          "w-[85vw] max-w-[320px] lg:w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center gap-3 p-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground truncate">{profile?.full_name || "Admin"}</h1>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </div>
          </div>

          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border safe-area-top pt-6">
            <div>
              <span className="font-bold text-lg block">{profile?.full_name || "Menu"}</span>
              <span className="text-xs text-muted-foreground">{roleLabel}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl active:scale-95 transition-transform" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-230px)] lg:h-[calc(100vh-190px)]">
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-4 lg:py-3 rounded-xl text-base lg:text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card safe-area-bottom space-y-2">
            <Button onClick={() => navigate("/")} variant="outline" className="w-full justify-center gap-2 h-10 rounded-xl text-sm font-medium">
              <Home className="h-4 w-4" />Back to Site
            </Button>
            <Button onClick={handleSignOut} variant="ghost" className="w-full justify-center gap-2 h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />Sign Out
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full">
          <div className="hidden lg:block sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                {currentMenuItem && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <currentMenuItem.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{currentMenuItem.label}</h2>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full space-y-2">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
