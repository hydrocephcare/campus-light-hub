import { Target, Heart, Users, BookOpen, Globe, Shield, Star, Award, School, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = { Target, Heart, Users, BookOpen, Globe, Shield, Star, Award, School, Sparkles };

export const VisionMission = () => {
  const { data: vision } = useSiteSetting("vision", { title: "Our Vision", description: "To nurture a Christ-centred student community that knows God, lives out the Gospel and influences the campus and society." });
  const { data: mission } = useSiteSetting("mission", { title: "Our Mission", description: "To build believers through Scripture, prayer, worship, discipleship, fellowship, evangelism and missions." });
  const { data: coreValues } = useSiteSetting("core_values", [
    { title: "Christ-Centred", description: "Jesus Christ remains at the centre of our faith, fellowship and service.", icon: "Heart" },
    { title: "Scripture", description: "We are formed and guided by the Word of God.", icon: "BookOpen" },
    { title: "Prayer", description: "We depend on God through personal and corporate prayer.", icon: "Sparkles" },
    { title: "Fellowship", description: "We grow together as one family in Christ.", icon: "Users" },
    { title: "Discipleship", description: "We intentionally grow believers toward Christ-like character.", icon: "Target" },
    { title: "Mission", description: "We carry the Gospel from campus to the nations.", icon: "Globe" },
  ]);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading eyebrow="Who we are" title="Vision, mission & values" />

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-3xl border border-secondary/30 bg-gradient-to-br from-primary/40 via-card to-card p-8 md:p-12">
            <Target className="mb-6 h-9 w-9 text-primary" />
            <h3 className="font-serif text-2xl font-semibold text-foreground md:text-4xl">{vision.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80 md:text-xl">{vision.description}</p>
          </article>
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12">
            <Heart className="mb-6 h-9 w-9 text-primary" />
            <h3 className="font-serif text-2xl font-semibold text-foreground md:text-4xl">{mission.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-foreground/80 md:text-xl">{mission.description}</p>
          </article>
        </div>

        {coreValues.length > 0 && (
          <div className="mt-14 md:mt-20">
            <h3 className="mb-6 font-serif text-2xl font-semibold text-foreground md:text-3xl">Our core values</h3>
            <ul className="grid overflow-hidden rounded-3xl border border-border bg-card/60 md:grid-cols-2 lg:grid-cols-3">
              {coreValues.map((value: any, index: number) => {
                const ValIcon = iconMap[value.icon] || Star;
                return (
                  <li key={index} className="group flex gap-4 border-b border-border p-6 transition-colors hover:bg-muted/40 md:p-8 lg:border-r">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                      <ValIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <h4 className="font-sans text-lg font-semibold tracking-normal text-foreground">{value.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
