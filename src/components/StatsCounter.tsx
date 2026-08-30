import { useEffect, useState, useRef } from "react";
import { Users, Calendar, School, Heart } from "lucide-react";

const stats = [
  { icon: Users, value: 500, label: "Active Members", suffix: "+" },
  { icon: Calendar, value: 46, label: "Years Active", suffix: "" },
  { icon: School, value: 20, label: "Schools Reached", suffix: "+" },
  { icon: Heart, value: 1000, label: "Salvations", suffix: "+" },
];

export const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-navy text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} isVisible={isVisible} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ icon: Icon, value, label, suffix, isVisible, delay }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      className="text-center animate-scale-in"
      style={{ animationDelay: `${delay}ms`, opacity: isVisible ? 1 : 0 }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gold rounded-full">
        <Icon className="w-8 h-8 text-navy" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm md:text-base text-white/80">{label}</div>
    </div>
  );
};
