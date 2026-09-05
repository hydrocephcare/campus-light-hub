import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MoveHorizontal,
  Loader2,
} from "lucide-react";
import {
  galleryFullUrl,
  galleryThumbUrl,
} from "@/lib/imageUrl";

export interface LightboxItem {
  id: string;
  url: string;
  title?: string | null;
  subtitle?: string | null;
  meta?: string | null;
  isVideo?: boolean;
  thumbUrl?: string | null;
}

interface Props {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;

  /**
   * New props used for category-aware navigation.
   */
  hasMore?: boolean;
  loadingMore?: boolean;
  total?: number;
  collectionName?: string;
}

const HINT_KEY = "mkucu-swipe-hint-seen";

const SWIPE_DISTANCE = 40;
const SWIPE_VELOCITY = 0.25;

export const MediaLightbox = ({
  items,
  index,
  onIndexChange,
  onClose,
  hasMore = false,
  loadingMore = false,
  total,
  collectionName,
}: Props) => {
  const open =
    index !== null && !!items[index];

  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] =
    useState(false);
  const [showHint, setShowHint] =
    useState(false);
  const [fullReady, setFullReady] =
    useState(false);

  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    t: number;
    axis: "" | "x" | "y";
  } | null>(null);

  const canGoPrevious =
    index !== null && index > 0;

  const canGoNext =
    index !== null && index < items.length - 1;

  /**
   * NO MORE MODULO NAVIGATION.
   *
   * The viewer stops at the first/last currently available
   * item in this collection.
   */
  const step = useCallback(
    (dir: number) => {
      if (
        index === null ||
        items.length === 0
      ) {
        return;
      }

      const nextIndex = index + dir;

      if (
        nextIndex < 0 ||
        nextIndex >= items.length
      ) {
        return;
      }

      onIndexChange(nextIndex);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;

    if (
      !localStorage.getItem(HINT_KEY) &&
      items.length > 1
    ) {
      setShowHint(true);

      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem(
          HINT_KEY,
          "1"
        );
      }, 3200);

      return () =>
        clearTimeout(timer);
    }
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "ArrowRight" &&
        canGoNext
      ) {
        step(1);
      }

      if (
        event.key === "ArrowLeft" &&
        canGoPrevious
      ) {
        step(-1);
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        onKey
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    open,
    onClose,
    step,
    canGoNext,
    canGoPrevious,
  ]);

  useEffect(() => {
    setFullReady(false);
  }, [index]);

  /**
   * Preload only real neighbours.
   *
   * No modulo here either.
   */
  useEffect(() => {
    if (index === null) return;

    [1, -1, 2, -2, 3, -3].forEach(
      (offset) => {
        const neighbourIndex =
          index + offset;

        if (
          neighbourIndex < 0 ||
          neighbourIndex >= items.length
        ) {
          return;
        }

        const neighbour =
          items[neighbourIndex];

        if (
          neighbour &&
          !neighbour.isVideo
        ) {
          const img = new Image();

          img.decoding = "async";

          img.src = galleryFullUrl(
            neighbour.url
          );
        }
      }
    );
  }, [index, items]);

  if (!open || index === null) {
    return null;
  }

  const item = items[index];

  const finishSwipe = (
    dx: number,
    dt: number
  ) => {
    const velocity =
      Math.abs(dx) / Math.max(dt, 1);

    const shouldMove =
      Math.abs(dx) > SWIPE_DISTANCE ||
      velocity > SWIPE_VELOCITY;

    if (shouldMove) {
      if (dx < 0 && canGoNext) {
        step(1);
      } else if (
        dx > 0 &&
        canGoPrevious
      ) {
        step(-1);
      }
    }

    setAnimating(true);
    setDrag(0);

    setTimeout(
      () => setAnimating(false),
      160
    );

    if (showHint) {
      setShowHint(false);
      localStorage.setItem(
        HINT_KEY,
        "1"
      );
    }
  };

  const displayTotal =
    total && total > items.length
      ? total
      : items.length;

  const atTrueEnd =
    !hasMore &&
    index === items.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 z-30 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/30 md:right-5 md:top-5"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {canGoPrevious && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(-1);
          }}
          className="absolute left-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/30 sm:block md:left-6"
          aria-label="Previous"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      {canGoNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(1);
          }}
          className="absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/30 sm:block md:right-6"
          aria-label="Next"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}

      <div
        className="flex flex-1 items-center justify-center overflow-hidden px-2 py-14 sm:px-16"
        onClick={(event) =>
          event.stopPropagation()
        }
        onPointerDown={(event) => {
          if (
            event.pointerType ===
              "mouse" &&
            event.button !== 0
          ) {
            return;
          }

          pointer.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            t: performance.now(),
            axis: "",
          };
        }}
        onPointerMove={(event) => {
          const current =
            pointer.current;

          if (
            !current ||
            current.id !==
              event.pointerId
          ) {
            return;
          }

          const dx =
            event.clientX - current.x;

          const dy =
            event.clientY - current.y;

          if (
            !current.axis &&
            (Math.abs(dx) > 6 ||
              Math.abs(dy) > 6)
          ) {
            current.axis =
              Math.abs(dx) >
              Math.abs(dy)
                ? "x"
                : "y";
          }

          if (
            current.axis === "x"
          ) {
            setDrag(dx);
          }
        }}
        onPointerUp={(event) => {
          const current =
            pointer.current;

          pointer.current = null;

          if (
            !current ||
            current.axis !== "x"
          ) {
            return;
          }

          finishSwipe(
            event.clientX - current.x,
            performance.now() -
              current.t
          );
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setDrag(0);
        }}
        style={{
          touchAction: "pan-y",
        }}
      >
        <div
          className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3"
          style={{
            transform: `translate3d(${drag}px,0,0)`,
            transition: animating
              ? "transform 150ms ease-out"
              : "none",
          }}
        >
          {item.isVideo ? (
            <video
              src={item.url}
              controls
              className="h-full min-h-0 w-full object-contain sm:max-h-[82vh] sm:max-w-[calc(100vw-8rem)]"
            />
          ) : (
            <div className="relative min-h-0 w-full flex-1">
              <img
                key={`${item.id}-thumb`}
                src={
                  item.thumbUrl ||
                  galleryThumbUrl(
                    item.url
                  )
                }
                alt=""
                aria-hidden="true"
                draggable={false}
                className={`absolute inset-0 h-full w-full select-none object-contain blur-[6px] transition-opacity duration-150 ${
                  fullReady
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />

              <img
                key={item.id}
                src={galleryFullUrl(
                  item.url
                )}
                alt={
                  item.title ||
                  "MKU Christian Union media"
                }
                draggable={false}
                decoding="async"
                onLoad={() =>
                  setFullReady(true)
                }
                className={`absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-150 ${
                  fullReady
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            </div>
          )}

          <div className="px-4 text-center">
            {item.title && (
              <h3 className="text-base font-semibold text-white md:text-lg">
                {item.title}
              </h3>
            )}

            {item.subtitle && (
              <p className="mx-auto mt-1 max-w-2xl text-sm text-white/70">
                {item.subtitle}
              </p>
            )}

            {collectionName && (
              <p className="mt-1 text-xs font-medium text-white/70">
                {collectionName}
              </p>
            )}

            <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-white/50">
              <span>
                {item.meta
                  ? `${item.meta} · `
                  : ""}
                {index + 1} /{" "}
                {displayTotal}
              </span>

              {loadingMore && (
                <span className="inline-flex items-center gap-1 text-white/70">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading more
                </span>
              )}
            </div>

            {atTrueEnd && (
              <p className="mt-2 text-xs font-medium text-white/70">
                End of{" "}
                {collectionName ||
                  "collection"}
              </p>
            )}
          </div>
        </div>
      </div>

      {showHint &&
        items.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-white shadow-lg">
              <ChevronLeft className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />

              <MoveHorizontal className="h-5 w-5" />

              <ChevronRight className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />
            </div>

            <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white/90">
              Swipe left or right to
              browse this collection
            </span>
          </div>
        )}
    </div>
  );
};
