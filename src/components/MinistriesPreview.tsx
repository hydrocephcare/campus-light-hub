import { Users, Heart, Music, BookOpen, Globe, HandHeart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

const defaultMinistries = [
  {
    icon: Music,
    name: "Praise & Worship",
    description: "Join our talented worship team in leading the congregation",
    members: "45+ members",
  },
  {
    icon: BookOpen,
    name: "Sunday School",
    description: "Teach and nurture children in the ways of the Lord",
    members: "30+ teachers",
  },
  {
    icon: Globe,
    name: "Missions",
    description: "Reach the unreached with the Gospel message",
    members: "25+ missionaries",
  },
  {
    icon: HandHeart,
    name: "Outreach",
    description: "Serve our community through practical acts of love",
    members: "50+ volunteers",
  },
];

export const MinistriesPreview = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .eq("is_active", true)
        .limit(4);

      if (error) throw error;
      setMinistries(data || []);
    } catch (error) {
      console.error("Error fetching ministries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    return Heart;
  };

  // Show default ministries if none from database
  const displayMinistries = ministries.length > 0 ? ministries : null;

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading ministries...</div>
        </div>
      </section>
    );
  }

  if (!displayMinistries) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
              Get Involved in Ministry
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your calling and make a difference through one of our active ministries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {defaultMinistries.map((ministry, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 group border-border bg-card"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <ministry.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-card-foreground">{ministry.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{ministry.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{ministry.members}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/ministries">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore All Ministries
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Get Involved in Ministry
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your calling and make a difference through one of our active ministries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {displayMinistries.map((ministry) => {
            const IconComponent = getIcon(ministry.icon);
            return (
              <Card
                key={ministry.id}
                className="p-6 hover:shadow-lg transition-all duration-300 group border-border bg-card"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-card-foreground">{ministry.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{ministry.description}</p>
                {ministry.meeting_schedule && (
                  <p className="text-xs text-muted-foreground mb-2">{ministry.meeting_schedule}</p>
                )}
                {ministry.leader_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Led by {ministry.leader_name}</span>
                  </div>
                )}
                <a
                  href={ministry.joining_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4"
                >
                  <Button size="sm" variant="outline" className="w-full">
                    Join Ministry
                  </Button>
                </a>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/ministries">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Explore All Ministries
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};