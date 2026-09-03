import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Calendar, Clock, MapPin, Users, BookOpen, Music, Heart, 
  MessageCircle, ExternalLink, Sun, ChevronRight
} from "lucide-react";
import { COMMUNITY_LINK } from "@/lib/communityLink";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { staticDailySchedule, staticFellowships } from "@/data/staticSiteContent";

interface DailyScheduleItem {
  id: string;
  day_of_week: string;
  theme: string | null;
  activity_name: string;
  activity_type: string;
  start_time: string;
  end_time: string | null;
  venue: string;
  description: string | null;
  facilitator: string | null;
  is_active: boolean;
  display_order: number;
}

interface HomeFellowship {
  id: string;
  name: string;
  area: string;
  meeting_day: string;
  meeting_time: string;
  venue: string | null;
  leader_name: string | null;
  contact_link: string | null;
  description: string | null;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dayThemes: Record<string, { theme: string; icon: React.ReactNode; image: string }> = {
  Sunday: { 
    theme: "Main Worship Service", 
    icon: <Sun className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=60"
  },
  Monday: { 
    theme: "Prayer & Fasting Focus", 
    icon: <Heart className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=60"
  },
  Tuesday: { 
    theme: "Leadership & Creative Arts", 
    icon: <Music className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=60"
  },
  Wednesday: { 
    theme: "Midweek Service", 
    icon: <BookOpen className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=60"
  },
  Thursday: { 
    theme: "Evangelism Day", 
    icon: <Users className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=60"
  },
  Friday: { 
    theme: "Service & Ministry", 
    icon: <Heart className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=800&q=60"
  },
  Saturday: { 
    theme: "Preparation & Events", 
    icon: <Calendar className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=60"
  },
};

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [dbSchedule, setDbSchedule] = useState<DailyScheduleItem[]>([]);
  const [dbFellowships, setDbFellowships] = useState<HomeFellowship[]>([]);
  const [dbFaqs, setDbFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Weekly Schedule & Home Fellowships",
    description: "View the full weekly schedule of MKU Christian Union — worship services, prayer meetings, Bible studies, and home fellowships.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/schedule",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, fellowshipsRes, faqsRes] = await Promise.all([
        supabase.from("daily_schedule").select("*").eq("is_active", true).order("display_order"),
        supabase.from("home_fellowships").select("*").eq("is_active", true),
        supabase.from("faqs").select("*").eq("is_active", true).order("display_order"),
      ]);
      setDbSchedule(scheduleRes.data && scheduleRes.data.length > 0 ? scheduleRes.data : staticDailySchedule);
      setDbFellowships(fellowshipsRes.data && fellowshipsRes.data.length > 0 ? fellowshipsRes.data : staticFellowships);
      if (faqsRes.data) setDbFaqs(faqsRes.data);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      setDbSchedule(staticDailySchedule);
      setDbFellowships(staticFellowships);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDaySchedule = () => {
    return dbSchedule
      .filter(item => item.day_of_week === selectedDay)
      .map(item => ({
        name: item.activity_name,
        time: item.end_time ? `${item.start_time} - ${item.end_time}` : item.start_time,
        venue: item.venue,
        description: item.description || undefined,
      }));
  };

  const currentTheme = dayThemes[selectedDay] || dayThemes.Sunday;

  const hero = usePageHero("schedule", {
    badge: "MKUCU 2025/2026 Regime",
    title: "Weekly Schedule",
    subtitle: "Join us for worship, fellowship, and spiritual growth throughout the week",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero with day image */}
        <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={currentTheme.image}
              alt={`${selectedDay} worship`}
              className="w-full h-full object-cover transition-opacity duration-500"
              key={selectedDay}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
            <Badge className="bg-secondary/90 text-secondary-foreground mb-4">{hero.badge}</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {hero.subtitle}
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">5:00 AM</div>
                <div className="text-xs md:text-sm text-muted-foreground">Morning Devotions</div>
              </div>
              <div className="p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">7:00 PM</div>
                <div className="text-xs md:text-sm text-muted-foreground">Bethel Prayers</div>
              </div>
              <div className="p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">7+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Home Fellowships</div>
              </div>
              <div className="p-3 md:p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary">15+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Ministries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">Daily Activities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select a day to view all scheduled activities
              </p>
            </div>

            {/* Day Selector - scrollable on mobile */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-8 md:justify-center scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {dayOrder.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  onClick={() => setSelectedDay(day)}
                  className="flex-shrink-0 min-w-[4rem]"
                  size="sm"
                >
                  <span className="md:hidden">{day.slice(0, 3)}</span>
                  <span className="hidden md:inline">{day}</span>
                </Button>
              ))}
            </div>

            {/* Selected Day Content - Image header */}
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <div className="relative h-32 md:h-44">
                <img
                  src={currentTheme.image}
                  alt={selectedDay}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="flex items-center gap-3 text-white">
                    {currentTheme.icon}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold">{selectedDay}</h3>
                      <p className="text-white/70 text-sm">{currentTheme.theme}</p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 md:p-6">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                ) : getCurrentDaySchedule().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No activities scheduled for {selectedDay}.</p>
                    <p className="text-sm mt-1">Check the admin panel to add activities.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentDaySchedule().map((activity, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs md:text-sm">{activity.time}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm md:text-base text-foreground">{activity.name}</h4>
                          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {activity.venue}
                          </div>
                          {activity.description && (
                            <p className="text-xs md:text-sm text-muted-foreground mt-1.5">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Home Fellowships */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Small Groups</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2 mb-4 text-foreground">Home Fellowships</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect with believers in your area for Bible study, prayer, and fellowship
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading fellowships...</div>
            ) : dbFellowships.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No home fellowships available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {dbFellowships.map((fellowship) => (
                  <Card key={fellowship.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-2 text-foreground">{fellowship.name}</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{fellowship.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{fellowship.meeting_day}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{fellowship.meeting_time}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                        <a href={fellowship.contact_link || "https://chat.whatsapp.com/I0O4FU8BFMo59CwKnnVB29"} target="_blank" rel="noopener noreferrer">
                          Join Fellowship
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Venues */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">Venue Guide</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quick reference for all our meeting locations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
              {[
                { name: "MLT Hall B", purpose: "Morning devotions, Bethel prayers" },
                { name: "PEFA Church", purpose: "Lunch hour services (primary)" },
                { name: "CT Grounds", purpose: "Large gatherings, departures" },
                { name: "CC Upper Room", purpose: "Debates, home fellowships" },
                { name: "Indoor Arena", purpose: "Large worship events, Keshas" },
                { name: "Basketball Court", purpose: "Sunday services (occasional)" },
                { name: "MLT Block NC5", purpose: "Choir practices" },
                { name: "CT 8.1", purpose: "Vocal J classes" },
                { name: "General Kago Primary", purpose: "Children's ministry, missions" },
              ].map((venue, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">{venue.name}</h4>
                      <p className="text-sm text-muted-foreground">{venue.purpose}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading FAQs...</div>
              ) : dbFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No FAQs available yet.</div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {dbFaqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`} className="bg-card rounded-lg border px-4">
                      <AccordionTrigger className="text-left font-medium text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA - dark, no blue */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Have Questions?</h2>
            <p className="mb-6 opacity-80">Connect with us for more information about our activities</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </a>
              </Button>
              <Button variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10" asChild>
                <a href="https://www.youtube.com/@mkucuofficial" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Watch on YouTube
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;
