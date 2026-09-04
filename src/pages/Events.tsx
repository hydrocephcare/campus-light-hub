import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowRight, Share2, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { COMMUNITY_LINK } from "@/lib/communityLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useSEO } from "@/hooks/useSEO";
import { getEventImage } from "@/lib/eventImages";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { staticEvents } from "@/data/staticSiteContent";
import { Link } from "react-router-dom";
import { shareItem } from "@/lib/shareLinks";

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
  is_featured: boolean | null;
  slug?: string | null;
  theme?: string | null;
}

const eventPath = (event: Event) => `/events/${event.slug || event.id}`;

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id,title,description,event_date,start_time,end_time,location,category,image_url,registration_link,is_featured,slug,theme")
        .eq("is_published", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      const merged = new Map(staticEvents.map((event) => [event.id, event]));
      (data || []).forEach((event) => merged.set(event.id, event));
      setEvents([...merged.values()].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    } catch (error) {
      toast.error("Failed to load events");
      setEvents([...staticEvents].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    } finally {
      setLoading(false);
    }
  };


  useSEO({
    title: "Upcoming Events",
    description: "Join MKU Christian Union for life-changing gatherings, worship services, and fellowship.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    type: "website",
  });

  const upcomingEvents = events.filter((e) => e.event_date >= today);
  const pastEvents = events.filter((e) => e.event_date < today).reverse();
  const categories = ["all", ...new Set(upcomingEvents.map(e => e.category).filter(Boolean))];
  const filteredEvents = filter === "all" ? upcomingEvents : upcomingEvents.filter(e => e.category === filter);

  // Uses the link-preview endpoint so shared events carry their own poster.
  const shareEvent = (event: Event) => {
    shareItem({
      kind: "event",
      key: event.id,
      title: event.title,
      text: `${event.title} - ${new Date(event.event_date).toLocaleDateString()} at ${event.location}`,
      onCopied: () => toast.success("Event link copied!"),
    });
  };

  const featuredEvent = upcomingEvents.find(e => e.is_featured) || upcomingEvents[0];

  const hero = usePageHero("events", {
    title: "Events & Gatherings",
    subtitle: "Join us for life-changing gatherings, worship services, and fellowship opportunities",
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        {/* Hero with featured event */}
        <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={optimizedImageUrl(featuredEvent ? getEventImage(featuredEvent.category, featuredEvent.image_url) : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=60", { width: 1600, quality: 70 })}
              alt="Events"
              className="w-full h-full object-contain bg-[#17120f]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
            <Badge className="bg-secondary/90 text-secondary-foreground mb-4">
              <CalendarDays className="w-3 h-3 mr-1" /> {upcomingEvents.length} Upcoming
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {hero.subtitle}
            </p>
          </div>
        </section>

        {/* Category Filter */}
        {categories.length > 2 && (
          <section className="py-4 border-b border-border bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex overflow-x-auto gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={filter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className="flex-shrink-0 capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events Grid */}
        <AnimatedSection animation="fade-up">
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading events...</div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} id={event.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-card">
                      <div className="aspect-square overflow-hidden relative bg-[#f5f1ed] p-2">
                        <img
                          src={optimizedImageUrl(getEventImage(event.category, event.image_url), { width: 720, quality: 68 })}
                          alt={event.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        {event.category && (
                          <Badge className="absolute top-3 left-3 bg-foreground/80 text-background text-xs">
                            {event.category}
                          </Badge>
                        )}
                        {event.is_featured && (
                          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                        )}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{event.start_time}{event.end_time && ` – ${event.end_time}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1 rounded-full" size="sm">
                            <Link to={eventPath(event)}>
                              View details <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => shareEvent(event)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No upcoming events. Check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-serif font-bold text-muted-foreground mb-6">Past Events</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-7xl mx-auto">
                {pastEvents.slice(0, 8).map((event) => (
                  <Card key={event.id} className="overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                    <div className="aspect-square overflow-hidden bg-muted p-2">
                      <img src={optimizedImageUrl(getEventImage(event.category, event.image_url), { width: 700, quality: 82 })} alt={event.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-muted-foreground line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Never Miss an Event</h2>
            <p className="text-background/70 mb-6 max-w-xl mx-auto">
              Stay updated with all our upcoming events. Join our WhatsApp community.
            </p>
            <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary">Join WhatsApp Group</Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
