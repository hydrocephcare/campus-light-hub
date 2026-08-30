import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Youtube, Users, ChevronDown } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Welcome to MKU Christian Union",
    subtitle: "Living the Knowledge of God",
    verse: "John 17:2-3",
    cta1: "Join MKU CU",
    cta2: "Attend This Sunday",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 2,
    title: "Join Us Every Sunday",
    subtitle: "7:00 AM - 12:45 PM | Auditorium (MKCC)",
    cta1: "This Week's Theme",
    cta2: "Add to Calendar",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 3,
    title: "Never Miss a Message",
    subtitle: "Watch sermons, testimonies & more on YouTube",
    cta1: "Visit Our Channel",
    cta2: "Watch Latest Sermon",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 4,
    title: "Become Part of Our Family",
    subtitle: "Join 500+ students growing in faith",
    cta1: "Join WhatsApp Community",
    cta2: "Register Now",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1920&q=80",
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? "scale(1.05)" : "scale(1)",
              transition: "transform 5s ease-out",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy-light/70" />
          
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-gold-light mb-2">
                {slide.subtitle}
              </p>
              {slide.verse && (
                <p className="text-lg text-white/80 italic mb-8">{slide.verse}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold px-8 py-6 text-lg shadow-glow">
                  {slide.cta1}
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-navy font-semibold px-8 py-6 text-lg">
                  {slide.cta2}
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>
        </div>
      ))}

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-gold w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
