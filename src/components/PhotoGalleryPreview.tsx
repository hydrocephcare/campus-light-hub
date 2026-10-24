import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { resolveMediaKind } from "@/lib/mediaKind";
import { cloudinaryGalleryArchive } from "@/data/cloudinaryGalleryArchive";

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
  const fallbackPhotos = (cloudinaryGalleryArchive as unknown as PhotoItem[]).slice(0, 8);
  const [photos, setPhotos] = useState<PhotoItem[]>(fallbackPhotos);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("media_gallery")
        .select("id, media_url, title, category, media_kind").neq("category", "Unverified Archive")
        .lt("sort_order", 1000)
        .order("created_at", { ascending: false })
        .limit(40);
      const live = (data || []).filter((item) => resolveMediaKind(item) === "photo");
      setPhotos(live.length > 0 ? live.slice(0, 8) : fallbackPhotos);
    };
    fetchPhotos();
  }, []);

  if (photos.length === 0) return null;

  // Bento mosaic: a few tiles are larger so the grid has rhythm instead of 8 identical squares.
  const tileSpan = (i: number) =>
    i === 0 ? "col-span-2 row-span-2" : i === 5 ? "md:col-span-2" : i === 3 ? "row-span-2" : "";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Photo gallery"
          title="Moments with us"
          description="Photos from services, fellowships, missions and campus life."
          action={
            <Link
              to="/photos"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-secondary hover:text-secondary"
            >
              All photos <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid auto-rows-[9rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[11rem] md:grid-cols-4 md:gap-4">
          {photos.map((photo, i) => (
            <Link
              key={photo.id}
              to="/photos"
              className={`group relative overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 ${tileSpan(i)}`}
            >
              <img
                src={optimizedImageUrl(photo.media_url, { width: i === 0 ? 1000 : 600, quality: 72 })}
                alt={photo.title || "MKU Christian Union photo"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {photo.title && (
                <p className="absolute bottom-3 left-4 right-4 line-clamp-1 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.title}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
