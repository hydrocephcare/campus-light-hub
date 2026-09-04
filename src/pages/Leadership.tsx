import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { usePageHero } from "@/hooks/usePageContent";
import { cn } from "@/lib/utils";

interface Leader {
  id: string;
  name: string;
  position: string;
  image_url: string | null;
  display_order: number | null;
  term: string;
  docket: string | null;
  bio: string | null;
}

const formatTerm = (term: string) => term.replace(/[-/]/g, "–");

const LeaderPortrait = ({ leader, featured = false }: { leader: Leader; featured?: boolean }) => (
  <div className={cn("relative overflow-hidden bg-muted", featured ? "aspect-[4/5]" : "aspect-[4/5]")}>
    {leader.image_url ? (
      <img
        src={leader.image_url}
        alt={`${leader.name}, ${leader.position} of MKU Christian Union`}
        className="h-full w-full object-cover object-[center_18%] transition-transform duration-700 group-hover:scale-[1.04]"
        loading="lazy"
        decoding="async"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Users className="h-12 w-12 text-primary/40" />
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </div>
);

const LeaderCard = ({ leader, featured = false }: { leader: Leader; featured?: boolean }) => (
  <Card
    className={cn(
      "group overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl",
      featured && "ring-1 ring-primary/25",
    )}
  >
    <LeaderPortrait leader={leader} featured={featured} />
    <div className="space-y-1 p-4 text-center md:p-5">
      {featured && (
        <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">
          <Crown className="h-3 w-3" />
          Executive Lead
        </div>
      )}
      <h3
        className={cn(
          "font-serif font-bold uppercase tracking-tight text-foreground",
          featured ? "text-lg md:text-2xl" : "text-base md:text-lg",
        )}
      >
        {leader.name}
      </h3>
      <p className={cn("text-muted-foreground", featured ? "text-sm md:text-base" : "text-xs md:text-sm")}>
        {leader.position}
      </p>
      {leader.bio ? <p className="pt-1 text-xs leading-relaxed text-muted-foreground/90">{leader.bio}</p> : null}
    </div>
  </Card>
);

const Leadership = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const hero = usePageHero("leadership", {
    badge: "MKUCU Leadership",
    title: "Executive Committee",
    subtitle: "Servant leaders entrusted with guiding Mount Kenya University Christian Union.",
  });

  useSEO({
    title: "MKUCU Leadership — Executive Committee 2026–2027",
    description:
      "Meet the Mount Kenya University Christian Union Executive Committee for the Spiritual Year 2026–2027.",
    url: "https://campus-light-hub.lovable.app/leadership",
  });

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("leaders")
        .select("id,name,position,image_url,display_order,term,docket,bio")
        .eq("is_active", true)
        .order("term", { ascending: false })
        .order("display_order", { ascending: true });
      if (error) console.error("Error fetching leaders:", error);
      setLeaders((data as Leader[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const terms = useMemo(() => {
    const unique = [...new Set(leaders.map((l) => l.term))];
    return unique.sort((a, b) => b.localeCompare(a));
  }, [leaders]);

  const currentTerm = activeTerm ?? terms[0] ?? "2026-2027";
  const termLeaders = leaders.filter((l) => l.term === currentTerm);
  const featured = termLeaders.slice(0, 2);
  const rest = termLeaders.slice(2);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/12 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-14 text-center md:py-20">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {hero.badge}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">{hero.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{hero.subtitle}</p>
          <p className="mt-5 inline-block rounded-full border border-primary/30 bg-card px-4 py-1.5 text-sm font-semibold text-primary">
            Spiritual Year {formatTerm(currentTerm)}
          </p>
        </div>
      </section>

      {terms.length > 1 && (
        <div className="border-b border-border/60 bg-card/60 backdrop-blur">
          <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3">
            {terms.map((term) => (
              <Button
                key={term}
                size="sm"
                variant={term === currentTerm ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => setActiveTerm(term)}
              >
                {formatTerm(term)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-10 md:py-16">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : termLeaders.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Leadership for this term will be published soon.</p>
        ) : (
          <div className="space-y-10 md:space-y-14">
            {featured.length > 0 && (
              <AnimatedSection>
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8">
                  {featured.map((leader) => (
                    <LeaderCard key={leader.id} leader={leader} featured />
                  ))}
                </div>
              </AnimatedSection>
            )}

            {rest.length > 0 && (
              <AnimatedSection>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <h2 className="text-center font-serif text-lg font-semibold text-foreground md:text-xl">
                    Executive Committee
                  </h2>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
                  {rest.map((leader) => (
                    <LeaderCard key={leader.id} leader={leader} />
                  ))}
                </div>
              </AnimatedSection>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Leadership;
