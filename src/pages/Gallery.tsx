import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  Loader2,
  Image as ImageIcon,
  Camera,
  FolderOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { GalleryPhoto } from "@/components/GalleryPhoto";
import { MediaLightbox } from "@/components/MediaLightbox";
import { staticGalleryItems } from "@/data/staticSiteContent";
import { resolveMediaKind, MediaKind } from "@/lib/mediaKind";
import { galleryThumbUrl } from "@/lib/imageUrl";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  media_kind?: string | null;
  is_featured?: boolean | null;
  created_at: string;
}

const SELECT =
  "id,title,description,media_url,media_type,category,media_kind,is_featured,created_at";

const INITIAL_PER_CATEGORY = 12;
const STEP = 24;
const LIGHTBOX_PREFETCH_THRESHOLD = 4;

const TAB_COPY: Record<
  MediaKind,
  {
    label: string;
    noun: string;
    nounPlural: string;
    empty: string;
  }
> = {
  poster: {
    label: "Notice Board",
    noun: "poster",
    nounPlural: "posters",
    empty: "No announcement posters yet",
  },
  photo: {
    label: "Photos",
    noun: "photo",
    nounPlural: "photos",
    empty: "No photos yet",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  "Unverified Archive": "Church Gathering — 16 July 2026",
  Events: "Highlights",
};

const categoryLabel = (cat: string) => CATEGORY_LABELS[cat] || cat;

type CatalogEntry = {
  key: string;
  kind: MediaKind;
  count: number;
};

type LightboxSelection = {
  category: string;
  itemId: string;
} | null;

const Gallery = () => {
  const location = useLocation();

  const [tab, setTab] = useState<MediaKind>(
    location.pathname === "/photos" ? "photo" : "poster"
  );

  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * IMPORTANT:
   * byCategory contains REMOTE Supabase records only.
   * Static items are kept separate.
   */
  const [byCategory, setByCategory] = useState<Record<string, GalleryItem[]>>({});

  /**
   * Number of items that should currently be visible in each grid section.
   */
  const [shown, setShown] = useState<Record<string, number>>({});

  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("all");

  /**
   * The lightbox now remembers exactly which category was opened.
   * It no longer uses one global flattened gallery.
   */
  const [lightboxSelection, setLightboxSelection] =
    useState<LightboxSelection>(null);

  useSEO({
    title:
      tab === "poster"
        ? "Notice Board — MKU Christian Union Announcements"
        : "Photo Gallery — MKU Christian Union",
    description:
      tab === "poster"
        ? "Browse full program posters for services, fellowships, missions and special gatherings at MKU Christian Union."
        : "Photos capturing worship, fellowship, missions and community life at MKU Christian Union.",
    url: `https://mkucuu.lovable.app${
      tab === "poster" ? "/gallery" : "/photos"
    }`,
  });

  useEffect(() => {
    setTab(location.pathname === "/photos" ? "photo" : "poster");
    setActiveCategory("all");
    setLightboxSelection(null);
  }, [location.pathname]);

  const staticItems = staticGalleryItems as GalleryItem[];

  /**
   * Load category index only.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("media_gallery")
          .select("category,media_kind")
          .limit(2000);

        if (error) throw error;

        const counts = new Map<string, CatalogEntry>();

        /**
         * Add static categories first.
         * Static items DO NOT increment remote count.
         */
        staticItems.forEach((item) => {
          const key = item.category || "Other";

          if (!counts.has(key)) {
            counts.set(key, {
              key,
              kind: resolveMediaKind(item),
              count: 0,
            });
          }
        });

        /**
         * Count remote database records.
         */
        (data || []).forEach((row: any) => {
          const key = row.category || "Other";

          const entry =
            counts.get(key) ||
            ({
              key,
              kind: resolveMediaKind(row),
              count: 0,
            } as CatalogEntry);

          entry.count += 1;

          counts.set(key, entry);
        });

        if (!cancelled) {
          setCatalog(
            [...counts.values()].sort((a, b) => b.count - a.count)
          );
        }
      } catch (err) {
        console.error("Error loading gallery index:", err);

        if (!cancelled) {
          toast.error("Failed to load gallery");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [staticItems]);

  /**
   * Loads REMOTE records only.
   *
   * offset MUST be the number of remote records already loaded.
   * Static files must never affect this offset.
   */
  const fetchCategory = useCallback(
    async (key: string, offset: number, limit: number) => {
      if (limit <= 0) return;

      setBusy((current) => ({
        ...current,
        [key]: true,
      }));

      try {
        const query = supabase
          .from("media_gallery")
          .select(SELECT)
          .order("created_at", { ascending: false })
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        const { data, error } =
          key === "Other"
            ? await query.is("category", null)
            : await query.eq("category", key);

        if (error) throw error;

        setByCategory((current) => {
          const existing = current[key] || [];

          const seen = new Set(existing.map((item) => item.id));

          const newItems = (data || []).filter(
            (item: any) => !seen.has(item.id)
          );

          return {
            ...current,
            [key]: [...existing, ...newItems] as GalleryItem[],
          };
        });
      } catch (err) {
        console.error(`Error loading gallery category "${key}":`, err);
      } finally {
        setBusy((current) => ({
          ...current,
          [key]: false,
        }));
      }
    },
    []
  );

  const staticCountForCategory = useCallback(
    (key: string) =>
      staticItems.filter(
        (item) =>
          (item.category || "Other") === key &&
          resolveMediaKind(item) === tab
      ).length,
    [staticItems, tab]
  );

  const visibleCategories = useMemo(
    () =>
      catalog.filter((category) => {
        const staticCount = staticCountForCategory(category.key);

        return category.kind === tab || staticCount > 0;
      }),
    [catalog, tab, staticCountForCategory]
  );

  const shownCategories = useMemo(
    () =>
      activeCategory === "all"
        ? visibleCategories
        : visibleCategories.filter(
            (category) => category.key === activeCategory
          ),
    [visibleCategories, activeCategory]
  );

  /**
   * Initial lightweight category fetch.
   */
  useEffect(() => {
    shownCategories.forEach((category) => {
      const remoteLoaded = byCategory[category.key]?.length || 0;

      if (
        category.count > 0 &&
        remoteLoaded === 0 &&
        !busy[category.key]
      ) {
        fetchCategory(
          category.key,
          0,
          Math.min(INITIAL_PER_CATEGORY, category.count)
        );
      }
    });
  }, [shownCategories, byCategory, busy, fetchCategory]);

  /**
   * All currently loaded items for ONE category.
   *
   * Remote + static are combined for display.
   */
  const itemsFor = useCallback(
    (key: string) => {
      const remote = (byCategory[key] || []).filter(
        (item) => resolveMediaKind(item) === tab
      );

      const local = staticItems.filter(
        (item) =>
          (item.category || "Other") === key &&
          resolveMediaKind(item) === tab
      );

      return [...remote, ...local];
    },
    [byCategory, staticItems, tab]
  );

  /**
   * Grid sections.
   *
   * remoteLoadedCount remains separate from display count.
   */
  const sections = useMemo(
    () =>
      shownCategories
        .map((category) => {
          const allLoadedItems = itemsFor(category.key);

          const limit =
            shown[category.key] || INITIAL_PER_CATEGORY;

          const staticCount =
            staticCountForCategory(category.key);

          const total =
            category.count + staticCount;

          const remoteLoadedCount =
            byCategory[category.key]?.length || 0;

          return {
            ...category,
            total,
            items: allLoadedItems.slice(0, limit),
            allLoadedItems,
            remoteLoadedCount,
            limit,
          };
        })
        .filter(
          (section) =>
            section.items.length > 0 || section.total > 0
        ),
    [
      shownCategories,
      itemsFor,
      shown,
      staticCountForCategory,
      byCategory,
    ]
  );

  /**
   * Grid "View more".
   */
  const viewMore = useCallback(
    (
      key: string,
      remoteLoadedCount: number,
      currentLimit: number,
      remoteTotal: number
    ) => {
      const nextLimit = currentLimit + STEP;

      setShown((current) => ({
        ...current,
        [key]: nextLimit,
      }));

      /**
       * Only request more REMOTE records if some remain.
       */
      if (
        remoteLoadedCount < remoteTotal &&
        !busy[key]
      ) {
        const remaining =
          remoteTotal - remoteLoadedCount;

        fetchCategory(
          key,
          remoteLoadedCount,
          Math.min(STEP, remaining)
        );
      }
    },
    [busy, fetchCategory]
  );

  const copy = TAB_COPY[tab];

  const posterCount = useMemo(
    () =>
      catalog
        .filter((category) => category.kind === "poster")
        .reduce((sum, category) => sum + category.count, 0) +
      staticItems.filter(
        (item) => resolveMediaKind(item) === "poster"
      ).length,
    [catalog, staticItems]
  );

  const photoCount = useMemo(
    () =>
      catalog
        .filter((category) => category.kind === "photo")
        .reduce((sum, category) => sum + category.count, 0) +
      staticItems.filter(
        (item) => resolveMediaKind(item) === "photo"
      ).length,
    [catalog, staticItems]
  );

  const handleTabChange = (next: MediaKind) => {
    setTab(next);
    setActiveCategory("all");
    setLightboxSelection(null);
  };

  /**
   * Category currently being viewed in lightbox.
   */
  const lightboxCategory = lightboxSelection?.category ?? null;

  const lightboxGalleryItems = useMemo(() => {
    if (!lightboxCategory) return [];

    return itemsFor(lightboxCategory);
  }, [lightboxCategory, itemsFor]);

  /**
   * Current index is derived from the selected image ID,
   * which is safer than storing an index while the array grows.
   */
  const selectedIndex = useMemo(() => {
    if (!lightboxSelection) return null;

    const index = lightboxGalleryItems.findIndex(
      (item) => item.id === lightboxSelection.itemId
    );

    return index >= 0 ? index : null;
  }, [lightboxSelection, lightboxGalleryItems]);

  const lightboxItems = useMemo(
    () =>
      lightboxGalleryItems.map((item) => ({
        id: item.id,
        url: item.media_url,
        thumbUrl: galleryThumbUrl(
          item.media_url,
          resolveMediaKind(item) === "poster"
        ),
        title: item.title,
        subtitle: item.description,
        isVideo: item.media_type === "video",
        meta: new Date(item.created_at).toLocaleDateString(
          undefined,
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        ),
      })),
    [lightboxGalleryItems]
  );

  /**
   * Real totals for the currently opened category.
   */
  const lightboxCatalogEntry = useMemo(
    () =>
      lightboxCategory
        ? catalog.find(
            (category) => category.key === lightboxCategory
          ) || null
        : null,
    [catalog, lightboxCategory]
  );

  const lightboxRemoteTotal =
    lightboxCatalogEntry?.count || 0;

  const lightboxRemoteLoaded =
    lightboxCategory
      ? byCategory[lightboxCategory]?.length || 0
      : 0;

  const lightboxStaticTotal =
    lightboxCategory
      ? staticCountForCategory(lightboxCategory)
      : 0;

  const lightboxTotal =
    lightboxRemoteTotal + lightboxStaticTotal;

  const hasMoreLightboxRemote =
    lightboxRemoteLoaded < lightboxRemoteTotal;

  /**
   * Automatically fetch more items while the user approaches
   * the end of the currently loaded category.
   */
  useEffect(() => {
    if (
      !lightboxCategory ||
      selectedIndex === null ||
      !hasMoreLightboxRemote ||
      busy[lightboxCategory]
    ) {
      return;
    }

    const remainingLoaded =
      lightboxGalleryItems.length - selectedIndex - 1;

    if (
      remainingLoaded <= LIGHTBOX_PREFETCH_THRESHOLD
    ) {
      const remainingRemote =
        lightboxRemoteTotal - lightboxRemoteLoaded;

      fetchCategory(
        lightboxCategory,
        lightboxRemoteLoaded,
        Math.min(STEP, remainingRemote)
      );
    }
  }, [
    lightboxCategory,
    selectedIndex,
    hasMoreLightboxRemote,
    busy,
    lightboxGalleryItems.length,
    lightboxRemoteTotal,
    lightboxRemoteLoaded,
    fetchCategory,
  ]);

  /**
   * Opens an item locked to its own collection.
   */
  const openLightbox = useCallback(
    (category: string, itemId: string) => {
      setLightboxSelection({
        category,
        itemId,
      });
    },
    []
  );

  /**
   * Lightbox reports index changes.
   * Convert that index back into stable ID-based state.
   */
  const handleLightboxIndexChange = useCallback(
    (nextIndex: number) => {
      const item = lightboxGalleryItems[nextIndex];

      if (!item || !lightboxCategory) return;

      setLightboxSelection({
        category: lightboxCategory,
        itemId: item.id,
      });
    },
    [lightboxGalleryItems, lightboxCategory]
  );

  const hero = usePageHero(
    tab === "poster" ? "gallery" : "photos",
    {
      badge:
        tab === "poster"
          ? "Notice Board"
          : "Photo Gallery",
      title:
        tab === "poster"
          ? "Announcement Posters"
          : "Church Photos",
      subtitle:
        tab === "poster"
          ? "Official program posters for services, fellowships, missions and special gatherings."
          : "Moments captured across worship, fellowship, missions and campus life.",
      image:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=70",
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative min-h-[32vh] md:min-h-[42vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={hero.image}
              alt="MKU Christian Union gathering"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              {...({ fetchpriority: "high" } as any)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          </div>

          <div className="container mx-auto px-4 relative z-10 pb-8 md:pb-12">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
              {tab === "poster" ? (
                <Megaphone className="w-3.5 h-3.5" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}

              {hero.badge}
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3">
              {hero.title}
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {hero.subtitle}
            </p>
          </div>
        </section>

        {/* Tabs + collections */}
        <section className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="inline-flex rounded-full bg-muted p-1">
              {(["poster", "photo"] as MediaKind[]).map(
                (kind) => (
                  <button
                    key={kind}
                    onClick={() =>
                      handleTabChange(kind)
                    }
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      tab === kind
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {TAB_COPY[kind].label}

                    <span className="ml-1.5 text-xs opacity-70">
                      {kind === "poster"
                        ? posterCount
                        : photoCount}
                    </span>
                  </button>
                )
              )}
            </div>

            {visibleCategories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  "all",
                  ...visibleCategories.map(
                    (category) => category.key
                  ),
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setLightboxSelection(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      activeCategory === category
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category === "all"
                      ? "All collections"
                      : categoryLabel(category)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Collections */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : sections.length > 0 ? (
              <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
                {sections.map((section) => (
                  <section key={section.key}>
                    <div className="mb-5 flex items-end justify-between gap-3 md:mb-6">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-primary md:h-6 md:w-6" />

                        <h2 className="text-xl font-serif font-semibold text-foreground md:text-3xl">
                          {categoryLabel(section.key)}
                        </h2>
                      </div>

                      <span className="whitespace-nowrap text-xs text-muted-foreground md:text-sm">
                        {section.total}{" "}
                        {section.total === 1
                          ? copy.noun
                          : copy.nounPlural}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                      {section.items.map(
                        (item, index) => (
                          <GalleryPhoto
                            key={item.id}
                            item={item}
                            priority={index < 4}
                            onOpen={() =>
                              openLightbox(
                                section.key,
                                item.id
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {section.items.length <
                      section.total && (
                      <div className="mt-5 flex justify-center">
                        <Button
                          variant="outline"
                          disabled={
                            !!busy[section.key]
                          }
                          onClick={() =>
                            viewMore(
                              section.key,
                              section.remoteLoadedCount,
                              section.limit,
                              section.count
                            )
                          }
                        >
                          {busy[section.key] && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}

                          View more{" "}
                          {copy.nounPlural} (
                          {section.total -
                            section.items.length}{" "}
                          left)
                        </Button>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />

                <p className="text-lg font-medium text-muted-foreground">
                  {copy.empty}
                </p>

                <Link
                  to={
                    tab === "poster"
                      ? "/photos"
                      : "/gallery"
                  }
                  className="mt-4 inline-block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTabChange(
                        tab === "poster"
                          ? "photo"
                          : "poster"
                      )
                    }
                  >
                    View{" "}
                    {tab === "poster"
                      ? "photos"
                      : "notice board"}{" "}
                    instead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <MediaLightbox
          items={lightboxItems}
          index={selectedIndex}
          onIndexChange={
            handleLightboxIndexChange
          }
          onClose={() =>
            setLightboxSelection(null)
          }
          hasMore={hasMoreLightboxRemote}
          loadingMore={
            lightboxCategory
              ? !!busy[lightboxCategory]
              : false
          }
          total={lightboxTotal}
          collectionName={
            lightboxCategory
              ? categoryLabel(lightboxCategory)
              : undefined
          }
        />
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
