import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Leader {
  id: string;
  name: string;
  position: string;
  image_url: string | null;
}

export const LeadersPreview = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data, error } = await supabase
          .from('leaders')
          .select('id, name, position, image_url')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(4);
        if (error) throw error;
        setLeaders(data || []);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) return null;
  if (leaders.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
            <Users className="w-3.5 h-3.5" />
            Leadership
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground">Meet Our Leaders</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
          {leaders.map((leader) => (
            <Card key={leader.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                {leader.image_url ? (
                  <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Users className="w-10 h-10 md:w-14 md:h-14 text-primary/40" />
                  </div>
                )}
              </div>
              <CardContent className="p-3 md:p-4 text-center">
                <h3 className="font-bold text-sm md:text-lg text-foreground line-clamp-1">{leader.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{leader.position}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/about">
            <Button variant="outline" className="group border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
              View All Leaders
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
