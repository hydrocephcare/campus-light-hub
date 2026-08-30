import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { Link } from "react-router-dom";

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

export const EventCalendarPopup = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Only fetch when dialog opens
  useEffect(() => {
    if (isOpen && !hasFetched) {
      const fetchEvents = async () => {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("event_date", { ascending: true });
          if (error) throw error;
          setEvents(data || []);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };
      fetchEvents();
      setHasFetched(true);
    }
  }, [isOpen, hasFetched]);

  const eventsForSelectedDate = events.filter((event) =>
    selectedDate && isSameDay(parseISO(event.event_date), selectedDate)
  );

  const eventDates = events.map((event) => parseISO(event.event_date));

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <CalendarDays className="w-5 h-5" />
            <span className="text-sm font-semibold">Event Calendar</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Find Events by Date
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Click on any date to see events scheduled for that day
          </p>
        </div>

        <div className="flex justify-center">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <CalendarDays className="w-5 h-5" />
                Open Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Event Calendar
                </DialogTitle>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{ hasEvent: eventDates }}
                    modifiersStyles={{
                      hasEvent: {
                        backgroundColor: "hsl(var(--primary) / 0.2)",
                        fontWeight: "bold",
                        borderRadius: "50%",
                      },
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                  </h4>

                  {eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {eventsForSelectedDate.map((event) => (
                        <Card key={event.id} className="p-4">
                          <h5 className="font-medium text-card-foreground mb-2">{event.title}</h5>
                          {event.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{event.start_time}{event.end_time && ` - ${event.end_time}`}</span></div>
                            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{event.location}</span></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events on this date</p>
                    </div>
                  )}

                  <Link to="/events" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full mt-4">
                      View All Events <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};
