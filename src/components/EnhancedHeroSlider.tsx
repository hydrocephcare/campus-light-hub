import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { COMMUNITY_IMAGES, WHATSAPP_LINK, isMkucuCloudinaryImage } from "@/lib/siteImages";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  verse: string | null;
  verse_ref: string | null;
  image_url: string;
  cta1_text: string | null;
  cta1_link: string | null;
  cta2_text: string | null;
  cta2_link: string | null;
}

const curatedSlides: HeroSlide[] = [
  {
    id: "mkucu-welcome",
    title: "Welcome to MKU Christian Union",
    subtitle: "Living the Knowledge of God",
    verse: '"Now this is eternal life: that they know you, the only true God, and Jesus Christ, whom you have sent."',
    verse_ref: "John 17:3",
    image_url: COMMUNITY_IMAGES[0],
    cta1_text: "Join MKU CU Today",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "See Upcoming Events",
    cta2_link: "/events",
  },
  {
    id: "mkucu-fellowship",
    title: "Worship. Word. Fellowship.",
    subtitle: "Grow with a Christ-centred community on campus",
    verse: '"Let us consider how we may spur one another on toward love and good deeds... not giving up meeting together."',
    verse_ref: "Hebrews 10:24–25",
    image_url: COMMUNITY_IMAGES[1],
    cta1_text: "Connect With Us",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "View Weekly Schedule",
    cta2_link: "/schedule",
  },
  {
    id: "mkucu-family",
    title: "A Family on Campus",
    subtitle: "Find fellowship, friendship and a place to belong",
    verse: '"How good and pleasant it is when God’s people live together in unity!"',
    verse_ref: "Psalm 133:1",
    image_url: COMMUNITY_IMAGES[2],
    cta1_text: "I'm New Here",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "Visit MKU CU",
    cta2_link: "/visitors",
  },
  {
    id: "mkucu-serve",
    title: "Called to Serve",
    subtitle: "Discover your gift and use it for God's glory",
    verse: '"Each of you should use whatever gift you have received to serve others."',
    verse_ref: "1 Peter 4:10",
    image_url: COMMUNITY_IMAGES[3],
    cta1_text: "Serve With Us",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "Explore Ministries",
    cta2_link: "/ministries",
  },
  {
    id: "mkucu-mission",
    title: "From Campus to the Nations",
    subtitle: "Sharing Christ through missions, outreach and everyday life",
    verse: '"Go and make disciples of all nations..."',
    verse_ref: "Matthew 28:19",
    image_url: COMMUNITY_IMAGES[4],
    cta1_text: "Join the Mission",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "Explore Missions",
    cta2_link: "/missions",
  },
  {
    id: "mkucu-word",
    title: "Rooted in the Word",
    subtitle: "Learn, pray, grow and walk faithfully with Christ",
    verse: '"Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom."',
    verse_ref: "Colossians 3:16",
    image_url: COMMUNITY_IMAGES[5],
    cta1_text: "Talk to MKU CU",
    cta1_link: WHATSAPP_LINK,
    cta2_text: "Read the Journal",
    cta2_link: "/blog",
  },
];

export const EnhancedHeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(curatedSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          // Keep useful admin-written copy, but never let legacy stock imagery
          // replace the curated MKUCU community photography. Also guarantee a
          // full six-image rotation even when the database has fewer slides.
          const merged = curatedSlides.map((base, index) => {
            const remote = data[index];
            if (!remote) return base;
            return {
              ...base,
              title: remote.title?.trim() || base.title,
              subtitle: remote.subtitle?.trim() || base.subtitle,
              verse: remote.verse?.trim() || base.verse,
              verse_ref: remote.verse_ref?.trim() || base.verse_ref,
              image_url: isMkucuCloudinaryImage(remote.image_url) ? remote.image_url : base.image_url,
              cta1_text: remote.cta1_text?.trim() || base.cta1_text,
              cta1_link: remote.cta1_link?.trim() || base.cta1_link,
              cta2_text: remote.cta2_text?.trim() || base.cta2_text,
              cta2_link: remote.cta2_link?.trim() || base.cta2_link,
            };
          });
          setSlides(merged);
        }
      } catch (err) {
        console.error("Error fetching hero slides:", err);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = useCallback(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); setIsAutoPlaying(false); }, [slides.length]);
  const prevSlide = useCallback(() => { setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); setIsAutoPlaying(false); }, [slides.length]);
  const goToSlide = useCallback((index: number) => { setCurrentSlide(index); setIsAutoPlaying(false); }, []);
  const isExternal = (link: string) => link.startsWith("http");

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || slides.length <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) nextSlide(); else prevSlide();
  };

  const linkProps = (link: string) => (isExternal(link) ? { target: "_blank", rel: "noopener noreferrer" } : {});
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="relative h-[88vh] min-h-[540px] max-h-[920px] w-full overflow-hidden touch-pan-y select-none pt-[72px]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={index !== currentSlide}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={optimizedImageUrl(slide.image_url, { width: index === currentSlide ? 1600 : 900, quality: 72 })}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover ${index === currentSlide ? "animate-hero-zoom" : ""}`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

          <div className="relative flex h-full items-center px-4 pb-20 md:pb-24">
            <div className="container mx-auto">
              <div key={index === currentSlide ? `on-${slide.id}` : slide.id} className={`max-w-2xl text-left ${index === currentSlide ? "animate-hero-text" : ""}`}>
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                  <span className="h-px w-8 bg-secondary" />
                  MKU Christian Union
                </p>
                <h1 className="mb-4 font-serif text-4xl font-semibold leading-[1.05] text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">{slide.title}</h1>
                {slide.subtitle && <p className="mb-5 text-lg font-medium text-secondary md:text-2xl">{slide.subtitle}</p>}
                {slide.verse && (
                  <p className="mb-7 max-w-xl border-l-2 border-secondary/70 pl-4 text-sm italic leading-relaxed text-white/85 md:text-base">
                    {slide.verse}
                    {slide.verse_ref && <span className="mt-1 block text-xs not-italic font-semibold tracking-wide text-secondary/90">{slide.verse_ref}</span>}
                  </p>
                )}
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {slide.cta1_text && slide.cta1_link && (
                    <a href={slide.cta1_link} {...linkProps(slide.cta1_link)}>
                      <Button size="lg" className="rounded-full bg-secondary px-8 font-semibold text-secondary-foreground shadow-lg shadow-black/30 hover:bg-secondary/90">{slide.cta1_text} →</Button>
                    </a>
                  )}
                  {slide.cta2_text && slide.cta2_link && (
                    <a href={slide.cta2_link} {...linkProps(slide.cta2_link)} className="text-sm font-semibold text-white underline decoration-white/40 underline-offset-8 transition hover:decoration-secondary">
                      {slide.cta2_text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all z-10" aria-label="Previous slide"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-all z-10" aria-label="Next slide"><ChevronRight className="w-6 h-6 text-white" /></button>

          <div className="absolute bottom-6 md:bottom-10 inset-x-0 z-10">
            <div className="container mx-auto flex items-center gap-4 px-4">
              <span className="font-serif text-sm tabular-nums text-white/80">{pad(currentSlide + 1)} <span className="text-white/40">/ {pad(slides.length)}</span></span>
              <div className="flex flex-1 max-w-md gap-2">
                {slides.map((_, index) => (
                  <button key={index} onClick={() => goToSlide(index)} className="group h-6 flex-1 flex items-center" aria-label={`Go to slide ${index + 1}`}>
                    <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover:bg-white/40">
                      <span
                        key={index === currentSlide ? `p-${currentSlide}-${isAutoPlaying}` : "idle"}
                        className={`absolute inset-y-0 left-0 rounded-full bg-secondary ${index < currentSlide ? "w-full" : index === currentSlide ? (isAutoPlaying ? "animate-hero-progress" : "w-full") : "w-0"}`}
                      />
                    </span>
                  </button>
                ))}
              </div>
              <ChevronDown className="ml-auto hidden h-5 w-5 animate-bounce text-white/60 md:block" aria-hidden />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
