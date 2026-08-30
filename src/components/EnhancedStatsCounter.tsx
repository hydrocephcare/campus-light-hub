import { useEffect, useRef, useState } from "react";
import { Users, Award, School, Sparkles, Star, Heart, Globe, BookOpen, Trophy, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = { Users, Award, School, Sparkles, Star, Heart, Globe, BookOpen, Trophy, Target };
const colorMap: Record<string, { text: string; bg: string }> = {
  Users: { text: "text-navy", bg: "bg-navy/10" },
  Award: { text: "text-gold", bg: "bg-gold/10" },
  School: { text: "text-navy-light", bg: "bg-navy-light/10" },
  Sparkles: { text: "text-crimson", bg: "bg-crimson/10" },
  Star: { text: "text-primary", bg: "bg-primary/10" },
  Heart: { text: "text-crimson", bg: "bg-crimson/10" },
  Globe: { text: "text-navy", bg: "bg-navy/10" },
  BookOpen: { text: "text-gold", bg: "bg-gold/10" },
  Trophy: { text: "text-gold", bg: "bg-gold/10" },
  Target: { text: "text-primary", bg: "bg-primary/10" },
};

const defaultStats = [
  { icon: "Users", value: 500, suffix: "+", label: "Active Members" },
  { icon: "Award", value: 46, suffix: "", label: "Years Active" },
  { icon: "School", value: 20, suffix: "+", label: "Schools Reached" },
  { icon: "Sparkles", value: 1000, suffix: "+", label: "Salvations" },
];

export const EnhancedStatsCounter = () => {
  const { data: stats } = useSiteSetting("stats", defaultStats);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !hasAnimated) setHasAnimated(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {stats.map((stat: any, index: number) => (
              <StatCard key={index} icon={stat.icon} value={stat.value} suffix={stat.suffix} label={stat.label} shouldAnimate={hasAnimated} delay={index * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon, value, suffix, label, shouldAnimate, delay }: { icon: string; value: number; suffix: string; label: string; shouldAnimate: boolean; delay: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const Icon = iconMap[icon] || Star;
  const colors = colorMap[icon] || { text: "text-primary", bg: "bg-primary/10" };

  useEffect(() => {
    if (!shouldAnimate) return;
    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) { setDisplayValue(value); clearInterval(timer); }
        else setDisplayValue(Math.floor(current));
      }, duration / steps);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [shouldAnimate, value, delay]);

  return (
    <Card className="p-4 md:p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-card border-border/50">
      <div className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${colors.text}`} />
      </div>
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 md:mb-2 font-serif">{displayValue}{suffix}</div>
      <p className="text-xs md:text-sm lg:text-base text-muted-foreground font-medium">{label}</p>
    </Card>
  );
};
