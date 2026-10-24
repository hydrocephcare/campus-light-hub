import { Youtube, Play, ArrowUpRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { staticSermons } from "@/data/staticSiteContent";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { SectionHeading } from "@/components/SectionHeading";

interface Sermon {
  id: string;
  title: string;
  speaker: string | null;
  sermon_date: string | null;
  youtube_id: string;
  youtube_url: string;
  description: string | null;
  category: string | null;
}

export const LatestSermons = () => {
  const [sermons, setSermons] = useState<Sermon[]>(staticSermons.slice(0, 3));
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { data: branding } = useSiteSetting("branding", { youtube_live_url: "https://www.youtube.com/live/2nKqPUZFPCE" });

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const { data, error } = await supabase
          .from("sermons")
          .select("*")
          .order("sermon_date", { ascending: false })
          .limit(3);
        if (error) throw error;
        setSermons(data && data.length > 0 ? data : staticSermons.slice(0, 3));
      } catch (error) {
        console.error("Error fetching sermons:", error);
        setSermons(staticSermons.slice(0, 3));
      }
    };
    fetchSermons();
  }, []);

  const handlePlay = useCallback((youtubeId: string) => {
    setActiveVideo(youtubeId);
  }, []);

  if (sermons.length === 0) return null;

  const [featured, ...rest] = sermons;

  const player = (sermon: Sermon, big: boolean) => (
    <div className="relative aspect-video overflow-hidden bg-muted">
      {activeVideo === sermon.youtube_id ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${sermon.youtube_id}?autoplay=1&rel=0&playsinline=1`}
          title={sermon.title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0"
        />
      ) : (
        <button
          onClick={() => handlePlay(sermon.youtube_id)}
          className="group/thumb absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play ${sermon.title}`}
        >
          <img
            src={`https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          <span
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-xl transition-transform group-hover/thumb:scale-110 ${big ? "h-20 w-20" : "h-12 w-12"}`}
          >
            <Play className={`ml-0.5 ${big ? "h-8 w-8" : "h-5 w-5"}`} />
          </span>
        </button>
      )}
    </div>
  );

  const dateOf = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Latest messages"
          title="Watch & be blessed"
          description="Catch up on recent messages and testimonies from our services."
          action={
            <a
              href={branding.youtube_live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-secondary hover:text-secondary"
            >
              <Youtube className="h-4 w-4" /> YouTube channel <ArrowUpRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <article className="overflow-hidden rounded-3xl border border-border bg-card lg:col-span-8">
            {player(featured, true)}
            <div className="p-6 md:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Latest</p>
              <h3 className="font-serif text-2xl font-semibold leading-snug md:text-3xl">{featured.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {[featured.speaker, dateOf(featured.sermon_date)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </article>

          <div className="flex flex-col gap-6 lg:col-span-4">
            {rest.map((sermon) => (
              <article key={sermon.id} className="flex-1 overflow-hidden rounded-3xl border border-border bg-card transition hover:border-primary/50">
                {player(sermon, false)}
                <div className="p-5">
                  <h3 className="line-clamp-2 font-sans text-base font-semibold tracking-normal">{sermon.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[sermon.speaker, dateOf(sermon.sermon_date)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
