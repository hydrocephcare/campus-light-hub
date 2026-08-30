import { Card } from "@/components/ui/card";
import { Users, Calendar, BookOpen, Heart, MessageCircle, MapPin, Star, Globe, Award, School } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = { Users, Calendar, BookOpen, Heart, MessageCircle, MapPin, Star, Globe, Award, School };
const colorMap: Record<string, string> = {
  "bg-crimson": "bg-accent text-accent-foreground",
  "bg-gold": "bg-secondary text-secondary-foreground",
  "bg-navy": "bg-primary text-primary-foreground",
};

const defaultActions = [
  { icon: "Users", title: "Join Us", description: "Become a member", color: "bg-crimson", link: "/contact" },
  { icon: "Calendar", title: "Events", description: "View calendar", color: "bg-navy", link: "/events" },
  { icon: "BookOpen", title: "Bible Study", description: "Study groups", color: "bg-gold", link: "/about" },
  { icon: "Heart", title: "Serve", description: "Volunteer today", color: "bg-crimson", link: "/contact" },
  { icon: "MessageCircle", title: "Prayer", description: "Request prayer", color: "bg-navy", link: "/contact" },
  { icon: "MapPin", title: "Visit", description: "Find us", color: "bg-gold", link: "/contact" },
];

export const QuickActions = () => {
  const { data: actions } = useSiteSetting("quick_actions", defaultActions);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-3">Get Involved Today</h2>
          <p className="text-base md:text-lg text-muted-foreground">Choose how you'd like to connect with our community</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
          {actions.map((action: any, index: number) => {
            const Icon = iconMap[action.icon] || Star;
            const iconClass = colorMap[action.color] || "bg-primary text-primary-foreground";
            return (
              <a key={index} href={action.link} className="block group">
                <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${iconClass} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1">{action.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{action.description}</p>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
