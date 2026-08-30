import { Target, Heart, Users, BookOpen, Globe, Shield, Star, Award, School, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = { Target, Heart, Users, BookOpen, Globe, Shield, Star, Award, School, Sparkles };

export const VisionMission = () => {
  const { data: vision } = useSiteSetting("vision", { title: "Our Vision", description: "" });
  const { data: mission } = useSiteSetting("mission", { title: "Our Mission", description: "" });
  const { data: coreValues } = useSiteSetting("core_values", []);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-10 md:mb-12 lg:mb-16">
            <Card className="p-6 md:p-8 bg-muted border-border animate-slide-in-left">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Target className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3 md:mb-4 text-card-foreground">{vision.title}</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{vision.description}</p>
            </Card>
            <Card className="p-6 md:p-8 bg-muted border-border animate-slide-in-right">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Heart className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3 md:mb-4 text-card-foreground">{mission.title}</h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{mission.description}</p>
            </Card>
          </div>

          {coreValues.length > 0 && (
            <>
              <div className="text-center mb-6 md:mb-8 animate-fade-in-up">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-card-foreground mb-3 md:mb-4">Our Core Values</h3>
                <p className="text-muted-foreground text-base md:text-lg px-4">Guiding principles that shape everything we do</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {coreValues.map((value: any, index: number) => {
                  const ValIcon = iconMap[value.icon] || Star;
                  return (
                    <Card key={index} className="p-4 md:p-6 bg-background border-border text-center hover:bg-muted transition-all duration-300 group animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <ValIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      <h4 className="font-bold text-card-foreground mb-1 md:mb-2 text-sm md:text-base">{value.title}</h4>
                      <p className="text-xs text-muted-foreground">{value.description}</p>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
