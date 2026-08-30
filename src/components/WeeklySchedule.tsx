import { Calendar as CalendarIcon, Clock, MapPin, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyActivity {
  id: string;
  title: string;
  day_of_week: string;
  time: string;
  location: string;
  description: string | null;
  is_active: boolean | null;
}

const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dayColors: Record<string, { color: string; borderColor: string }> = {
  Sunday: { color: "blue", borderColor: "border-l-blue-500" },
  Monday: { color: "green", borderColor: "border-l-green-500" },
  Tuesday: { color: "purple", borderColor: "border-l-purple-500" },
  Wednesday: { color: "yellow", borderColor: "border-l-yellow-500" },
  Thursday: { color: "teal", borderColor: "border-l-teal-500" },
  Friday: { color: "orange", borderColor: "border-l-orange-500" },
  Saturday: { color: "pink", borderColor: "border-l-pink-500" },
};

const DayCard = ({ day, activities, dayIndex }: { day: string; activities: WeeklyActivity[]; dayIndex: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayColor = dayColors[day] || dayColors.Sunday;

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${dayIndex * 50}ms` }}>
      <Card className={`border-l-4 ${dayColor.borderColor} overflow-hidden hover:shadow-lg transition-shadow`}>
        {/* Compact Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 md:p-6 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors text-left"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-${dayColor.color}-500/10 flex items-center justify-center flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 md:w-6 md:h-6 text-${dayColor.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold mb-1">{day.toUpperCase()}</h3>
              
              {/* Compact Event Preview */}
              <div className="space-y-2">
                {activities.slice(0, isExpanded ? undefined : 2).map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="font-semibold line-clamp-1">{activity.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 pt-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 md:px-6 md:pb-6 border-t pt-4 space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="pb-6 last:pb-0 border-b last:border-b-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-bold">{activity.title}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{activity.location}</span>
                  </div>
                </div>

                {activity.description && (
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">{activity.description}</p>
                )}

                <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                  <a href="https://wa.me/254115475543?text=I%20want%20more%20details%20about%20this%20event" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs md:text-sm">
                      View Details
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export const WeeklySchedule = () => {
  const [activities, setActivities] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("weekly_activities")
        .select("*")
        .eq("is_active", true)
        .order("day_of_week");

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching weekly activities:", error);
      toast.error("Failed to load weekly activities");
    } finally {
      setLoading(false);
    }
  };

  // Group activities by day
  const activitiesByDay = activities.reduce((acc, activity) => {
    const day = activity.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(activity);
    return acc;
  }, {} as Record<string, WeeklyActivity[]>);

  // Sort days according to week order
  const sortedDays = dayOrder.filter(day => activitiesByDay[day] && activitiesByDay[day].length > 0);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading schedule...</div>
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm md:text-base font-semibold">This Week</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Weekly Schedule
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for worship, fellowship, and spiritual growth throughout the week
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
          {sortedDays.map((day, index) => (
            <DayCard
              key={day}
              day={day}
              activities={activitiesByDay[day]}
              dayIndex={index}
            />
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            All times are East Africa Time (EAT). Join us physically or online!
          </p>
          <a href="https://wa.me/254115475543?text=I%20want%20to%20know%20more%20about%20weekly%20activities" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get More Information
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
