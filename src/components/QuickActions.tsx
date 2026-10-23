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
    <section className="relative bg-forest py-10 md:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.35),transparent_70%)] pointer-events-none" />
      <div className="container relative mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6 md:mb-8 max-w-6xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold mb-2">Get involved</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground">Find your place at MKU CU</h2>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-sm">Worship, study, serve and pray with students across campus.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
          {actions.map((action: any, index: number) => {
            const Icon = iconMap[action.icon] || Star;
            return (
              <a
                key={index}
                href={action.link}
                className="group relative rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 md:p-5 backdrop-blur-sm transition-all duration-300 hover:bg-primary-foreground/10 hover:border-secondary/50 hover:-translate-y-0.5"
              >
                <ArrowUpRight className="absolute right-3 top-3 w-4 h-4 text-primary-foreground/30 group-hover:text-secondary transition-colors" />
                <div className="w-10 h-10 rounded-lg bg-primary/40 text-secondary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm md:text-base text-primary-foreground">{action.title}</h3>
                <p className="text-xs text-primary-foreground/60 mt-0.5">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
