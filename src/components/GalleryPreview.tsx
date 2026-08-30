import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { staticGalleryItems } from "@/data/staticSiteContent";

interface GalleryItem {
  id: string;
  media_url: string;
  title: string;
}

const fallbackImages = staticGalleryItems.slice(0, 6);

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
    <section className="border-y border-border bg-[#fffaf6] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-primary">
            <Megaphone className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase">Notice board</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Church Announcements</h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">See the full program posters for services, fellowships, missions and special gatherings.</p>
        </div>
      </div>

      {/* Edge-to-edge snap strip: full-bleed tiles, no empty side gutters */}
      <div className="mb-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:gap-3 md:px-6">
        {images.map((img) => (
          <Link
            key={img.id}
            to="/gallery"
            className="group relative w-[82%] flex-shrink-0 snap-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-border sm:w-[48%] lg:w-[31%] xl:w-[24%]"
          >
            <div className="aspect-square w-full p-2">
              <img
                src={optimizedImageUrl(img.media_url, { width: 700, quality: 72 })}
                alt={img.title}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="border-t border-border px-3 py-3">
              <p className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">{img.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="container mx-auto px-4">



        <div className="text-center">
          <Link to="/gallery">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              View announcement archive <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
