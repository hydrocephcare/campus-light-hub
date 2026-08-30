import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Heart, Target, Award, BookOpen, Globe, Sparkles, Church, 
  Shield, ArrowRight, ChevronRight, MapPin, Clock, Calendar, Mail
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";

interface Leader {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

const About = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const { data: vision } = useSiteSetting("vision", { title: "Our Vision", description: "" });
  const { data: mission } = useSiteSetting("mission", { title: "Our Mission", description: "" });
  const { data: stats } = useSiteSetting("stats", []);

  useSEO({
    title: "About Us — MKU Christian Union",
    description: "Learn about Mount Kenya University Christian Union — our vision, mission, leadership, and faith community of 500+ students.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/about",
  });

  useEffect(() => { fetchLeaders(); }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero - Bold, cinematic */}
        <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=75"
              alt="Church community"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
           <div className="container mx-auto px-4 relative z-10 pb-12 md:pb-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 leading-[1.1]">
                MKU Christian<br />Union
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl mb-8">
                A vibrant community of students committed to living out the knowledge of God on campus and beyond.
              </p>
              {/* Stats inline */}
              <div className="flex flex-wrap gap-8 md:gap-12">
                {stats.slice(0, 3).map((stat: any, i: number) => (
                  <div key={i}>
                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}{stat.suffix}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section - Asymmetric layout */}
        <AnimatedSection animation="fade-up">
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
                <div className="lg:col-span-2">
                  <div className="sticky top-24">
                    <span className="text-primary font-semibold text-sm uppercase tracking-widest">Our Story</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-6 text-foreground">
                      Rooted in Faith,<br />Growing in Purpose
                    </h2>
                    <div className="h-1 w-16 bg-primary rounded-full" />
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-6 text-muted-foreground leading-relaxed text-lg">
                  <p>
                    Mount Kenya University Christian Union is a vibrant community of students committed to living 
                    out the knowledge of God on campus and beyond. Founded with a vision to transform campus life 
                    through authentic Christian fellowship, we have grown into a movement of over 500 active members.
                  </p>
                  <p>
                    Our journey began with a small group of passionate students who wanted to create a space where 
                    faith could flourish in the academic environment. Today, we continue that legacy through weekly 
                    gatherings, discipleship programs, evangelism initiatives, and community outreach.
                  </p>
                  <p>
                    We believe in nurturing not just academic excellence, but also spiritual growth that prepares 
                    students for lifelong kingdom impact in their respective fields and communities.
                  </p>
                  <Link to="/visitors">
                    <Button className="mt-4 gap-2">
                      I'm New Here <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Vision, Mission, Impact - Three pillars */}
        <AnimatedSection animation="scale">
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-primary font-semibold text-sm uppercase tracking-widest">Foundation</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold mt-3 text-foreground">What Drives Us</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary bg-card">
                    <Target className="w-10 h-10 text-primary mb-6" />
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{vision.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{vision.description}</p>
                  </Card>
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-t-secondary bg-card">
                    <Heart className="w-10 h-10 text-secondary mb-6" />
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{mission.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{mission.description}</p>
                  </Card>
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-t-accent bg-card">
                    <Award className="w-10 h-10 text-accent mb-6" />
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">Our Impact</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {stats.length > 0
                        ? `${stats[0]?.value}${stats[0]?.suffix} ${stats[0]?.label?.toLowerCase()}, touching thousands of lives through evangelism, missions, and community transformation.`
                        : "500+ active members, touching thousands of lives through evangelism, missions, and community transformation."}
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Leadership - Modern card grid */}
        <AnimatedSection animation="fade-up">
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-primary font-semibold text-sm uppercase tracking-widest">Leadership</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold mt-3 mb-4 text-foreground">Our Team</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Servant leaders committed to guiding MKU CU with wisdom and grace
                  </p>
                </div>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leaders.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {leaders.map((leader) => (
                      <div
                        key={leader.id}
                        className="group cursor-pointer"
                        onClick={() => setSelectedLeader(leader)}
                      >
                        <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted shadow-lg hover:shadow-2xl transition-all duration-300">
                          <img
                            src={leader.image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"}
                            alt={leader.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Always visible name strip at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                            <h3 className="text-white font-bold text-sm md:text-base">{leader.name}</h3>
                            <p className="text-white/80 text-xs md:text-sm">{leader.position}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Leadership team coming soon.</p>
                )}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* What We Believe */}
        <AnimatedSection animation="slide-left">
          <section className="py-20 md:py-28 bg-muted/20 border-y border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-primary font-semibold text-sm uppercase tracking-widest">Beliefs</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold mt-3 mb-4 text-foreground">What We Believe</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Our core beliefs anchor us in truth and guide our journey of faith
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { icon: BookOpen, title: "The Bible", desc: "We believe the Bible is God's inspired Word, our final authority for faith and practice, providing guidance for every aspect of life." },
                    { icon: Heart, title: "Salvation", desc: "Salvation is found only through faith in Jesus Christ and His finished work on the cross, offering grace and redemption to all." },
                    { icon: Users, title: "Community", desc: "We are called to live in authentic Christian community, bearing one another's burdens and growing together in love." },
                    { icon: Globe, title: "Mission", desc: "Every believer is called to share the Gospel and make disciples, starting from our campus to the ends of the earth." },
                  ].map((belief, i) => (
                    <Card key={i} className="p-8 hover:shadow-xl transition-all duration-300 bg-card border-l-4 border-l-primary">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <belief.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-card-foreground">{belief.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{belief.desc}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="w-10 h-10 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Join Our Community</h2>
              <p className="text-lg text-background/80 mb-8">
                Whether you're looking for fellowship, spiritual growth, or a place to serve, there's a place for you at MKU CU.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/visitors">
                  <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                    I'm New Here <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="gap-2 border-background/30 text-background hover:bg-background/10">
                    <Calendar className="w-5 h-5" /> View Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Leader Detail Modal */}
        {selectedLeader && (
          <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedLeader(null)}>
            <Card className="max-w-lg w-full p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-64 md:h-80">
                <img
                  src={selectedLeader.image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80"}
                  alt={selectedLeader.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedLeader(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif font-bold text-foreground">{selectedLeader.name}</h3>
                <p className="text-primary font-medium mb-3">{selectedLeader.position}</p>
                {selectedLeader.bio && <p className="text-muted-foreground leading-relaxed">{selectedLeader.bio}</p>}
                {selectedLeader.email && (
                  <a href={`mailto:${selectedLeader.email}`} className="inline-flex items-center gap-2 text-primary text-sm mt-4 hover:underline">
                    <Mail className="w-4 h-4" /> {selectedLeader.email}
                  </a>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default About;
