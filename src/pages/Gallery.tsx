import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, ChevronLeft, ChevronRight, Play, Loader2, Image as ImageIcon, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { GalleryPhoto } from "@/components/GalleryPhoto";
import { staticGalleryItems } from "@/data/staticSiteContent";


interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  category: string | null;
  is_featured: boolean | null;
  created_at: string;
}

type DayGroup = { dayKey: string; dayLabel: string; items: GalleryItem[] };
type MonthGroup = { monthKey: string; monthLabel: string; days: DayGroup[]; total: number };

const MONTHS_PER_PAGE = 3;
const PAGE_SIZE = 60;

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [visibleMonths, setVisibleMonths] = useState(MONTHS_PER_PAGE);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useSEO({
    title: "Photo Gallery — Moments of Faith",
    description: "Browse photos and videos capturing worship, fellowship, and community at MKU Christian Union.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/gallery",
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async (page = 0) => {
    page === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from("media_gallery")
        .select("id,title,description,media_url,media_type,category,is_featured,created_at")
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) throw error;
      setItems((current) => {
        if (page > 0) return [...current, ...(data || [])];
        const merged = new Map(staticGalleryItems.map((item) => [item.id, item]));
        (data || []).forEach((item) => merged.set(item.id, item));
        return [...merged.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
      setHasMoreItems((data || []).length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery");
      if (page === 0) setItems(staticGalleryItems);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.category || "Other")))],
    [items]
  );

  const categoryItems = useMemo(
    () => (filter === "all" ? items : items.filter((i) => (i.category || "Other") === filter)),
    [items, filter]
  );

  // Group by Month/Year then by Day (Google Photos style)
  const monthGroups: MonthGroup[] = useMemo(() => {
    const months = new Map<string, MonthGroup>();
    categoryItems.forEach((item) => {
      const d = new Date(item.created_at);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const monthLabel = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const dayKey = d.toDateString();
      const dayLabel = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      if (!months.has(monthKey)) {
        months.set(monthKey, { monthKey, monthLabel, days: [], total: 0 });
      }
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

  // Flat list (matches visual order) for lightbox navigation
  const flatItems = useMemo(
    () => monthGroups.flatMap((m) => m.days.flatMap((d) => d.items)),
    [monthGroups]
  );

  const shownMonths = monthGroups.slice(0, visibleMonths);
  const hasMore = visibleMonths < monthGroups.length || hasMoreItems;

  // Infinite scroll: reveal more month groups as user scrolls
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

  const openLightbox = (item: GalleryItem) => {
    const idx = flatItems.findIndex((x) => x.id === item.id);
    if (idx >= 0) setSelectedIndex(idx);
  };
  const closeLightbox = () => setSelectedIndex(null);
  const nextImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % flatItems.length);
  };
  const prevImage = () => {
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + flatItems.length) % flatItems.length);
  };

  // Preload neighbors for snappier lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    [selectedIndex + 1, selectedIndex - 1].forEach((i) => {
      const it = flatItems[(i + flatItems.length) % flatItems.length];
      if (it && it.media_type !== "video") {
        const img = new Image();
        img.src = optimizedImageUrl(it.media_url, { width: 1400, quality: 78, resize: "contain" });
      }
    });
  }, [selectedIndex, flatItems]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, flatItems.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIndex]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[40vh] md:min-h-[50vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=70"
              alt="Gallery"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-14">
            <div className="inline-flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Camera className="w-4 h-4" /> Photo Gallery
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              Moments of Faith
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl">
              Browse photos grouped by date — just like an album of memories.
            </p>
          </div>
        </section>

        {/* Category filter */}
        <section className="py-3 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilterChange(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-all flex-shrink-0 ${
                    filter === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
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
                    {/* Month header */}
                    <div className="flex items-end justify-between gap-3 mb-5 md:mb-6">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        <h2 className="text-xl md:text-3xl font-serif font-semibold text-foreground">
                          {month.monthLabel}
                        </h2>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        {month.total} {month.total === 1 ? "photo" : "photos"}
                      </span>
                    </div>

                    {/* Day groups */}
                    <div className="space-y-8">
                      {month.days.map((day) => (
                        <div
                          key={day.dayKey}
                          style={{
                            contentVisibility: "auto",
                            containIntrinsicSize: "1px 800px",
                          }}
                        >
                          <div className="-mx-1 mb-3 flex items-center justify-between gap-2 bg-background px-1 py-2">
                            <h3 className="text-sm font-semibold text-foreground/90 md:text-base">
                              {day.dayLabel}
                            </h3>
                            <span className="whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {day.items.length} {day.items.length === 1 ? "photo" : "photos"}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:gap-2 lg:grid-cols-5 xl:grid-cols-6">
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
                        Load older photos
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <ImageIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No gallery items yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Photos will appear here once uploaded</p>
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        {selectedIndex !== null && flatItems[selectedIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-start justify-center overflow-y-auto sm:items-center sm:overflow-hidden"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="fixed top-3 right-3 md:top-4 md:right-4 text-white/80 hover:text-white z-20 p-2 bg-black/40 rounded-full"
              aria-label="Close"
            >
              <X className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-20 bg-black/40 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="w-7 h-7 md:w-9 md:h-9" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-20 bg-black/40 rounded-full"
              aria-label="Next"
            >
              <ChevronRight className="w-7 h-7 md:w-9 md:h-9" />
            </button>
            <div
              className="w-full max-w-7xl px-0 pt-14 pb-8 sm:px-12 sm:py-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex w-full items-start justify-center overflow-hidden bg-muted/10 sm:h-[80vh] sm:items-center sm:rounded-lg">
                {flatItems[selectedIndex].media_type === "video" ? (
                  <video
                    src={flatItems[selectedIndex].media_url}
                    controls
                    className="w-full h-auto sm:h-full sm:w-auto sm:max-h-full sm:max-w-full"
                  />
                ) : (
                  <img
                    src={optimizedImageUrl(flatItems[selectedIndex].media_url, { width: 1600, quality: 82, resize: "contain" })}
                    alt={flatItems[selectedIndex].title}
                    className="w-full h-auto object-contain sm:h-full sm:w-auto sm:max-h-full sm:max-w-full"
                  />
                )}
              </div>
              <div className="text-center mt-3 sm:mt-4 px-4 max-w-3xl mx-auto">
                {flatItems[selectedIndex].title && (
                  <h3 className="text-white text-lg font-semibold">{flatItems[selectedIndex].title}</h3>
                )}
                {flatItems[selectedIndex].description && (
                  <p className="text-white/70 mt-1 text-sm leading-relaxed">
                    {flatItems[selectedIndex].description}
                  </p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  {new Date(flatItems[selectedIndex].created_at).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" · "}
                  {selectedIndex + 1} / {flatItems.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
