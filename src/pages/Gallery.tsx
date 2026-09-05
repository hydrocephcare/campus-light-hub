import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { usePageHero } from "@/hooks/usePageContent";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Megaphone, X, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, CalendarDays, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { GalleryPhoto } from "@/components/GalleryPhoto";
import { staticGalleryItems } from "@/data/staticSiteContent";
import { resolveMediaKind, MediaKind } from "@/lib/mediaKind";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  media_kind?: string | null;
  is_featured: boolean | null;
  created_at: string;
}

type DayGroup = { dayKey: string; dayLabel: string; items: GalleryItem[] };
type MonthGroup = { monthKey: string; monthLabel: string; days: DayGroup[]; total: number };

const MONTHS_PER_PAGE = 3;
const PAGE_SIZE = 60;

const TAB_COPY: Record<MediaKind, { label: string; noun: string; nounPlural: string; empty: string }> = {
  poster: { label: "Notice Board", noun: "poster", nounPlural: "posters", empty: "No announcement posters yet" },
  photo: { label: "Photos", noun: "photo", nounPlural: "photos", empty: "No photos yet" },
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  "Unverified Archive": "Archive Collection",
};

const categoryLabel = (cat: string) => CATEGORY_LABELS[cat] || cat;

const Gallery = () => {
  const location = useLocation();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tab, setTab] = useState<MediaKind>(location.pathname === "/photos" ? "photo" : "poster");
  const [filter, setFilter] = useState<string>("all");
  const [visibleMonths, setVisibleMonths] = useState(MONTHS_PER_PAGE);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useSEO({
    title: tab === "poster"
      ? "Notice Board — MKU Christian Union Announcements"
      : "Photo Gallery — MKU Christian Union",
    description: tab === "poster"
      ? "Browse full program posters for services, fellowships, missions and special gatherings at MKU Christian Union."
      : "Photos capturing worship, fellowship, missions and community life at MKU Christian Union.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    url: `https://mkucuu.lovable.app${tab === "poster" ? "/gallery" : "/photos"}`,
  });

  useEffect(() => {
    setTab(location.pathname === "/photos" ? "photo" : "poster");
  }, [location.pathname]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async (page = 0) => {
    page === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from("media_gallery")
        .select("id,title,description,media_url,media_type,category,media_kind,is_featured,created_at")
        .order("created_at", { ascending: false })
        .order("sort_order", { ascending: true })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) throw error;
      setItems((current) => {
        if (page > 0) return [...current, ...(data || [])];
        const merged = new Map<string, GalleryItem>(staticGalleryItems.map((item) => [item.id, item as GalleryItem]));
        (data || []).forEach((item) => merged.set(item.id, item as GalleryItem));
        return [...merged.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
      setHasMoreItems((data || []).length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery");
      if (page === 0) setItems(staticGalleryItems as GalleryItem[]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const kindItems = useMemo(() => items.filter((i) => resolveMediaKind(i) === tab), [items, tab]);

  const posterCount = useMemo(() => items.filter((i) => resolveMediaKind(i) === "poster").length, [items]);
  const photoCount = items.length - posterCount;

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(kindItems.map((i) => i.category || "Other")))],
    [kindItems]
  );

  const categoryItems = useMemo(
    () => (filter === "all" ? kindItems : kindItems.filter((i) => (i.category || "Other") === filter)),
    [kindItems, filter]
  );

  const copy = TAB_COPY[tab];

  // Group by Month/Year then by Day
  const monthGroups: MonthGroup[] = useMemo(() => {
    const months = new Map<string, MonthGroup>();
    categoryItems.forEach((item) => {
      const d = new Date(item.created_at);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const monthLabel = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const dayKey = d.toDateString();
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

      if (!months.has(monthKey)) months.set(monthKey, { monthKey, monthLabel, days: [], total: 0 });
      const m = months.get(monthKey)!;
      let day = m.days.find((x) => x.dayKey === dayKey);
      if (!day) {
        day = { dayKey, dayLabel, items: [] };
        m.days.push(day);
      }
      day.items.push(item);
      m.total += 1;
    });
    return Array.from(months.values());
  }, [categoryItems]);

  const flatItems = useMemo(
    () => monthGroups.flatMap((m) => m.days.flatMap((d) => d.items)),
    [monthGroups]
  );

  const shownMonths = monthGroups.slice(0, visibleMonths);
  const hasMore = visibleMonths < monthGroups.length || hasMoreItems;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (visibleMonths < monthGroups.length) setVisibleMonths((v) => v + MONTHS_PER_PAGE);
          else if (hasMoreItems && !loadingMore) fetchGallery(Math.floor(items.length / PAGE_SIZE));
        }
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, shownMonths.length, visibleMonths, monthGroups.length, hasMoreItems, loadingMore, items.length]);

  const handleFilterChange = (category: string) => {
    setFilter(category);
    setVisibleMonths(MONTHS_PER_PAGE);
  };

  const handleTabChange = (next: MediaKind) => {
    setTab(next);
    setFilter("all");
    setVisibleMonths(MONTHS_PER_PAGE);
  };

  const openLightbox = (item: GalleryItem) => {
    const idx = flatItems.findIndex((x) => x.id === item.id);
    if (idx >= 0) setSelectedIndex(idx);
  };
  const closeLightbox = () => setSelectedIndex(null);

  const lightboxItems = useMemo(
    () =>
      flatItems.map((it) => ({
        id: it.id,
        url: it.media_url,
        title: it.title,
        subtitle: it.description,
        isVideo: it.media_type === "video",
        meta: new Date(it.created_at).toLocaleDateString(undefined, {
          weekday: "long",
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
        <section className="relative min-h-[38vh] md:min-h-[46vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={hero.image}
              alt="MKU Christian Union gathering"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-8 md:pb-12">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
              {tab === "poster" ? <Megaphone className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
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

        {/* Kind tabs */}
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

            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-all flex-shrink-0 ${
                      filter === cat
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Grid */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : flatItems.length > 0 ? (
              <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
                {shownMonths.map((month) => (
                  <section key={month.monthKey}>
                    <div className="flex items-end justify-between gap-3 mb-5 md:mb-6">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        <h2 className="text-xl md:text-3xl font-serif font-semibold text-foreground">
                          {month.monthLabel}
                        </h2>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        {month.total} {month.total === 1 ? copy.noun : copy.nounPlural}
                      </span>
                    </div>

                    <div className="space-y-8">
                      {month.days.map((day) => (
                        <div
                          key={day.dayKey}
                          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
                        >
                          <div className="-mx-1 mb-3 flex items-center justify-between gap-2 px-1 py-2">
                            <h3 className="text-sm font-semibold text-foreground/90 md:text-base">
                              {day.dayLabel}
                            </h3>
                            <span className="whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {day.items.length} {day.items.length === 1 ? copy.noun : copy.nounPlural}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                            {day.items.map((item, i) => (
                              <GalleryPhoto
                                key={item.id}
                                item={item}
                                priority={i < 4}
                                onOpen={() => openLightbox(item)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center pt-6">
                    <Button
                      variant="outline"
                      disabled={loadingMore}
                      onClick={() => {
                        if (visibleMonths < monthGroups.length) setVisibleMonths((v) => v + MONTHS_PER_PAGE);
                        else fetchGallery(Math.floor(items.length / PAGE_SIZE));
                      }}
                    >
                      {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Load older {copy.nounPlural}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">{copy.empty}</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {tab === "poster"
                    ? "Program posters will appear here once uploaded"
                    : "Photos from services and events will appear here"}
                </p>
                <Link to={tab === "poster" ? "/photos" : "/gallery"} className="mt-4 inline-block">
                  <Button variant="outline" size="sm" onClick={() => handleTabChange(tab === "poster" ? "photo" : "poster")}>
                    View {tab === "poster" ? "photos" : "notice board"} instead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <MediaLightbox
          items={lightboxItems}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={closeLightbox}
        />

      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
