import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Megaphone, Loader2, Image as ImageIcon, Camera, FolderOpen } from "lucide-react";
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

const SELECT = "id,title,description,media_url,media_type,category,media_kind,is_featured,created_at";
const INITIAL_PER_CATEGORY = 12;
const STEP = 24;

const TAB_COPY: Record<MediaKind, { label: string; noun: string; nounPlural: string; empty: string }> = {
  poster: { label: "Notice Board", noun: "poster", nounPlural: "posters", empty: "No announcement posters yet" },
  photo: { label: "Photos", noun: "photo", nounPlural: "photos", empty: "No photos yet" },
};

const CATEGORY_LABELS: Record<string, string> = {
  "Unverified Archive": "Church Gathering — 16 July 2026",
  Events: "Highlights",
};

const categoryLabel = (cat: string) => CATEGORY_LABELS[cat] || cat;

type CatalogEntry = { key: string; kind: MediaKind; count: number };

const Gallery = () => {
  const location = useLocation();
  const [tab, setTab] = useState<MediaKind>(location.pathname === "/photos" ? "photo" : "poster");
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [byCategory, setByCategory] = useState<Record<string, GalleryItem[]>>({});
  const [shown, setShown] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useSEO({
    title:
      tab === "poster"
        ? "Notice Board — MKU Christian Union Announcements"
        : "Photo Gallery — MKU Christian Union",
    description:
      tab === "poster"
        ? "Browse full program posters for services, fellowships, missions and special gatherings at MKU Christian Union."
        : "Photos capturing worship, fellowship, missions and community life at MKU Christian Union.",
    url: `https://mkucuu.lovable.app${tab === "poster" ? "/gallery" : "/photos"}`,
  });

  useEffect(() => {
    setTab(location.pathname === "/photos" ? "photo" : "poster");
    setActiveCategory("all");
  }, [location.pathname]);

  // Static (bundled) poster archive is available instantly.
  const staticItems = staticGalleryItems as GalleryItem[];

  // 1. Tiny query: just the category + kind of every record, so we know the
  //    shape of the archive without downloading 600 rows of metadata.
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
        staticItems.forEach((item) => {
          const key = item.category || "Other";
          const entry = counts.get(key) || { key, kind: resolveMediaKind(item), count: 0 };
          counts.set(key, entry);
        });
        (data || []).forEach((row: any) => {
          const key = row.category || "Other";
          const entry = counts.get(key) || { key, kind: resolveMediaKind(row), count: 0 };
          entry.count += 1;
          counts.set(key, entry);
        });
        if (!cancelled) setCatalog([...counts.values()].sort((a, b) => b.count - a.count));
      } catch (err) {
        console.error("Error loading gallery index:", err);
        if (!cancelled) toast.error("Failed to load gallery");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchCategory = useCallback(async (key: string, offset: number, limit: number) => {
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const query = supabase
        .from("media_gallery")
        .select(SELECT)
        .order("created_at", { ascending: false })
        .order("sort_order", { ascending: true })
        .range(offset, offset + limit - 1);
      const { data, error } = key === "Other" ? await query.is("category", null) : await query.eq("category", key);
      if (error) throw error;
      setByCategory((current) => {
        const existing = current[key] || [];
        const seen = new Set(existing.map((i) => i.id));
        const merged = [...existing, ...(data || []).filter((i: any) => !seen.has(i.id))];
        return { ...current, [key]: merged as GalleryItem[] };
      });
    } catch (err) {
      console.error("Error loading category:", err);
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  }, []);

  const visibleCategories = useMemo(
    () =>
      catalog.filter((c) => {
        const staticCount = staticItems.filter(
          (i) => (i.category || "Other") === c.key && resolveMediaKind(i) === tab
        ).length;
        return c.kind === tab || staticCount > 0;
      }),
    [catalog, tab, staticItems]
  );

  const shownCategories = useMemo(
    () => (activeCategory === "all" ? visibleCategories : visibleCategories.filter((c) => c.key === activeCategory)),
    [visibleCategories, activeCategory]
  );

  // First page for every visible category (parallel, small payloads).
  useEffect(() => {
    shownCategories.forEach((c) => {
      if (c.count > 0 && !byCategory[c.key] && !busy[c.key]) fetchCategory(c.key, 0, INITIAL_PER_CATEGORY);
    });
  }, [shownCategories, byCategory, busy, fetchCategory]);

  const itemsFor = useCallback(
    (key: string) => {
      const local = staticItems.filter((i) => (i.category || "Other") === key && resolveMediaKind(i) === tab);
      const remote = (byCategory[key] || []).filter((i) => resolveMediaKind(i) === tab);
      return [...remote, ...local];
    },
    [byCategory, staticItems, tab]
  );

  const sections = useMemo(
    () =>
      shownCategories
        .map((c) => {
          const all = itemsFor(c.key);
          const limit = shown[c.key] || INITIAL_PER_CATEGORY;
          const total = c.count + staticItems.filter((i) => (i.category || "Other") === c.key && resolveMediaKind(i) === tab).length;
          return { ...c, total, items: all.slice(0, limit), loadedCount: all.length, limit };
        })
        .filter((s) => s.items.length > 0 || s.total > 0),
    [shownCategories, itemsFor, shown, staticItems, tab]
  );

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const viewMore = (key: string, loadedCount: number, limit: number) => {
    const next = limit + STEP;
    setShown((s) => ({ ...s, [key]: next }));
    if (loadedCount < next) fetchCategory(key, loadedCount, next - loadedCount + STEP);
  };

  const copy = TAB_COPY[tab];

  const posterCount = useMemo(
    () =>
      catalog.filter((c) => c.kind === "poster").reduce((sum, c) => sum + c.count, 0) +
      staticItems.filter((i) => resolveMediaKind(i) === "poster").length,
    [catalog, staticItems]
  );
  const photoCount = useMemo(
    () => catalog.filter((c) => c.kind === "photo").reduce((sum, c) => sum + c.count, 0),
    [catalog]
  );

  const handleTabChange = (next: MediaKind) => {
    setTab(next);
    setActiveCategory("all");
    setSelectedIndex(null);
  };

  const lightboxItems = useMemo(
    () =>
      flatItems.map((it) => ({
        id: it.id,
        url: it.media_url,
        thumbUrl: galleryThumbUrl(it.media_url, resolveMediaKind(it) === "poster"),
        title: it.title,
        subtitle: it.description,
        isVideo: it.media_type === "video",
        meta: new Date(it.created_at).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      })),
    [flatItems]
  );

  const hero = usePageHero(tab === "poster" ? "gallery" : "photos", {
    badge: tab === "poster" ? "Notice Board" : "Photo Gallery",
    title: tab === "poster" ? "Announcement Posters" : "Church Photos",
    subtitle:
      tab === "poster"
        ? "Official program posters for services, fellowships, missions and special gatherings."
        : "Moments captured across worship, fellowship, missions and campus life.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=70",
  });

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
              {tab === "poster" ? <Megaphone className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              {hero.badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3">{hero.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">{hero.subtitle}</p>
          </div>
        </section>

        {/* Tabs + collections */}
        <section className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="inline-flex rounded-full bg-muted p-1">
              {(["poster", "photo"] as MediaKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => handleTabChange(k)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    tab === k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {TAB_COPY[k].label}
                  <span className="ml-1.5 text-xs opacity-70">{k === "poster" ? posterCount : photoCount}</span>
                </button>
              ))}
            </div>

            {visibleCategories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {["all", ...visibleCategories.map((c) => c.key)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      activeCategory === cat
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "All collections" : categoryLabel(cat)}
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
                        {section.total} {section.total === 1 ? copy.noun : copy.nounPlural}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                      {section.items.map((item, i) => (
                        <GalleryPhoto
                          key={item.id}
                          item={item}
                          priority={i < 4}
                          onOpen={() => setSelectedIndex(flatItems.findIndex((x) => x.id === item.id))}
                        />
                      ))}
                    </div>

                    {section.items.length < section.total && (
                      <div className="mt-5 flex justify-center">
                        <Button
                          variant="outline"
                          disabled={!!busy[section.key]}
                          onClick={() => viewMore(section.key, section.loadedCount, section.limit)}
                        >
                          {busy[section.key] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          View more {copy.nounPlural} ({section.total - section.items.length} left)
                        </Button>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">{copy.empty}</p>
                <Link to={tab === "poster" ? "/photos" : "/gallery"} className="mt-4 inline-block">
                  <Button variant="outline" size="sm" onClick={() => handleTabChange(tab === "poster" ? "photo" : "poster")}>
                    View {tab === "poster" ? "photos" : "notice board"} instead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <MediaLightbox
          items={lightboxItems}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
