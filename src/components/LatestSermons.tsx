import { Youtube, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSetting } from "@/hooks/useSiteSettings";

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
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
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
        setSermons(data || []);
      } catch (error) {
        console.error("Error fetching sermons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, []);

  const handlePlay = useCallback((youtubeId: string) => {
    setActiveVideo(youtubeId);
  }, []);

  if (loading) return null;
  if (sermons.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 md:px-4 rounded-full mb-3 md:mb-4">
            <Youtube className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-semibold">Latest from MKU CU</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 md:mb-4">
            Watch & Be Blessed
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Catch up on recent messages and testimonies from our services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden aspect-video bg-muted">
                {activeVideo === sermon.youtube_id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${sermon.youtube_id}?autoplay=1`}
                    title={sermon.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  />
                ) : (
                  <button
                    onClick={() => handlePlay(sermon.youtube_id)}
                    className="absolute inset-0 w-full h-full cursor-pointer group/thumb"
                    aria-label={`Play ${sermon.title}`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                        <Play className="w-6 h-6 md:w-7 md:h-7 text-white ml-1" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="p-4 md:p-5">
                <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2">{sermon.title}</h3>
                {sermon.speaker && <p className="text-xs md:text-sm text-muted-foreground mb-1">{sermon.speaker}</p>}
                {sermon.sermon_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12 space-y-3 md:space-y-4">
          <a href={branding.youtube_live_url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white text-sm md:text-base w-full md:w-auto">
              <Youtube className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Visit Our YouTube Channel
            </Button>
          </a>
          <p className="text-xs md:text-sm text-muted-foreground">Subscribe to never miss a message</p>
        </div>
      </div>
    </section>
  );
};
