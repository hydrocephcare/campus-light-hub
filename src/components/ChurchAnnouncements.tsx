import { Megaphone, Calendar, Clock, MapPin, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
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
                      <Badge className="bg-accent text-white text-xs px-1.5 py-0">Priority</Badge>
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
                    Learn More
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
