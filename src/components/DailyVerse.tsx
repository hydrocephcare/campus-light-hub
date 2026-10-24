import { useEffect, useState } from "react";
import { BookOpen, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface DailyContent { verse: string; reference: string; encouragement: string; }

const defaultVerses: DailyContent[] = [
  { verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16", encouragement: "God's love for you is unfailing. Embrace it today." },
];

export const DailyVerse = () => {
  const { data: dailyContent } = useSiteSetting<DailyContent[]>("daily_verses", defaultVerses);
  const [todayContent, setTodayContent] = useState<DailyContent>(defaultVerses[0]);

  useEffect(() => {
    if (dailyContent.length === 0) return;
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setTodayContent(dailyContent[dayOfYear % dailyContent.length]);
  }, [dailyContent]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-6 md:p-8 shadow-lg border-primary/20 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-full"><BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
            <h2 className="text-lg md:text-xl font-serif font-bold">Verse of the Day</h2>
          </div>
          <blockquote className="mb-6">
            <p className="text-base md:text-xl font-serif leading-relaxed mb-3 italic">"{todayContent.verse}"</p>
            <footer className="text-right"><cite className="text-sm md:text-base font-semibold text-primary not-italic">— {todayContent.reference}</cite></footer>
          </blockquote>
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border-l-4 border-accent">
            <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm md:text-base italic text-foreground">{todayContent.encouragement}</p>
          </div>
        </Card>
      </div>
    </section>
  );
};
