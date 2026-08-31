import { useState } from "react";
import { Play } from "lucide-react";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { resolveMediaKind } from "@/lib/mediaKind";

export interface GalleryPhotoItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  media_kind?: string | null;
}

interface Props {
  item: GalleryPhotoItem;
  onOpen: () => void;
  priority?: boolean;
}

/**
 * Uniform 4:5 tile so portrait phone photos never render as narrow slivers.
 * Photos fill the tile (cover); announcement posters stay fully readable
 * (contain) on a neutral surface that follows light/dark mode.
 */
export const GalleryPhoto = ({ item, onOpen, priority = false }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = item.media_type === "video";
  const poster = resolveMediaKind(item) === "poster";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border/60 transition-all duration-300 hover:z-10 hover:ring-2 hover:ring-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={item.title || "Open media"}
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
            src={optimizedImageUrl(item.media_url, {
              width: 600,
              quality: 72,
              resize: poster ? "contain" : "cover",
            })}
            alt={item.title || "MKU Christian Union media"}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full transition-all duration-500 ease-out ${
              poster ? "object-contain p-1" : "object-cover"
            } ${loaded ? "opacity-100" : "opacity-0"} group-hover:scale-[1.02]`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/10" />
    </button>
  );
};
