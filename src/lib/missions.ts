export interface Mission {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  location: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
  youtube_playlist_url: string | null;
  highlights: string[] | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
}

export interface MissionMedia {
  id: string;
  mission_id: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

export const MISSION_FIELDS =
  "id,title,slug,subtitle,location,description,start_date,end_date,cover_image,youtube_playlist_url,highlights,status,is_featured,sort_order";

export function missionDateLabel(mission: Pick<Mission, "start_date" | "end_date">): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  if (mission.start_date && mission.end_date && mission.start_date !== mission.end_date) {
    return `${fmt(mission.start_date)} – ${fmt(mission.end_date)}`;
  }
  if (mission.start_date) return fmt(mission.start_date);
  return "";
}

/** Google Drive video links render inside an iframe; YouTube links get embedded too. */
export function videoEmbedUrl(url: string): string {
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export const isDirectVideoFile = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);
