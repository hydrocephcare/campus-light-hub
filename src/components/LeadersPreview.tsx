import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollRow } from "@/components/ScrollRow";

interface Leader {
  id: string;
  name: string;
  position: string;
  image_url: string | null;
  term?: string;
}

export const LeadersPreview = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        // Only the current spiritual year's executive committee belongs on the homepage.
        const { data: current } = await supabase
          .from('leadership_terms')
          .select('term')
          .eq('is_current', true)
          .maybeSingle();

        let query = supabase
          .from('leaders')
          .select('id, name, position, image_url, term')
          .eq('is_active', true);
        if (current?.term) query = query.eq('term', current.term);

        const { data, error } = await query
          .order('term', { ascending: false })
          .order('display_order', { ascending: true })
          .limit(4);
        if (error) throw error;
        setLeaders(data || []);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      }
    };
    fetchLeaders();
  }, []);

  const previewLeaders = leaders.length > 0 ? leaders : [
    { id: "chair", name: "2026/27 Leadership", position: "Chairperson", image_url: null },
    { id: "vice-chair", name: "2026/27 Leadership", position: "Vice Chairperson", image_url: null },
    { id: "secretary", name: "2026/27 Leadership", position: "Secretary", image_url: null },
    { id: "treasurer", name: "2026/27 Leadership", position: "Treasurer", image_url: null },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Leadership"
          title="Meet our leaders"
          description="The servants walking with you this spiritual year."
          action={
            <Link
              to="/leadership"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-secondary hover:text-secondary"
            >
              View all leaders <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <ScrollRow>
          {previewLeaders.map((leader) => (
            <article key={leader.id} className="group w-[62%] shrink-0 snap-start sm:w-64">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted ring-1 ring-border/60">
                {leader.image_url ? (
                  <img
                    src={leader.image_url}
                    alt={leader.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                    <Users className="h-12 w-12 text-secondary/60" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 md:p-5 md:pt-20">
                  <h3 className="line-clamp-1 font-serif text-base font-semibold text-white md:text-xl">{leader.name}</h3>
                  <p className="line-clamp-1 text-xs font-medium uppercase tracking-wider text-secondary md:text-sm">{leader.position}</p>
                </div>
              </div>
            </article>
          ))}
        </ScrollRow>
      </div>
    </section>
  );
};
