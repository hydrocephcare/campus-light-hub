import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export const ServiceTimes = () => {
  const [services, setServices] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        } else if (
          item.activity_type === "fellowship" ||
          item.activity_type === "service"
        ) {
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

      setServices(sortedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-card via-muted/20 to-card">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-card via-muted/20 to-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            Service Times
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Join Us For Worship
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We gather together to worship, learn, and grow in faith. Everyone is welcome!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const isHighlight = service.day_of_week === "Sunday";
            return (
              <Card
                key={service.id}
                className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  isHighlight
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                      isHighlight
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {service.day_of_week}
                  </div>

                  <h3
                    className={`font-serif font-bold text-xl mb-3 ${
                      isHighlight ? "text-white" : "text-foreground"
                    }`}
                  >
                    {service.activity_name}
                  </h3>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isHighlight ? "text-white/90" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {formatTime(service.start_time, service.end_time)}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isHighlight ? "text-white/90" : "text-muted-foreground"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      {service.venue}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
