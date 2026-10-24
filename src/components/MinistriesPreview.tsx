import { Users, Heart, Music, BookOpen, Globe, HandHeart, ArrowUpRight, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { staticMinistries } from "@/data/staticSiteContent";
import { SectionHeading } from "@/components/SectionHeading";

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  leader_name: string | null;
  meeting_schedule: string | null;
  joining_link: string;
  is_active: boolean | null;
}

const iconMap: { [key: string]: any } = {
  Music: Music,
  BookOpen: BookOpen,
  Globe: Globe,
  HandHeart: HandHeart,
  Heart: Heart,
  Users: Users,
};

export const MinistriesPreview = () => {
  const [ministries, setMinistries] = useState<Ministry[]>(staticMinistries.slice(0, 4) as Ministry[]);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase.from("ministries").select("*").eq("is_active", true).limit(4);
      if (error) throw error;
      setMinistries(data && data.length > 0 ? data : (staticMinistries.slice(0, 4) as Ministry[]));
    } catch (error) {
      console.error("Error fetching ministries:", error);
      setMinistries(staticMinistries.slice(0, 4) as Ministry[]);
    }
  };

  const getIcon = (iconName: string | null) => (iconName && iconMap[iconName] ? iconMap[iconName] : Heart);

  if (ministries.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Ministries"
          title="Find where you fit"
          description="Discover your calling and make a difference through one of our active ministries."
          action={
            <Link
              to="/ministries"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-secondary hover:text-secondary"
            >
              All ministries <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-5 md:grid-cols-2">
          {ministries.map((ministry, index) => {
            const Icon = getIcon(ministry.icon);
            return (
              <article
                key={ministry.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-2xl md:p-9"
              >
                <span className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[9rem] font-semibold leading-none text-foreground/[0.04] transition-colors group-hover:text-secondary/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/30 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="relative font-serif text-2xl font-semibold text-card-foreground md:text-3xl">{ministry.name}</h3>
                <p className="relative mt-3 flex-1 text-base leading-relaxed text-muted-foreground">{ministry.description}</p>
                {(ministry.meeting_schedule || ministry.leader_name) && (
                  <div className="relative mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {ministry.meeting_schedule && <span className="rounded-full border border-border px-3 py-1">{ministry.meeting_schedule}</span>}
                    {ministry.leader_name && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
                        <Users className="h-3 w-3" /> {ministry.leader_name}
                      </span>
                    )}
                  </div>
                )}
                {ministry.joining_link && (
                  <a
                    href={ministry.joining_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-secondary underline-offset-8 hover:underline"
                  >
                    Join this ministry <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
