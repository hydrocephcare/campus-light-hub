import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { staticEvents } from "@/data/staticSiteContent";
import { semesterCalendar2026 } from "@/data/semesterCalendar2026";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  category: string | null;
  registration_link: string | null;
}

const eventKey = (event: Event) =>
  `${event.event_date}|${event.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`;

export const EventCalendarPopup = () => {
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id,title,description,event_date,start_time,end_time,location,category,registration_link")
          .eq("is_published", true)
          .order("event_date", { ascending: true });
        if (error) throw error;
        setDbEvents((data || []) as Event[]);
      } catch (error) {
        console.error("Error fetching homepage calendar events:", error);
      }
    };
    fetchEvents();
  }, []);

  const events = useMemo(() => {
    const merged = new Map<string, Event>();
    [...staticEvents, ...semesterCalendar2026].forEach((event) =>
      merged.set(eventKey(event as Event), event as Event),
    );
    dbEvents.forEach((event) => {
      const key = eventKey(event);
      const fallback = merged.get(key);
      merged.set(
        key,
        fallback
          ? {
              ...fallback,
              ...event,
              description: event.description || fallback.description,
              location: event.location || fallback.location,
              start_time: event.start_time || fallback.start_time,
            }
          : event,
      );
    });
    return [...merged.values()].sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [dbEvents]);

  const eventsForSelectedDate = events.filter(
    (event) => selectedDate && isSameDay(parseISO(event.event_date), selectedDate),
  );
  const eventDates = events.map((event) => parseISO(event.event_date));

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <CalendarDays className="w-5 h-5" />
            <span className="text-sm font-semibold">2026/2027 Event Calendar</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground">
            Tap a Date to See What&apos;s Happening
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Semester One · September–December 2026. Dates with activities are highlighted.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-4 md:p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="flex justify-center overflow-x-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{ hasEvent: eventDates }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: "hsl(var(--primary) / 0.16)",
                    fontWeight: "700",
                    borderRadius: "50%",
                  },
                }}
              />
            </div>

            <div className="space-y-4 min-h-[260px]">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Selected date</p>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                </h3>
              </div>

              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {eventsForSelectedDate.map((event) => (
                    <Card key={event.id} className="p-4 bg-muted/20">
                      <h4 className="font-semibold text-card-foreground mb-2">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      )}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{event.start_time}{event.end_time && ` – ${event.end_time}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scheduled event on this date.</p>
                  <p className="text-xs mt-1">Tap a highlighted date to view an activity.</p>
                </div>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link to="/schedule">
                  View Full Semester Programme <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
