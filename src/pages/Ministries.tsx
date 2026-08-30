import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Heart, Music, BookOpen, Globe, HandHeart, 
  Mic, Camera, Shield, Home, Baby, Sparkles,
  Clock, User, Loader2, ArrowRight, Church,
  Volume2, Hand, UserPlus, Palette
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { optimizedImageUrl } from "@/lib/imageUrl";

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  leader_name: string | null;
  meeting_schedule: string | null;
  joining_link: string;
  is_active: boolean | null;
}

const iconMap: Record<string, any> = {
  "music": Music, "music-2": Music, "book-open": BookOpen, "globe": Globe,
  "heart-handshake": HandHeart, "heart": Heart, "users": Users, "mic": Mic,
  "camera": Camera, "shield": Shield, "home": Home, "baby": Baby,
  "sparkles": Sparkles, "volume-2": Volume2, "hand": Hand,
  "user-plus": UserPlus, "palette": Palette, "pray": HandHeart,
};

const Ministries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Our Ministries — Serve With Purpose",
    description: "Discover your calling at MKU Christian Union. Join Choir, Multimedia, Ushering, Intercessory, Missions & more.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/ministries",
  });

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const { data } = await supabase.from("ministries").select("*").eq("is_active", true).order("name");
        setMinistries(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMinistries();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Heart;
    return iconMap[iconName] || Heart;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={optimizedImageUrl("https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=60", { width: 1600, quality: 70 })}
            alt="Ministries"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/90 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Church className="w-4 h-4" /> Serve With Purpose
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
            Our Ministries
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl">
            Discover your calling and make a difference. Everyone has a gift — find where yours can be used.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-6 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">{ministries.length}+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Active Ministries</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Volunteers</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">∞</div>
              <div className="text-xs md:text-sm text-muted-foreground">Lives Impacted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : ministries.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Ministries Yet</h3>
              <p className="text-muted-foreground">Check back soon for available ministries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 max-w-7xl mx-auto">
              {ministries.map((ministry) => {
                const IconComponent = getIcon(ministry.icon);
                return (
                  <Card
                    key={ministry.id}
                    className="group flex flex-col h-full p-5 bg-card border-border/70 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-base md:text-lg font-serif font-bold leading-snug text-card-foreground group-hover:text-primary transition-colors">
                        {ministry.name}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {ministry.description}
                    </p>

                    <div className="mt-auto space-y-2">
                      {(ministry.leader_name || ministry.meeting_schedule) && (
                        <div className="space-y-1 pt-3 border-t border-border/60">
                          {ministry.leader_name && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="truncate">Led by {ministry.leader_name}</span>
                            </div>
                          )}
                          {ministry.meeting_schedule && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="truncate">{ministry.meeting_schedule}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <a href={ministry.joining_link} target="_blank" rel="noopener noreferrer" className="block pt-1">
                        <Button variant="outline" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors" size="sm">
                          Join Ministry <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-br from-foreground to-foreground/90 text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Not Sure Where to Start?</h2>
          <p className="text-background/70 mb-6 max-w-xl mx-auto">
            We'd love to help you find the perfect ministry based on your gifts and interests.
          </p>
          <a href="https://wa.me/254704021286?text=Hi%2C%20I%20want%20to%20learn%20more%20about%20joining%20a%20ministry" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="font-semibold">Talk to a Leader</Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ministries;
