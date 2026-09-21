import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Info, UserPlus, Calendar, CalendarDays, Church, Mail, 
  Video, FileText, Image, Vote, HandHelping, Menu, X, Youtube, 
  Phone, ChevronDown, ChevronRight, ExternalLink, Megaphone
, Globe2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import { COMMUNITY_LINK } from "@/lib/communityLink";
import { useSiteSetting } from "@/hooks/useSiteSettings";


const defaultBranding = {
  site_name: "MKU CU CHURCH",
  tagline: "Living the Knowledge of God",
  logo_url: "/pwa-icon-512.png",
  youtube_live_url: "https://www.youtube.com/live/2nKqPUZFPCE",
  whatsapp_community_link: "https://wa.me/254115475543",
};

const defaultContact = { whatsapp: "https://wa.me/254115475543", phone: "+254 115 475 543", email: "mkucuthika@gmail.com", location: "Mount Kenya University, Thika Campus", map_link: "" };

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: Info },
  { to: "/visitors", label: "I'm New", icon: UserPlus, highlight: true },
];

const navGroups = [
  {
    label: "Connect",
    items: [
      { to: "/schedule", label: "Schedule", icon: Calendar, desc: "Daily & weekly activities" },
      { to: "/events", label: "Events", icon: CalendarDays, desc: "Upcoming gatherings" },
      { to: "/ministries", label: "Ministries", icon: Church, desc: "Serve with your gifts" },
      { to: "/contact", label: "Contact", icon: Mail, desc: "Get in touch" },
    ],
  },
  {
    label: "Media",
    items: [
      { to: "/media", label: "Sermons", icon: Video, desc: "Watch sermons" },
      { to: "/blog", label: "Blog", icon: FileText, desc: "Faith stories" },
      { to: "/gallery", label: "Notice Board", icon: Megaphone, desc: "Announcement posters" },
      { to: "/photos", label: "Photos", icon: Image, desc: "Church photo gallery" },
      { to: "/missions", label: "Missions", icon: Globe2, desc: "Mission photos & videos" },
    ],
  },
  {
    label: "Engage",
    items: [
      { to: "/leadership", label: "Leadership", icon: Users, desc: "Executive Committee 2026–2027" },
      { to: "/elections", label: "Elections", icon: Vote, desc: "Vote for leaders" },
      { to: "/volunteer", label: "Volunteer", icon: HandHelping, desc: "Serve with us" },
    ],
  },
];

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Connect", "Media", "Engage"]);
  const location = useLocation();


  const { data: branding } = useSiteSetting("branding", defaultBranding);
  const { data: contact } = useSiteSetting("contact_info", defaultContact);

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <>
      <header className="bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm fixed left-0 right-0 top-0 z-50 border-b border-border">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
          <div className="flex h-[72px] items-center gap-4">
            <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-3">
              <img
                alt={branding.site_name}
                className="h-10 w-10 flex-shrink-0 object-contain transition-transform group-hover:scale-105 md:h-12 md:w-12"
                src={branding.logo_url}
              />
              <div className="min-w-0 max-w-[210px]">
                <div className="truncate whitespace-nowrap font-serif text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
                  {branding.site_name}
                </div>
                <div className="hidden truncate whitespace-nowrap text-[11px] italic leading-tight text-muted-foreground 2xl:block">
                  {branding.tagline}
                </div>
              </div>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    isActive(item.to) && "bg-primary text-primary-foreground hover:bg-primary",
                    item.highlight && !isActive(item.to) && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {navGroups.map((group) => (
                <div key={group.label} className="group/nav relative">
                  <button className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                    {group.label}<ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-[80] w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-border bg-card p-2 opacity-0 shadow-2xl transition-all group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.to} to={item.to} className={cn(
                          "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted",
                          isActive(item.to) && "bg-primary/10 text-primary"
                        )}>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className="block truncate text-xs text-muted-foreground">{item.desc}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
              <a href={branding.youtube_live_url} target="_blank" rel="noopener noreferrer" className="hidden 2xl:block">
                <Button variant="outline" size="sm" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                  <Youtube className="w-4 h-4" />
                  Watch Live
                </Button>
              </a>
              <NotificationBell />
              <ThemeToggle />
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-[70] h-full w-80 bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <img alt={branding.site_name} className="w-10 h-10 object-contain" src={branding.logo_url} />
            <div>
              <div className="font-serif font-bold text-foreground">{branding.site_name}</div>
              <div className="text-xs text-muted-foreground">{branding.tagline}</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive(item.to)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-muted",
                    item.highlight && !isActive(item.to) && "bg-accent/50 text-accent-foreground font-semibold"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {isActive(item.to) && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            {navGroups.map((group) => (
              <div key={group.label} className="pt-2">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expandedGroups.includes(group.label) && "rotate-180"
                    )}
                  />
                </button>
                {expandedGroups.includes(group.label) && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all",
                            isActive(item.to)
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-70 truncate">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground">
            <Phone className="w-4 h-4" />
            <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">{contact.phone}</a>
          </div>
          <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2" size="sm">
              Join {branding.site_name} Community
              <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </aside>

      <div className="h-[72px]" />
    </>
  );
};
