export const WHATSAPP_LINK = "https://wa.me/254115475543?text=Hello%20MKU%20CU%2C%20I%20would%20like%20to%20connect%20with%20the%20Christian%20Union.";

// Curated wide MKUCU group photographs selected from the migrated Cloudinary library.
// These are intentionally community-focused rather than stock photography.
export const COMMUNITY_IMAGES = [
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629378/mkucu/gallery/16eb7160-5d94-455f-937a-cdabf50be366_thjrzv.webp",
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629311/mkucu/gallery/1b5925bf-3d35-454d-8b10-ba5437f6e40e_ba6mjp.webp",
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629030/mkucu/gallery/043fe957-4250-40b2-b3a7-9522fd16da57_uhw6ip.webp",
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629092/mkucu/gallery/0297fc09-5334-412c-a495-0528c42c873d_cre02u.webp",
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629192/mkucu/gallery/060220b7-8f21-4ccb-9284-4ec990cad671_nklsrj.webp",
  "https://res.cloudinary.com/l4wbzpfr/image/upload/v1788629361/mkucu/gallery/0c129c40-0749-4138-be09-438b8a197a27_fmzkuj.webp",
] as const;

export const PAGE_HERO_IMAGES: Record<string, string> = {
  home: COMMUNITY_IMAGES[0],
  about: COMMUNITY_IMAGES[1],
  leadership: COMMUNITY_IMAGES[2],
  events: COMMUNITY_IMAGES[3],
  media: COMMUNITY_IMAGES[4],
  blog: COMMUNITY_IMAGES[5],
  gallery: COMMUNITY_IMAGES[0],
  photos: COMMUNITY_IMAGES[1],
  ministries: COMMUNITY_IMAGES[2],
  missions: COMMUNITY_IMAGES[3],
  schedule: COMMUNITY_IMAGES[4],
  volunteer: COMMUNITY_IMAGES[5],
  visitors: COMMUNITY_IMAGES[0],
  contact: COMMUNITY_IMAGES[1],
  elections: COMMUNITY_IMAGES[2],
};

export const EVENT_FALLBACK_IMAGES: Record<string, string> = {
  prayer: COMMUNITY_IMAGES[4],
  worship: COMMUNITY_IMAGES[0],
  fellowship: COMMUNITY_IMAGES[1],
  mission: COMMUNITY_IMAGES[3],
  conference: COMMUNITY_IMAGES[2],
  social: COMMUNITY_IMAGES[5],
  service: COMMUNITY_IMAGES[0],
  study: COMMUNITY_IMAGES[1],
  retreat: COMMUNITY_IMAGES[4],
  orientation: COMMUNITY_IMAGES[2],
  sacrament: COMMUNITY_IMAGES[0],
  training: COMMUNITY_IMAGES[1],
  creative: COMMUNITY_IMAGES[5],
  general: COMMUNITY_IMAGES[3],
};

export const isMkucuCloudinaryImage = (url?: string | null) =>
  Boolean(url && url.includes("res.cloudinary.com/l4wbzpfr/") && url.includes("/mkucu/"));
