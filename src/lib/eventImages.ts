import { EVENT_FALLBACK_IMAGES, isMkucuCloudinaryImage } from "@/lib/siteImages";

export function getEventImage(category: string | null, imageUrl: string | null): string {
  if (isMkucuCloudinaryImage(imageUrl)) return imageUrl!;
  if (imageUrl && !imageUrl.includes("unsplash.com")) return imageUrl;
  const key = (category || "general").toLowerCase();
  return EVENT_FALLBACK_IMAGES[key] || EVENT_FALLBACK_IMAGES.general;
}
