import { useState } from "react";
import { Play } from "lucide-react";
import { optimizedImageUrl } from "@/lib/imageUrl";

export interface GalleryPhotoItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
}

interface Props {
  item: GalleryPhotoItem;
  onOpen: () => void;
  priority?: boolean;
}

/**
 * Google-Photos style tile: uniform square crop so grids stay even and never
 * look narrow, regardless of how many portrait phone photos are uploaded.
 * Captions live in the lightbox only — tiles stay clean and label-free.
 */
export const GalleryPhoto = ({ item, onOpen, priority = false }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = item.media_type === "video";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square w-full overflow-hidden rounded-md bg-white p-1 ring-1 ring-border/60 transition-all duration-300 hover:z-10 hover:ring-2 hover:ring-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={item.title || "Open photo"}
    >
      {isVideo ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 translate-x-[1px]" />
          </span>
        </div>
      ) : (
        <>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <img
            src={optimizedImageUrl(item.media_url, { width: 600, quality: 72 })}
            alt={item.title || "Church gallery photo"}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-contain transition-all duration-500 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
    </button>
  );
};
