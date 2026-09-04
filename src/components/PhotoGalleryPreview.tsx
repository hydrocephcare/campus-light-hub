import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { resolveMediaKind } from "@/lib/mediaKind";

interface PhotoItem {
  id: string;
  media_url: string;
  title: string;
  category?: string | null;
  media_kind?: string | null;
}

/**
 * Photo gallery strip — ordinary church photos, kept separate from the
 * announcement notice board.
 */
export const PhotoGalleryPreview = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("media_gallery")
        .select("id, media_url, title, category, media_kind").neq("category", "Unverified Archive")
        .lt("sort_order", 1000)
        .order("created_at", { ascending: false })
        .limit(40);
      const live = (data || []).filter((item) => resolveMediaKind(item) === "photo");
      setPhotos(live.slice(0, 8));
    };
    fetchPhotos();
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-secondary">
              <Camera className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Photo gallery</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground md:text-4xl">Moments With Us</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Photos from services, fellowships, missions and campus life.
            </p>
          </div>
          <Link to="/photos">
            <Button variant="outline" className="gap-2">
              All photos <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              to="/photos"
              className="group aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border/60 transition-all hover:ring-2 hover:ring-primary/50"
            >
              <img
                src={optimizedImageUrl(photo.media_url, { width: 600, quality: 72 })}
                alt={photo.title || "MKU Christian Union photo"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
