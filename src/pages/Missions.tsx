import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { useSEO } from "@/hooks/useSEO";
import { Mission, MISSION_FIELDS, missionDateLabel } from "@/lib/missions";
import { ArrowRight, Camera, Globe2, Loader2, MapPin, Video } from "lucide-react";

interface MissionWithCounts extends Mission {
  photoCount: number;
  videoCount: number;
}

const Missions = () => {
  const [missions, setMissions] = useState<MissionWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Missions — Taking the Gospel Beyond Campus",
    description:
      "Relive every MKU Christian Union mission: outreach photos, videos and stories from the field as students take the gospel beyond campus.",
    url: "https://mkucuu.lovable.app/missions",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: missionRows }, { data: mediaRows }] = await Promise.all([
          (supabase as any)
            .from("missions")
            .select(MISSION_FIELDS)
            .order("sort_order", { ascending: false })
            .order("start_date", { ascending: false }),
          (supabase as any).from("mission_media").select("mission_id,media_type,media_url,thumbnail_url"),
        ]);

        const media = (mediaRows || []) as { mission_id: string; media_type: string; media_url: string; thumbnail_url: string | null }[];
        const withCounts: MissionWithCounts[] = ((missionRows || []) as Mission[]).map((m) => {
          const own = media.filter((x) => x.mission_id === m.id);
          return {
            ...m,
            photoCount: own.filter((x) => x.media_type !== "video").length,
            videoCount: own.filter((x) => x.media_type === "video").length,
            cover_image:
              m.cover_image || own.find((x) => x.media_type !== "video")?.media_url || null,
          };
        });
        setMissions(withCounts);
      } catch (e) {
        console.error("Failed to load missions", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featured = missions.find((m) => m.is_featured) || missions[0];
  const rest = missions.filter((m) => m.id !== featured?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary/70 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary-foreground)/0.18),transparent_60%)]" />
        <div className="container relative mx-auto px-4">
          <Badge className="mb-4 border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
            <Globe2 className="mr-1.5 h-3.5 w-3.5" /> Mission Field
          </Badge>
          <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">
            Missions
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            Every year we step off campus and into communities — preaching, praying, serving and
            worshipping. These are the moments we captured.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:py-16">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : missions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <Globe2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Mission galleries are coming soon.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {featured && (
              <Link
                to={`/missions/${featured.slug}`}
                className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl md:grid-cols-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:h-full">
                  {featured.cover_image && (
                    <img
                      src={optimizedImageUrl(featured.cover_image, { width: 1200, quality: 74 })}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                      decoding="async"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Latest Mission
                  </span>
                </div>
                <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{missionDateLabel(featured)}</span>
                    {featured.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {featured.location}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                    {featured.title}
                  </h2>
                  {featured.subtitle && (
                    <p className="text-sm font-medium text-primary">{featured.subtitle}</p>
                  )}
                  {featured.description && (
                    <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {featured.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="gap-1">
                      <Camera className="h-3.5 w-3.5" /> {featured.photoCount} photos
                    </Badge>
                    {featured.videoCount > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Video className="h-3.5 w-3.5" /> {featured.videoCount} videos
                      </Badge>
                    )}
                  </div>
                  <Button className="mt-2 w-fit rounded-full">
                    Explore this mission <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">Past missions</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((m) => (
                    <Link
                      key={m.id}
                      to={`/missions/${m.slug}`}
                      className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {m.cover_image && (
                          <img
                            src={optimizedImageUrl(m.cover_image, { width: 700, quality: 70 })}
                            alt={m.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
                      <div className="space-y-2 p-5">
                        <p className="text-xs text-muted-foreground">{missionDateLabel(m)}</p>
                        <h3 className="font-serif text-lg font-semibold text-foreground">{m.title}</h3>
                        {m.location && (
                          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {m.location}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {m.photoCount} photos{m.videoCount ? ` · ${m.videoCount} videos` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Missions;
