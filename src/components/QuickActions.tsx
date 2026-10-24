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
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {actions.map((action: any, index: number) => {
            const Icon = iconMap[action.icon] || Star;
            return (
              <a
                key={index}
                href={action.link}
                className="group flex flex-col rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-6 flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <h3 className="font-sans text-base font-semibold tracking-normal text-foreground">{action.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
