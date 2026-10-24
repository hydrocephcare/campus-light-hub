import { Users, Calendar, BookOpen, Heart, MessageCircle, MapPin, Star, Globe, Award, School, ArrowUpRight } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = { Users, Calendar, BookOpen, Heart, MessageCircle, MapPin, Star, Globe, Award, School };

const defaultActions = [
  { icon: "Users", title: "Join Us", description: "Become part of MKU CU", link: "/visitors" },
  { icon: "Calendar", title: "Events", description: "View calendar", link: "/events" },
  { icon: "BookOpen", title: "Bible Study", description: "Study groups", link: "/about" },
  { icon: "Heart", title: "Serve", description: "Volunteer today", link: "/volunteer" },
  { icon: "MessageCircle", title: "Prayer", description: "Request prayer", link: "/contact#prayer" },
  { icon: "MapPin", title: "Visit", description: "Find us", link: "/contact" },
];

export const QuickActions = () => {
  const { data: actions } = useSiteSetting("quick_actions", defaultActions);

  return (
    <div className="relative py-12 md:py-16">
      <div className="container relative mx-auto px-4">
        <div className="mb-6 flex flex-col gap-2 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary"><span className="h-px w-8 bg-secondary" />Get involved</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Find your place at MKU CU</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">Worship, study, serve and pray with students across campus.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {actions.map((action: any, index: number) => {
            const Icon = iconMap[action.icon] || Star;
            return (
              <a
                key={index}
                href={action.link}
                className="group relative rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:bg-card hover:shadow-xl"
              >
                <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-sans text-base font-semibold tracking-normal text-foreground">{action.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
