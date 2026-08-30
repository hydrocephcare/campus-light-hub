import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Testimony {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
}

export const TestimonialsSlider = () => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, featured_image")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTestimonies(data || []);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || testimonies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonies.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonies.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonies.length) % testimonies.length);
    setIsAutoPlaying(false);
  };

  const getVisibleTestimonies = () => {
    if (testimonies.length === 0) return [];
    const visible = [];
    for (let i = 0; i < Math.min(3, testimonies.length); i++) {
      visible.push(testimonies[(currentIndex + i) % testimonies.length]);
    }
    return visible;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </section>
    );
  }

  if (testimonies.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-foreground">
              Recent Testimonies
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Hear how God is moving at MKU CU
            </p>
          </div>

          {/* Desktop View - 3 Cards */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4 mb-6">
            {getVisibleTestimonies().map((testimony, index) => (
              <Card 
                key={`${testimony.id}-${index}`}
                className="p-4 bg-card hover:shadow-lg transition-all duration-300 flex flex-col border-border"
              >
                <Quote className="w-8 h-8 text-primary/60 mb-3" />
                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3 italic">
                  "{testimony.excerpt || testimony.title}"
                </p>
                <h3 className="font-bold text-foreground text-sm mb-3 line-clamp-2">
                  {testimony.title}
                </h3>
                <Link to={`/blog/${testimony.slug}`}>
                  <Button variant="link" className="p-0 text-primary text-sm h-auto">
                    Read Full Story →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Mobile/Tablet View - 1 Card */}
          <div className="lg:hidden mb-6">
            <Card className="p-4 bg-card shadow-lg flex flex-col border-border">
              <Quote className="w-8 h-8 text-primary/60 mb-3" />
              <p className="text-sm text-muted-foreground mb-4 italic">
                "{testimonies[currentIndex]?.excerpt || testimonies[currentIndex]?.title}"
              </p>
              <h3 className="font-bold text-foreground text-sm mb-3">
                {testimonies[currentIndex]?.title}
              </h3>
              <Link to={`/blog/${testimonies[currentIndex]?.slug}`}>
                <Button variant="link" className="p-0 text-primary text-sm h-auto">
                  Read Full Story →
                </Button>
              </Link>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Dot Indicators */}
            <div className="flex gap-1.5">
              {testimonies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
