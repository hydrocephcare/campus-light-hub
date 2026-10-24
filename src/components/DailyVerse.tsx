import { useEffect, useState } from "react";
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
    <section className="px-4 py-6 md:py-10">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground md:px-16 md:py-24">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Verse of the day</p>
          <blockquote className="relative mx-auto mt-6 max-w-3xl font-serif text-2xl leading-snug md:text-4xl">
            “{todayContent.verse}”
          </blockquote>
          <cite className="relative mt-6 block text-sm font-semibold not-italic tracking-wide text-secondary">{todayContent.reference}</cite>
          <p className="relative mx-auto mt-6 max-w-md text-sm text-primary-foreground/70">{todayContent.encouragement}</p>
        </div>
      </div>
    </section>
  );
};
