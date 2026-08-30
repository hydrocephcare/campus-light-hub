import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowRight, Sun, BookOpen, Users, Heart, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DailyScheduleItem {
  id: string;
  day_of_week: string;
  activity_name: string;
  start_time: string;
  end_time: string | null;
  venue: string;
}

const dayIcons: Record<string, React.ReactNode> = {
  Sunday: <Sun className="w-5 h-5" />,
  Monday: <Heart className="w-5 h-5" />,
  Tuesday: <Music className="w-5 h-5" />,
  Wednesday: <BookOpen className="w-5 h-5" />,
  Thursday: <Users className="w-5 h-5" />,
  Friday: <Heart className="w-5 h-5" />,
  Saturday: <Calendar className="w-5 h-5" />,
};

export const SchedulePreview = () => {
  const [schedule, setSchedule] = useState<DailyScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_schedule")
        .select("*")
        .eq("day_of_week", today)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const displaySchedule = schedule.map(s => ({
    name: s.activity_name,
    time: s.end_time ? `${s.start_time} - ${s.end_time}` : s.start_time,
    venue: s.venue,
  }));

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-semibold">Today's Schedule</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            {today}'s Activities
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening today at MKUCU
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center gap-3 text-primary-foreground">
              {dayIcons[today] || <Calendar className="w-5 h-5" />}
              <div>
                <h3 className="font-bold text-lg">{today}</h3>
                <p className="text-sm opacity-90">Daily Activities</p>
              </div>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground">Loading schedule...</div>
              ) : displaySchedule.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No activities scheduled for today.</p>
                  <p className="text-sm">Check the full schedule for other days.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {displaySchedule.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{activity.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link to="/schedule">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Full Schedule
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
