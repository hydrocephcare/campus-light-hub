import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";

interface GalleryItem {
  id: string;
  media_url: string;
  title: string;
}

const fallbackImages = [
  { id: "1", media_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80", title: "Sunday Worship" },
  { id: "2", media_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80", title: "Praise Night" },
  { id: "3", media_url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80", title: "Campus Outreach" },
  { id: "4", media_url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80", title: "Bible Study" },
];

export const GalleryPreview = () => {
  const [images, setImages] = useState<GalleryItem[]>(fallbackImages);


  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("media_gallery").select("id, media_url, title").order("created_at", { ascending: false }).limit(6);
      if (data && data.length > 0) setImages(data);
    };
    fetchGallery();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-full mb-4">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-semibold">Photo Gallery</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Moments of Faith</h2>
        </div>
      </div>

      {/* Edge-to-edge snap strip: full-bleed tiles, no empty side gutters */}
      <div className="mb-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:gap-3 md:px-6">
        {images.map((img) => (
          <Link
            key={img.id}
            to="/gallery"
            className="group relative w-[72%] flex-shrink-0 snap-center overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border/50 sm:w-[46%] lg:w-[31%] xl:w-[24%]"
          >
            <div className="aspect-[3/4] w-full sm:aspect-[4/5]">
              <img
                src={optimizedImageUrl(img.media_url, { width: 700, quality: 72 })}
                alt={img.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3 pt-10">
              <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{img.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="container mx-auto px-4">



        <div className="text-center">
          <Link to="/gallery">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              View Full Gallery <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
