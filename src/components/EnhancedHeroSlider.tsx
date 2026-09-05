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

  return (
    <div
      className="relative h-[85vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] min-h-[500px] max-h-[900px] w-full overflow-hidden touch-pan-y select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={optimizedImageUrl(slide.image_url, { width: index === currentSlide ? 1600 : 900, quality: 72 })}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/40" />

          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 md:mb-5 leading-tight drop-shadow-lg">{slide.title}</h1>
              {slide.subtitle && <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-secondary mb-3 md:mb-5 font-semibold">{slide.subtitle}</p>}
              {slide.verse && <p className="text-sm sm:text-base md:text-lg text-white/90 italic mb-2 max-w-3xl mx-auto leading-relaxed">{slide.verse}</p>}
              {slide.verse_ref && <p className="text-xs sm:text-sm md:text-base text-secondary/80 mb-6 md:mb-8">{slide.verse_ref}</p>}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full max-w-lg mx-auto">
                {slide.cta1_text && slide.cta1_link && (
                  <a href={slide.cta1_link} target={isExternal(slide.cta1_link) ? "_blank" : undefined} rel={isExternal(slide.cta1_link) ? "noopener noreferrer" : undefined} className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base shadow-lg w-full">{slide.cta1_text} →</Button>
                  </a>
                )}
                {slide.cta2_text && slide.cta2_link && (
                  <a href={slide.cta2_link} target={isExternal(slide.cta2_link) ? "_blank" : undefined} rel={isExternal(slide.cta2_link) ? "noopener noreferrer" : undefined} className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-foreground font-semibold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base w-full">{slide.cta2_text} →</Button>
                  </a>
                )}
              </div>

              {index === currentSlide && (
                <div className="mt-8 hidden animate-bounce flex-col items-center md:flex">
                  <p className="mb-1 text-xs text-white/70 drop-shadow-lg">Scroll to explore</p>
                  <ChevronDown className="h-6 w-6 text-white/70 drop-shadow-lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all z-10" aria-label="Previous slide"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all z-10" aria-label="Next slide"><ChevronRight className="w-6 h-6 text-white" /></button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-10">
          {slides.map((_, index) => (
            <button key={index} onClick={() => goToSlide(index)} className={`h-2 md:h-3 rounded-full transition-all ${index === currentSlide ? "bg-primary w-8 md:w-10" : "bg-white/50 w-2 md:w-3 hover:bg-white/70"}`} aria-label={`Go to slide ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};
