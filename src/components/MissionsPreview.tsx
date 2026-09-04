import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { optimizedImageUrl } from "@/lib/imageUrl";
import { Mission, MISSION_FIELDS, missionDateLabel } from "@/lib/missions";
import { ArrowRight, Globe2, MapPin } from "lucide-react";

export const MissionsPreview = () => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("missions")
        .select(MISSION_FIELDS)
        .order("is_featured", { ascending: false })
        .order("start_date", { ascending: false })
        .limit(1);
      const m = (data || [])[0] as Mission | undefined;
      if (!m) return;
      setMission(m);
      const { data: media } = await (supabase as any)
        .from("mission_media")
        .select("media_url,thumbnail_url,media_type")
        .eq("mission_id", m.id)
        .neq("media_type", "video")
        .order("sort_order", { ascending: true })
        .limit(6);
      setPreviews(((media || []) as any[]).map((x) => x.thumbnail_url || x.media_url));
    };
    load().catch((e) => console.error("MissionsPreview", e));
  }, []);

  if (!mission) return null;

  return (
    <section className="bg-card/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge className="mb-4 gap-1.5">
              <Globe2 className="h-3.5 w-3.5" /> Missions
            </Badge>
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-4xl">
              {mission.title}
            </h2>
            {mission.subtitle && (
              <p className="mt-2 text-sm font-medium text-primary md:text-base">{mission.subtitle}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{missionDateLabel(mission)}</span>
              {mission.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {mission.location}
                </span>
              )}
            </div>
            {mission.description && (
              <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {mission.description}
              </p>
            )}
            <Button asChild className="mt-7 rounded-full">
              <Link to={`/missions/${mission.slug}`}>
                View mission gallery <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {previews.map((src, i) => (
              <Link
                key={i}
                to={`/missions/${mission.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={optimizedImageUrl(src, { width: 400, quality: 64 })}
                  alt={`${mission.title} photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
