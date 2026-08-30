import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, Loader2, Video, TrendingUp, Clock, Music, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

interface Sermon {
  id: string;
  title: string;
  speaker: string | null;
  sermon_date: string | null;
  youtube_url: string;
  youtube_id: string;
  description: string | null;
  category: string | null;
  is_featured: boolean | null;
}

const Media = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useSEO({
    title: "Sermons & Teachings — Media",
    description: "Watch sermons, worship sessions, and teachings from MKU Christian Union on YouTube.",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/media",
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false });
      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error("Error fetching sermons:", error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = ["All", ...new Set(sermons.map(s => s.category || "Other"))];
  const filtered = activeFilter === "All" ? sermons : sermons.filter(s => (s.category || "Other") === activeFilter);
  const featured = sermons.find(s => s.is_featured) || sermons[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero with Featured Video */}
        <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            {featured ? (
              <img
                src={`https://img.youtube.com/vi/${featured.youtube_id}/maxresdefault.jpg`}
                alt={featured.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${featured.youtube_id}/hqdefault.jpg`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-foreground to-foreground/80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/40" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Youtube className="w-4 h-4" /> MKU CU Media
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              Sermons & Teachings
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mb-6">
              Watch sermons, worship sessions, and teachings from MKU Christian Union
            </p>
            <div className="flex flex-wrap gap-3">
              {featured && (
                <Button
                  onClick={() => setPlayingId(featured.id)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Watch Latest
                </Button>
              )}
              <a href="https://youtube.com/@mkucuthikatv" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/50 text-white hover:bg-white/20 hover:text-white gap-2">
                  <Youtube className="w-5 h-5" />
                  Subscribe
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-4 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeFilter === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Playing Modal */}
        {playingId && (() => {
          const sermon = sermons.find(s => s.id === playingId);
          if (!sermon) return null;
          return (
            <section className="py-8 bg-foreground">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${sermon.youtube_id}?autoplay=1`}
                      title={sermon.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-background">{sermon.title}</h2>
                      {sermon.speaker && <p className="text-sm text-background/70 mt-1">{sermon.speaker}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayingId(null)}
                      className="text-background/70 hover:text-background hover:bg-background/10"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Videos Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading sermons...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No Videos Found</h2>
                <p className="text-muted-foreground">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
                {filtered.map((sermon) => (
                  <Card
                    key={sermon.id}
                    className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => setPlayingId(sermon.id)}
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={`https://img.youtube.com/vi/${sermon.youtube_id}/mqdefault.jpg`}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg">
                          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      {sermon.category && (
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                          {sermon.category}
                        </span>
                      )}
                      {sermon.sermon_date && (
                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm md:text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                        {sermon.title}
                      </h3>
                      {sermon.speaker && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {sermon.speaker}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Never Miss a Sermon</h2>
            <p className="text-background/70 mb-6 max-w-xl mx-auto">
              Subscribe to our YouTube channel and get notified whenever we go live or upload new content.
            </p>
            <a href="https://youtube.com/@mkucuthikatv" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Youtube className="w-5 h-5" />
                Subscribe on YouTube
              </Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Media;
