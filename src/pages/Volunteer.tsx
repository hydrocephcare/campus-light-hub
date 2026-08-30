import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, CheckCircle, ArrowRight, HandHelping, Loader2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  time_commitment: string | null;
  contact_link: string;
  is_active: boolean | null;
}

const Volunteer = () => {
  useSEO({
    title: "Volunteer — Serve With Us",
    description: "Use your gifts and talents to serve God at MKU Christian Union. Browse current volunteer opportunities.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/volunteer",
  });

  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("volunteer_opportunities")
          .select("*")
          .eq("is_active", true);
        if (error) throw error;
        setOpportunities(data || []);
      } catch (error) {
        console.error("Error fetching volunteer opportunities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1920&q=60"
              alt="Volunteering"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
            <div className="inline-flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
              <HandHelping className="w-4 h-4" /> Serve With Us
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              Volunteer Opportunities
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl">
              Use your gifts and talents to serve God and build His kingdom on campus
            </p>
          </div>
        </section>

        {/* Why Volunteer */}
        <section className="py-12 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto text-center">
              {[
                { icon: Heart, title: "Make Impact", desc: "Touch lives and transform the campus" },
                { icon: CheckCircle, title: "Grow Spiritually", desc: "Deepen your faith through service" },
                { icon: Clock, title: "Flexible Time", desc: "We work with your schedule" },
              ].map((item) => (
                <div key={item.title}>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunities */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-10">Current Opportunities</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : opportunities.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                    <div className="p-5 md:p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                          <HandHelping className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                          {opp.title}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{opp.description}</p>

                      {opp.time_commitment && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 p-2.5 rounded-lg">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{opp.time_commitment}</span>
                        </div>
                      )}

                      {opp.requirements && (
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                          <span className="font-semibold text-card-foreground">Requirements:</span> {opp.requirements}
                        </p>
                      )}

                      <a href={opp.contact_link} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full gap-2" size="sm">
                          Apply Now <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Opportunities Right Now</h3>
                <p className="text-muted-foreground mb-6">Check back soon or reach out to volunteer directly</p>
                <a href="https://wa.me/254115475543?text=Hi%2C%20I%20want%20to%20volunteer%20at%20MKU%20CU" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">Contact Us to Volunteer</Button>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-background/70 mb-6 max-w-xl mx-auto">
              Join our volunteer team and be part of something bigger than yourself.
            </p>
            <a href="https://wa.me/254115475543?text=Hi%2C%20I%20want%20to%20volunteer%20at%20MKU%20CU" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Today <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Volunteer;
