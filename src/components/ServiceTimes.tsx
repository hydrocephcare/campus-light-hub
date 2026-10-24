import { useState, useEffect } from "react";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeading } from "@/components/SectionHeading";

interface ScheduleItem {
  id: string;
  day_of_week: string;
  activity_name: string;
  start_time: string;
  end_time: string | null;
  venue: string;
  activity_type: string;
}

// Days that typically have main fellowship or service (prioritize these)
const fellowshipDays = ["Sunday", "Wednesday", "Friday", "Saturday"];

const fallbackServices: ScheduleItem[] = [
  { id: "fallback-sunday", day_of_week: "Sunday", activity_name: "Sunday Service", start_time: "07:00", end_time: "12:45", venue: "Auditorium / CC Hall as announced", activity_type: "service" },
  { id: "fallback-monday", day_of_week: "Monday", activity_name: "Home Fellowship", start_time: "19:00", end_time: null, venue: "Various fellowship areas", activity_type: "fellowship" },
  { id: "fallback-thursday", day_of_week: "Thursday", activity_name: "Joint Fellowship", start_time: "19:00", end_time: null, venue: "CC Hall", activity_type: "fellowship" },
  { id: "fallback-friday", day_of_week: "Friday", activity_name: "Kesha / Special Programme", start_time: "21:00", end_time: null, venue: "CC Hall", activity_type: "fellowship" },
];

export const ServiceTimes = () => {
  const [services, setServices] = useState<ScheduleItem[]>(fallbackServices);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Fetch activities that are fellowship-type or main services
      const { data, error } = await supabase
        .from("daily_schedule")
        .select("*")
        .eq("is_active", true)
        .in("activity_type", ["fellowship", "service", "main", "regular"])
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Filter to get unique days with priority for fellowship days
      const dayMap = new Map<string, ScheduleItem>();

      (data || []).forEach((item: ScheduleItem) => {
        // Only keep one activity per day, prioritizing fellowship/service types
        if (!dayMap.has(item.day_of_week)) {
          dayMap.set(item.day_of_week, item);
        } else if (item.activity_type === "fellowship" || item.activity_type === "service") {
          dayMap.set(item.day_of_week, item);
        }
      });

      // Sort by fellowship days priority
      const sortedServices = Array.from(dayMap.values())
        .sort((a, b) => {
          const aIndex = fellowshipDays.indexOf(a.day_of_week);
          const bIndex = fellowshipDays.indexOf(b.day_of_week);
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        })
        .slice(0, 4); // Limit to 4 services

      setServices(sortedServices.length > 0 ? sortedServices : fallbackServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices(fallbackServices);
    }
  };

  const formatTime = (start: string, end?: string | null) => {
    const format12h = (t: string) => {
      const [h, m] = t.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hr12 = hour % 12 || 12;
      return `${hr12}:${m} ${ampm}`;
    };
    if (end) {
      return `${format12h(start)} - ${format12h(end)}`;
    }
    return format12h(start);
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Service times"
                title="Come as you are. Leave renewed."
                description="We gather to worship, learn and grow in faith. Everyone is welcome."
                className="mb-6 md:mb-6"
              />
              <a
                href="/visitors"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90"
              >
                Plan your first visit <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <ol className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card/60 lg:col-span-8">
            {services.map((service) => {
              const isHighlight = service.day_of_week === "Sunday";
              return (
                <li
                  key={service.id}
                  className={`grid grid-cols-[5.5rem_1fr] items-center gap-4 p-5 transition-colors md:grid-cols-[8rem_1fr_auto] md:p-7 ${isHighlight ? "bg-primary/20" : "hover:bg-muted/40"}`}
                >
                  <div>
                    <p className={`font-serif text-xl font-semibold md:text-3xl ${isHighlight ? "text-secondary" : "text-foreground"}`}>
                      {service.day_of_week.slice(0, 3)}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{service.day_of_week}</p>
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-semibold tracking-normal text-foreground md:text-xl">{service.activity_name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {service.venue}
                    </p>
                  </div>
                  <p className="col-span-2 flex items-center gap-2 text-sm font-semibold text-foreground md:col-span-1 md:justify-end">
                    <Clock className="h-4 w-4 text-secondary" />
                    {formatTime(service.start_time, service.end_time)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
