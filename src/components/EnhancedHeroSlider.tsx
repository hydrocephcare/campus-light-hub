import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";

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

const fallbackSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Welcome to MKU Christian Union",
    subtitle: "Living the Knowledge of God",
    verse: '"Now this is eternal life: that they know you, the only true God, and Jesus Christ, whom you have sent."',
    verse_ref: "— John 17:2-3",
    image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
    cta1_text: "Join MKU CU Today",
    cta1_link: "https://wa.me/254115475543?text=Hello%2C%20I%20would%20like%20to%20join%20MKU%20CU",
    cta2_text: "Attend This Sunday",
    cta2_link: "/events",
  },
];

export const EnhancedHeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
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
        if (!error && data && data.length > 0) setSlides(data);
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
  const isExternal = (link: string) => link.startsWith('http');

  // Touch swipe support (mobile)
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
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 md:mb-5 leading-tight drop-shadow-lg">
                {slide.title}
              </h1>
              {slide.subtitle && <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-secondary mb-3 md:mb-5 font-semibold">{slide.subtitle}</p>}
              {slide.verse && <p className="text-sm sm:text-base md:text-lg text-white/90 italic mb-2 max-w-3xl mx-auto leading-relaxed">{slide.verse}</p>}
              {slide.verse_ref && <p className="text-xs sm:text-sm md:text-base text-secondary/80 mb-6 md:mb-8">{slide.verse_ref}</p>}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full max-w-lg mx-auto">
                {slide.cta1_text && slide.cta1_link && (
                  <a href={slide.cta1_link} target={isExternal(slide.cta1_link) ? '_blank' : undefined} rel={isExternal(slide.cta1_link) ? 'noopener noreferrer' : undefined} className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base shadow-lg w-full">
                      {slide.cta1_text} →
                    </Button>
                  </a>
                )}
                {slide.cta2_text && slide.cta2_link && (
                  <a href={slide.cta2_link} target={isExternal(slide.cta2_link) ? '_blank' : undefined} rel={isExternal(slide.cta2_link) ? 'noopener noreferrer' : undefined} className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-foreground font-semibold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base w-full">
                      {slide.cta2_text} →
                    </Button>
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
          <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all z-10" aria-label="Previous slide">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all z-10" aria-label="Next slide">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 md:bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 md:h-3 rounded-full transition-all ${index === currentSlide ? "bg-primary w-8 md:w-10" : "bg-white/50 w-2 md:w-3 hover:bg-white/70"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
