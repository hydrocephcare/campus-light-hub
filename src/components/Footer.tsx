import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin, Heart, ArrowUpRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { FooterAdminAccess } from "@/components/FooterAdminAccess";
import { COMMUNITY_LINK } from "@/lib/communityLink";


const platformIcons: Record<string, React.ElementType> = { Facebook, Instagram, YouTube: Youtube, Twitter };

const defaultBranding = {
  site_name: "MKU CU CHURCH",
  tagline: "Living the Knowledge of God",
  logo_url: "/lovable-uploads/d7e39077-9fab-48b2-a966-23d29d0ec2ff.png",
  youtube_live_url: "https://www.youtube.com/live/2nKqPUZFPCE",
  whatsapp_community_link: "https://chat.whatsapp.com/I0O4FU8BFMo59CwKnnVB29",
};

const defaultContact = { whatsapp: "https://wa.me/254704021286", phone: "+254 711 201 138", email: "mkucuthika@gmail.com", location: "Mount Kenya University, Thika Campus", map_link: "" };
const defaultSocial = [
  { platform: "Facebook", link: "https://facebook.com/MKUCUTHIKA", handle: "MKU CU THIKA" },
  { platform: "YouTube", link: "https://www.youtube.com/live/2nKqPUZFPCE", handle: "MKU CU" },
  { platform: "Instagram", link: "https://instagram.com/mkucu", handle: "@mkucu" },
  { platform: "Twitter", link: "https://twitter.com/mkucu", handle: "@mkucu" },
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: branding } = useSiteSetting("branding", defaultBranding);
  const { data: contact } = useSiteSetting("contact_info", defaultContact);
  const { data: socialLinks } = useSiteSetting("social_links", defaultSocial);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setIsSubscribing(true);
    try {
      const { error } = await supabase.from("subscribers").insert({ email: email.trim() });
      if (error) {
        if (error.code === "23505") toast.info("You're already subscribed!");
        else throw error;
      } else {
        toast.success("Subscribed successfully!");
        setEmail("");
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { to: "/about", label: "About Us" },
    { to: "/events", label: "Events" },
    { to: "/schedule", label: "Schedule" },
    { to: "/media", label: "Sermons" },
    { to: "/blog", label: "Blog" },
    { to: "/ministries", label: "Ministries" },
    { to: "/elections", label: "Elections" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <footer className="border-t border-border bg-card text-foreground">
      {/* Newsletter Banner */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif font-bold text-xl mb-1">Stay in the loop</h3>
              <p className="text-muted-foreground text-sm">Get weekly devotionals, event updates and more.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground min-w-0 md:min-w-[220px]"
              />
              <Button type="submit" disabled={isSubscribing} variant="secondary" className="gap-2 flex-shrink-0">
                <Send className="w-4 h-4" />
                {isSubscribing ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={branding.logo_url} alt={branding.site_name} className="w-10 h-10 object-contain rounded-full bg-background p-1 ring-1 ring-border" />
              <div>
                <div className="font-serif font-bold text-lg">{branding.site_name}</div>
                <div className="text-xs text-muted-foreground italic">{branding.tagline}</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Nurturing belief in Christ and developing Christ-like character through discipleship, evangelism, and missions.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s: any, i: number) => {
                const SIcon = platformIcons[s.platform] || Facebook;
                return (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-background ring-1 ring-border hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-colors"
                    aria-label={s.platform} title={s.handle}>
                    <SIcon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Navigate</h4>
            <ul className="space-y-2">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Explore</h4>
            <ul className="space-y-2">
              {quickLinks.slice(4).map((link) => (
                <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  Join Community <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Reach Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <a href={`tel:${contact.phone}`} className="hover:text-secondary transition-colors">{contact.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <a href={`mailto:${contact.email}`} className="hover:text-secondary transition-colors break-all">{contact.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>{contact.location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} {branding.site_name}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <p className="flex items-center gap-1 text-secondary/70 italic">
                <Heart className="w-3 h-3" /> {branding.tagline} — John 17:2-3
              </p>
              <FooterAdminAccess />
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
