import { Megaphone, Calendar, Clock, MapPin, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { staticAnnouncements } from "@/data/staticSiteContent";

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  category: string | null;
  priority: string | null;
  contact_link: string | null;
}

const currentSundayService: Announcement = {
  id: "static-sunday-service-2026-09-06",
  title: "Sunday Service — 6 September 2026",
  description: "Join the MKU Christian Union family for Sunday Service with Pastor Muange Kiseku. Come ready to worship, fellowship and serve together.",
  announcement_date: "2026-09-06",
  start_time: "7:00 AM",
  end_time: null,
  location: "CC Hall",
  category: "Sunday Service",
  priority: "high",
  contact_link: null,
};

const mergeAnnouncements = (source: Announcement[]) => {
  const merged = new Map<string, Announcement>();
  merged.set(currentSundayService.id, currentSundayService);
  for (const item of source) merged.set(item.id, item);
  return [...merged.values()].slice(0, 3);
};

export const ChurchAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("announcement_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      setAnnouncements(mergeAnnouncements((data && data.length > 0 ? data : staticAnnouncements) as Announcement[]));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements(mergeAnnouncements(staticAnnouncements as Announcement[]));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Loading announcements...
        </div>
      </section>
    );
  }

  if (announcements.length === 0) return null;

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full mb-3">
            <Megaphone className="w-4 h-4" />
            <span className="text-xs font-semibold">Stay Updated</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Church Announcements
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`p-4 hover:shadow-md transition-all duration-300 border-l-4 ${
                announcement.priority === "high" ? "border-l-accent" : "border-l-primary"
              } bg-card`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  announcement.priority === "high" ? "bg-accent/10" : "bg-primary/10"
                }`}>
                  <Megaphone className={`w-5 h-5 ${
                    announcement.priority === "high" ? "text-accent" : "text-primary"
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-sm text-foreground">{announcement.title}</h3>
                    {announcement.priority === "high" && (
                      <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0">Priority</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {announcement.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(announcement.announcement_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {announcement.start_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{announcement.start_time}</span>
                      </div>
                    )}
                    {announcement.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{announcement.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={announcement.contact_link || `https://wa.me/254115475543?text=Info%20about%20${encodeURIComponent(announcement.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Info className="w-3 h-3 mr-1" />
                    Ask about this
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
