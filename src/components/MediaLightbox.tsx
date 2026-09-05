import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, MoveHorizontal } from "lucide-react";
import { galleryFullUrl, galleryThumbUrl } from "@/lib/imageUrl";

export interface LightboxItem {
  id: string;
  url: string;
  title?: string | null;
  subtitle?: string | null;
  meta?: string | null;
  isVideo?: boolean;
  /** Small rendition already cached by the grid — painted instantly under the full image. */
  thumbUrl?: string | null;
}

interface Props {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const HINT_KEY = "mkucu-swipe-hint-seen";
const SWIPE_DISTANCE = 40;
const SWIPE_VELOCITY = 0.25; // px per ms

/**
 * Full-screen media viewer with fast horizontal swipe navigation,
 * keyboard support and a one-time swipe hint. Centres media on desktop.
 */
export const MediaLightbox = ({ items, index, onIndexChange, onClose }: Props) => {
  const open = index !== null && !!items[index];
  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const pointer = useRef<{ id: number; x: number; y: number; t: number; axis: "" | "x" | "y" } | null>(null);

  const step = useCallback(
    (dir: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    if (!localStorage.getItem(HINT_KEY) && items.length > 1) {
      setShowHint(true);
      const t = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem(HINT_KEY, "1");
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, step]);

  // Preload neighbours so swipes feel instant.
  useEffect(() => {
    setFullReady(false);
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    [1, -1, 2, -2, 3, -3].forEach((d) => {
      const it = items[(index + d + items.length) % items.length];
      if (it && !it.isVideo) {
        const img = new Image();
        img.decoding = "async";
        img.src = galleryFullUrl(it.url);
      }
    });
  }, [index, items]);

  if (!open || index === null) return null;
  const item = items[index];

  const finishSwipe = (dx: number, dt: number) => {
    const velocity = Math.abs(dx) / Math.max(dt, 1);
    if (Math.abs(dx) > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) {
      step(dx < 0 ? 1 : -1);
    }
    setAnimating(true);
    setDrag(0);
    setTimeout(() => setAnimating(false), 160);
    if (showHint) {
      setShowHint(false);
      localStorage.setItem(HINT_KEY, "1");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 z-30 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/30 md:right-5 md:top-5"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/30 sm:block md:left-6"
            aria-label="Previous"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/30 sm:block md:right-6"
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* Media stage — vertically centred on every screen size */}
      <div
        className="flex flex-1 items-center justify-center overflow-hidden px-2 py-14 sm:px-16"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), axis: "" };
        }}
        onPointerMove={(e) => {
          const p = pointer.current;
          if (!p || p.id !== e.pointerId) return;
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          if (!p.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
            p.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          }
          if (p.axis === "x") setDrag(dx);
        }}
        onPointerUp={(e) => {
          const p = pointer.current;
          pointer.current = null;
          if (!p || p.axis !== "x") return;
          finishSwipe(e.clientX - p.x, performance.now() - p.t);
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setDrag(0);
        }}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3"
          style={{
            transform: `translate3d(${drag}px,0,0)`,
            transition: animating ? "transform 150ms ease-out" : "none",
          }}
        >
          {item.isVideo ? (
            <video src={item.url} controls className="h-full min-h-0 w-full object-contain sm:max-h-[82vh] sm:max-w-[calc(100vw-8rem)]" />
          ) : (
            <div className="relative min-h-0 w-full flex-1">
              {/* Cached thumbnail shows immediately, so the screen is never black. */}
              <img
                key={`${item.id}-thumb`}
                src={item.thumbUrl || galleryThumbUrl(item.url)}
                alt=""
                aria-hidden="true"
                draggable={false}
                className={`absolute inset-0 h-full w-full select-none object-contain blur-[6px] transition-opacity duration-150 ${
                  fullReady ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                key={item.id}
                src={galleryFullUrl(item.url)}
                alt={item.title || "MKU Christian Union media"}
                draggable={false}
                decoding="async"
                onLoad={() => setFullReady(true)}
                className={`absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-150 ${
                  fullReady ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          )}

          {/* Caption travels with the image so the pair stays centred */}
          <div className="px-4 text-center">
            {item.title && <h3 className="text-base font-semibold text-white md:text-lg">{item.title}</h3>}
            {item.subtitle && <p className="mx-auto mt-1 max-w-2xl text-sm text-white/70">{item.subtitle}</p>}
            <p className="mt-1.5 text-xs text-white/50">
              {item.meta ? `${item.meta} · ` : ""}
              {index + 1} / {items.length}
            </p>
          </div>
        </div>
      </div>


      {/* One-time swipe hint */}
      {showHint && items.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 -translate-y-1/2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-white shadow-lg">
            <ChevronLeft className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />
            <MoveHorizontal className="h-5 w-5" />
            <ChevronRight className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white/90">
            Swipe left or right to browse
          </span>
        </div>
      )}
    </div>
  );
};
