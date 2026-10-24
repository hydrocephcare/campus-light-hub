import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { COMMUNITY_IMAGES } from "@/lib/siteImages";
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
    <section className="relative isolate overflow-hidden py-20 md:py-32">
      <img src={optimizedImageUrl(COMMUNITY_IMAGES[2], { width: 1600, quality: 65 })} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      <div className="container mx-auto px-4 text-center">
        <p className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
          <span className="h-px w-8 bg-secondary" /> Verse of the Day <span className="h-px w-8 bg-secondary" />
        </p>
        <blockquote className="mx-auto max-w-4xl font-serif text-2xl italic leading-snug text-white md:text-4xl lg:text-5xl">“{todayContent.verse}”</blockquote>
        <cite className="mt-6 block text-base font-semibold not-italic tracking-wide text-secondary">{todayContent.reference}</cite>
        <p className="mx-auto mt-8 inline-flex max-w-xl items-start gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 backdrop-blur-sm">
          <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
          {todayContent.encouragement}
        </p>
      </div>
    </section>
  );
};
