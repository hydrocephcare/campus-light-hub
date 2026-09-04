import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { staticGalleryItems } from "@/data/staticSiteContent";
import { resolveMediaKind } from "@/lib/mediaKind";

interface GalleryItem {
  id: string;
  media_url: string;
  title: string;
  category?: string | null;
  media_kind?: string | null;
  created_at?: string;
}

const fallbackPosters = staticGalleryItems.slice(0, 8) as GalleryItem[];

/**
 * Notice board: announcement posters only. Photos live in the photo gallery.
 */
export const GalleryPreview = () => {
  const [posters, setPosters] = useState<GalleryItem[]>(fallbackPosters);

  useEffect(() => {
    const fetchPosters = async () => {
      const { data } = await supabase
        .from("media_gallery")
        .select("id, media_url, title, category, media_kind, created_at").neq("category", "Unverified Archive")
        .order("created_at", { ascending: false })
        .limit(40);
      const live = (data || []).filter((item) => resolveMediaKind(item) === "poster");
      if (live.length > 0) setPosters(live.slice(0, 8));
    };
    fetchPosters();
  }, []);

  const [lead, ...rest] = posters;
  if (!lead) return null;

  return (
    <section className="border-y border-border bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
              <Megaphone className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Notice board</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground md:text-4xl">Church Announcements</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Official program posters for services, fellowships, missions and special gatherings.
            </p>
          </div>
          <Link to="/gallery" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              Full notice board <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Featured poster + supporting grid */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Link
            to="/gallery"
            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[4/5]">
              <img
                src={optimizedImageUrl(lead.media_url, { width: 1000, quality: 76, resize: "contain" })}
                alt={lead.title}
                className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="border-t border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Latest notice</p>
              <p className="mt-1 line-clamp-2 font-serif text-lg font-semibold text-foreground">{lead.title}</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {rest.slice(0, 6).map((poster) => (
              <Link
                key={poster.id}
                to="/gallery"
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/5] w-full">
                  <img
                    src={optimizedImageUrl(poster.media_url, { width: 600, quality: 72, resize: "contain" })}
                    alt={poster.title}
                    className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="border-t border-border px-3 py-2">
                  <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">{poster.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/gallery">
            <Button className="w-full gap-2 sm:w-auto">
              View announcement archive <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/photos">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <Camera className="h-4 w-4" /> Browse church photos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
