import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getEventImage } from "@/lib/eventImages";
import { EventRegistrationDialog } from "@/components/EventRegistrationDialog";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { staticEvents } from "@/data/staticSiteContent";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  category: string | null;
  image_url: string | null;
  registration_link: string | null;
}

export const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .gte("event_date", new Date().toISOString().split('T')[0])
          .order("event_date", { ascending: true })
          .limit(3);
        if (error) throw error;
        const today = new Date().toISOString().split("T")[0];
        const merged = new Map(staticEvents.filter((event) => event.event_date >= today).map((event) => [event.id, event]));
        (data || []).forEach((event) => merged.set(event.id, event));
        setEvents([...merged.values()].sort((a, b) => a.event_date.localeCompare(b.event_date)).slice(0, 3));
      } catch (error) {
        console.error("Error fetching events:", error);
        const today = new Date().toISOString().split("T")[0];
        setEvents(staticEvents.filter((event) => event.event_date >= today).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full mb-3">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold">Upcoming Events</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Join Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border bg-card">
              <div className="relative aspect-square overflow-hidden bg-[#f5f1ed] p-2">
                <img
                  src={optimizedImageUrl(getEventImage(event.category, event.image_url), { width: 520, quality: 66 })}
                  alt={event.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
                {event.category && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">{event.category}</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">{event.title}</h3>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <Clock className="w-3 h-3 text-primary flex-shrink-0 ml-1" />
                    <span>{event.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 text-xs h-9 rounded-full">
                    <Link to={`/events/${event.id}`}>
                      View details <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label={`Share ${event.title}`}
                    onClick={() =>
                      shareItem({
                        kind: "event",
                        key: event.id,
                        title: event.title,
                        text: `${event.title} — ${new Date(event.event_date).toLocaleDateString()} at ${event.location}`,
                        onCopied: () => toast.success("Event link copied!"),
                      })
                    }
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a href="/events">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All Events <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </div>

      <EventRegistrationDialog open={dialogOpen} onOpenChange={setDialogOpen} event={selectedEvent} />
    </section>
  );
};
