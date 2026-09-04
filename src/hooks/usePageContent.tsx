import { useSiteSetting } from "@/hooks/useSiteSettings";

export interface PageHero {
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
}

export type PageContentMap = Record<string, PageHero>;

/** Page keys that can be edited from Admin → Site Settings → Pages. */
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
  { key: "schedule", label: "Schedule" },
  { key: "volunteer", label: "Volunteer" },
  { key: "visitors", label: "Visitors" },
  { key: "contact", label: "Contact" },
] as const;

/**
 * Returns the admin-editable hero copy/image for a page, falling back to the
 * hard-coded defaults passed by the page itself.
 */
export function usePageHero(page: string, defaults: PageHero): PageHero {
  const { data } = useSiteSetting<PageContentMap>("page_content", {});
  const stored = (data && data[page]) || {};
  return {
    badge: stored.badge?.trim() || defaults.badge,
    title: stored.title?.trim() || defaults.title,
    subtitle: stored.subtitle?.trim() || defaults.subtitle,
    image: stored.image?.trim() || defaults.image,
  };
}
