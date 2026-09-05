import { useSiteSetting } from "@/hooks/useSiteSettings";
import { PAGE_HERO_IMAGES, isMkucuCloudinaryImage } from "@/lib/siteImages";

export interface PageHero {
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
}

export type PageContentMap = Record<string, PageHero>;

export const PAGE_KEYS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "leadership", label: "Leadership" },
  { key: "events", label: "Events" },
  { key: "media", label: "Media / Sermons" },
  { key: "blog", label: "Faith Stories" },
  { key: "gallery", label: "Notice Board" },
  { key: "photos", label: "Photos" },
  { key: "ministries", label: "Ministries" },
  { key: "missions", label: "Missions" },
  { key: "schedule", label: "Schedule" },
  { key: "volunteer", label: "Volunteer" },
  { key: "visitors", label: "Visitors" },
  { key: "contact", label: "Contact" },
] as const;

/**
 * Uses the admin copy while ensuring public page heroes feature MKUCU's own
 * Cloudinary photographs instead of stock photography. Admin-provided MKUCU
 * Cloudinary images remain respected.
 */
export function usePageHero(page: string, defaults: PageHero): PageHero {
  const { data } = useSiteSetting<PageContentMap>("page_content", {});
  const stored = (data && data[page]) || {};
  const curatedImage = PAGE_HERO_IMAGES[page];
  const storedImage = stored.image?.trim();

  return {
    badge: stored.badge?.trim() || defaults.badge,
    title: stored.title?.trim() || defaults.title,
    subtitle: stored.subtitle?.trim() || defaults.subtitle,
    image: isMkucuCloudinaryImage(storedImage)
      ? storedImage
      : curatedImage || (isMkucuCloudinaryImage(defaults.image) ? defaults.image : PAGE_HERO_IMAGES.home),
  };
}
