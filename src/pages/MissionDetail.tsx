import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { useSEO } from "@/hooks/useSEO";
import { MediaLightbox } from "@/components/MediaLightbox";
import { galleryThumbUrl } from "@/lib/imageUrl";
import {
  Mission,
  MissionMedia,
  MISSION_FIELDS,
  missionDateLabel,
  videoEmbedUrl,
  isDirectVideoFile,
} from "@/lib/missions";
import {
  ArrowLeft,
  Camera,
  Loader2,
  MapPin,
  Play,
  Share2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "photos" | "videos";

const MissionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [media, setMedia] = useState<MissionMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("photos");
  const [visible, setVisible] = useState(40);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = useMemo(() => media.filter((m) => m.media_type !== "video"), [media]);
  const videos = useMemo(() => media.filter((m) => m.media_type === "video"), [media]);

  useSEO({
    title: mission ? `${mission.title} — Mission Gallery` : "Mission",
    description:
      mission?.description?.slice(0, 155) ||
      "Photos, videos and stories from an MKU Christian Union mission.",
    image: mission?.cover_image || photos[0]?.media_url || undefined,
    url: `https://mkucuu.lovable.app/missions/${slug}`,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: m } = await (supabase as any)
          .from("missions")
          .select(MISSION_FIELDS)
          .eq("slug", slug)
          .maybeSingle();
        if (!m) {
          setMission(null);
          return;
        }
        setMission(m as Mission);
        const { data: mm } = await (supabase as any)
          .from("mission_media")
          .select("id,mission_id,media_url,media_type,thumbnail_url,caption,sort_order")
          .eq("mission_id", m.id)
          .order("sort_order", { ascending: true });
        setMedia((mm || []) as MissionMedia[]);
      } catch (e) {
        console.error("Failed to load mission", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const share = async () => {
    const url = `${window.location.origin}/missions/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title: mission?.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="mb-3 font-serif text-2xl font-bold text-foreground">Mission not found</h1>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/missions">Back to missions</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const activeItems = tab === "photos" ? photos : videos;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[440px] overflow-hidden pt-28 pb-14 md:min-h-[540px] md:pt-36">
        <div className="absolute inset-0">
          {mission.cover_image && (
            <img
              src={optimizedImageUrl(mission.cover_image, { width: 1600, quality: 72 })}
              alt={mission.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>
        <div className="container relative mx-auto px-4">
          <Link
            to="/missions"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> All missions
          </Link>
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="capitalize">{mission.status}</Badge>
              <Badge variant="secondary">{missionDateLabel(mission)}</Badge>
              {mission.location && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {mission.location}
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {mission.title}
            </h1>
            {mission.subtitle && (
              <p className="mt-3 text-lg font-medium text-primary">{mission.subtitle}</p>
            )}
            {mission.description && (
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {mission.description}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={share} variant="outline" className="rounded-full">
                <Share2 className="mr-1.5 h-4 w-4" /> Share mission
              </Button>
              {mission.youtube_playlist_url && (
                <Button asChild className="rounded-full">
                  <a href={mission.youtube_playlist_url} target="_blank" rel="noreferrer">
                    <Play className="mr-1.5 h-4 w-4" /> Watch on YouTube
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {mission.highlights && mission.highlights.length > 0 && (
        <section className="border-y border-border bg-card/60">
          <div className="container mx-auto grid gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {mission.highlights.map((h, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">{h}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Media */}
      <main className="container mx-auto px-4 py-12">
        <div className="sticky top-16 z-20 -mx-4 mb-8 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setTab("photos");
                setVisible(40);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === "photos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <Camera className="h-4 w-4" /> Photos ({photos.length})
            </button>
            <button
              onClick={() => {
                setTab("videos");
                setVisible(40);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === "videos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <Video className="h-4 w-4" /> Videos ({videos.length})
            </button>
          </div>
        </div>

        {tab === "photos" ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {photos.slice(0, visible).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={galleryThumbUrl(p.thumbnail_url || p.media_url)}
                    alt={p.caption || mission.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                </button>
              ))}
            </div>
            {visible < photos.length && (
              <div className="mt-8 text-center">
                <Button variant="outline" className="rounded-full" onClick={() => setVisible((v) => v + 40)}>
                  Load more photos ({photos.length - visible} left)
                </Button>
              </div>
            )}
          </>
        ) : videos.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No videos for this mission yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-video w-full bg-black">
                  {isDirectVideoFile(v.media_url) ? (
                    <video
                      src={v.media_url}
                      poster={v.thumbnail_url || undefined}
                      controls
                      preload="none"
                      className="h-full w-full"
                    />
                  ) : (
                    <iframe
                      src={videoEmbedUrl(v.media_url)}
                      title={v.caption || "Mission video"}
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full border-0"
                    />
                  )}
                </div>
                {v.caption && <p className="p-4 text-sm text-muted-foreground">{v.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      <MediaLightbox
        items={photos.map((p) => ({ id: p.id, url: p.media_url, thumbUrl: galleryThumbUrl(p.thumbnail_url || p.media_url), title: p.caption || mission.title }))}
        index={lightbox}
        onIndexChange={setLightbox}
        onClose={closeLightbox}
      />

      <Footer />
    </div>
  );
};

export default MissionDetail;
