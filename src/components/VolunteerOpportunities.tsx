import { Heart, Music, Camera, Users, BookOpen, Laptop } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  time_commitment: string | null;
  contact_link: string;
  is_active: boolean | null;
}

const defaultOpportunities = [
  {
    title: "Worship Team",
    icon: Music,
    description: "Join our worship team as a vocalist or instrumentalist",
    commitment: "Sundays + Practice",
    spots: "3 positions",
    skills: ["Singing", "Instruments", "Sound"],
    urgent: true,
  },
  {
    title: "Media & Tech Team",
    icon: Camera,
    description: "Help with livestreaming, photography, and video editing",
    commitment: "Flexible",
    spots: "5 positions",
    skills: ["Photography", "Video Editing", "Graphics"],
    urgent: false,
  },
  {
    title: "Ushering Team",
    icon: Users,
    description: "Welcome guests and help them feel at home during services",
    commitment: "Once per month",
    spots: "10 positions",
    skills: ["Hospitality", "Communication"],
    urgent: false,
  },
  {
    title: "Bible Study Leaders",
    icon: BookOpen,
    description: "Facilitate small group Bible studies and discipleship",
    commitment: "Weekly",
    spots: "4 positions",
    skills: ["Teaching", "Leadership", "Bible Knowledge"],
    urgent: true,
  },
  {
    title: "Social Media Team",
    icon: Laptop,
    description: "Manage our online presence and engage with the community",
    commitment: "5 hrs/week",
    spots: "2 positions",
    skills: ["Social Media", "Content Creation", "Design"],
    urgent: false,
  },
  {
    title: "Outreach Team",
    icon: Heart,
    description: "Reach out to campus with the gospel through events and visitation",
    commitment: "Bi-weekly",
    spots: "8 positions",
    skills: ["Evangelism", "Event Planning", "Communication"],
    urgent: false,
  },
];

export const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteer_opportunities")
        .select("*")
        .eq("is_active", true)
        .limit(6);

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching volunteer opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading opportunities...</div>
        </div>
      </section>
    );
  }

  // Show database opportunities if available, otherwise show defaults
  const displayOpportunities = opportunities.length > 0 ? opportunities : null;

  if (!displayOpportunities) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-semibold">Serve With Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-foreground">
              Volunteer Opportunities
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your gifts and talents to serve God and build His kingdom on campus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {defaultOpportunities.map((opportunity, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-card"
              >
                {opportunity.urgent && (
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                    Urgent
                  </Badge>
                )}
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <opportunity.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-card-foreground">{opportunity.title}</h3>
                    <p className="text-sm text-accent font-semibold">{opportunity.spots} available</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commitment:</span>
                    <span className="font-semibold text-card-foreground">{opportunity.commitment}</span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Skills needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/254115475543?text=I%20want%20to%20volunteer%20for%20${encodeURIComponent(opportunity.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </a>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/volunteer">
              <Button size="lg" variant="outline">
                View All Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-semibold">Serve With Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-foreground">
            Volunteer Opportunities
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Use your gifts and talents to serve God and build His kingdom on campus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayOpportunities.map((opportunity) => (
            <Card
              key={opportunity.id}
              className="p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-card"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 text-card-foreground">{opportunity.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>

              <div className="space-y-3 mb-4">
                {opportunity.time_commitment && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commitment:</span>
                    <span className="font-semibold text-card-foreground">{opportunity.time_commitment}</span>
                  </div>
                )}
                
                {opportunity.requirements && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Requirements:</p>
                    <p className="text-sm text-card-foreground">{opportunity.requirements}</p>
                  </div>
                )}
              </div>

              <a
                href={opportunity.contact_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">
                  Apply Now
                </Button>
              </a>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/volunteer">
            <Button size="lg" variant="outline">
              View All Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};