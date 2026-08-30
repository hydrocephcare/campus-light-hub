import { Calendar, Clock, MapPin, User, BookOpen, MessageCircle, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const weekEvents = [
  {
    day: "SUNDAY, NOV 24",
    events: [
      {
        title: "Sunday Service",
        time: "7:00 AM - 12:45 PM",
        venue: "Auditorium (MKCC)",
        host: "Pst. Dennis Mutwiri",
        theme: "Living the Knowledge of God",
        verse: "John 17:2-3",
        icon: Calendar,
        color: "bg-primary",
      },
      {
        title: "Foundation Classes",
        time: "4:00 PM - 6:00 PM",
        venue: "MLT Hall B",
        description: "For new believers & strengthening faith foundation",
        icon: BookOpen,
        color: "bg-secondary",
      },
    ],
  },
  {
    day: "WEDNESDAY, NOV 27",
    events: [
      {
        title: "Midweek Service",
        time: "4:00 PM - 6:00 PM",
        venue: "CT Hall",
        icon: Calendar,
        color: "bg-primary",
      },
      {
        title: "Debate Session",
        time: "6:30 PM - 8:30 PM",
        venue: "CC Hall",
        description: "Should Christians use psychology & therapy or solely rely on prayer?",
        icon: MessageCircle,
        color: "bg-accent",
      },
      {
        title: "Midnight Prayers",
        time: "11:00 PM - 5:00 AM",
        venue: "CT Hall",
        theme: "Strengthened in the might of the Spirit",
        verse: "Ephesians 3:16",
        icon: Moon,
        color: "bg-navy",
      },
    ],
  },
  {
    day: "THURSDAY, NOV 28",
    events: [
      {
        title: "Discovery Bible Study",
        time: "4:00 PM - 6:00 PM",
        venue: "MLT Hall A",
        description: "Dive deeper into God's Word in interactive study sessions",
        icon: BookOpen,
        color: "bg-secondary",
      },
    ],
  },
];

export const ThisWeekSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Happening This Week
          </h2>
          <p className="text-xl text-muted-foreground">November 24 - 30, 2025</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {weekEvents.map((day, dayIndex) => (
            <div key={dayIndex} className="animate-fade-in-up" style={{ animationDelay: `${dayIndex * 100}ms` }}>
              <h3 className="text-2xl font-serif font-bold mb-4 text-primary">{day.day}</h3>
              <div className="space-y-4">
                {day.events.map((event, eventIndex) => (
                  <Card key={eventIndex} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: `var(--${event.color.replace('bg-', '')})` }}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${event.color} rounded-full flex items-center justify-center`}>
                        <event.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                          {event.host && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Host: {event.host}</span>
                            </div>
                          )}
                          {event.theme && (
                            <div className="mt-3">
                              <p className="font-semibold text-foreground">Theme: {event.theme}</p>
                              {event.verse && <p className="italic text-xs">({event.verse})</p>}
                            </div>
                          )}
                          {event.description && (
                            <p className="mt-2 text-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="ghost" size="sm">Add to Cal</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            View Full Week Schedule
          </Button>
        </div>
      </div>
    </section>
  );
};
