export type MediaKind = "poster" | "photo";

const POSTER_HINTS = ["poster", "announcement", "notice", "program", "programme", "flyer"];

export interface MediaKindInput {
  media_kind?: string | null;
  category?: string | null;
}

/**
 * Announcement posters (notice board) and ordinary photos (photo gallery) are two
 * different things. Items store the choice in `media_kind`; older rows fall back
 * to a category hint and default to "photo".
 */
export function resolveMediaKind(item: MediaKindInput): MediaKind {
  if (item.media_kind === "poster" || item.media_kind === "photo") return item.media_kind;
  const category = (item.category || "").toLowerCase();
  return POSTER_HINTS.some((hint) => category.includes(hint)) ? "poster" : "photo";
}

export const isPoster = (item: MediaKindInput) => resolveMediaKind(item) === "poster";
export const isPhoto = (item: MediaKindInput) => resolveMediaKind(item) === "photo";
