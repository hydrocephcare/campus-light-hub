import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Phone, Mail, MapPin, Facebook, Twitter, Youtube, Instagram, ExternalLink, Navigation, Map } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { COMMUNITY_LINK } from "@/lib/communityLink";


const platformIcons: Record<string, React.ElementType> = { Facebook, Twitter, YouTube: Youtube, Instagram };

const defaultContact = { whatsapp: "https://wa.me/254711201138", phone: "0711201138", email: "mkucuthika@gmail.com", location: "MKU Main Campus, Thika", map_link: "https://maps.app.goo.gl/Ci8S9Nhb25FSCrgX8" };
const defaultSocial = [{ platform: "Facebook", link: "https://facebook.com/MKUCUTHIKA", handle: "MKU CU THIKA" }];

export const ConnectWithUs = () => {
  const { data: contact } = useSiteSetting("contact_info", defaultContact);
  const { data: socialLinks } = useSiteSetting("social_links", defaultSocial);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const churchLocation = { lat: -1.0333, lng: 37.0833 };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setIsLoadingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const km = calculateDistance(pos.coords.latitude, pos.coords.longitude, churchLocation.lat, churchLocation.lng);
        setDistance(km < 1 ? `${Math.round(km * 1000)} meters away` : `${km.toFixed(1)} km away`);
        setIsLoadingLocation(false);
      },
      () => { setLocationError("Location access denied"); setIsLoadingLocation(false); }
    );
  };

  const contactMethods = [
    { icon: MessageCircle, title: "WhatsApp", description: "Join our community group", action: "Join Group", link: COMMUNITY_LINK, color: "bg-green-500/10 text-green-600 dark:text-green-400", type: "external" },
    { icon: Phone, title: "Call Us", description: contact.phone, action: "Call", link: `tel:+254${contact.phone.replace(/^0/, "")}`, color: "bg-primary/10 text-primary", type: "external" },
    { icon: Mail, title: "Email", description: contact.email, action: "Send Email", link: `mailto:${contact.email}`, color: "bg-secondary/10 text-secondary", type: "external" },
    { icon: MapPin, title: "Location", description: contact.location, action: "Get Directions", link: contact.map_link, color: "bg-accent/10 text-accent", type: "location" },
  ];

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"><MessageCircle className="w-4 h-4" />Get In Touch</div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Connect With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We'd love to hear from you. Reach out through any of these channels.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <Card key={index} className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-full ${method.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><method.icon className="w-7 h-7" /></div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                  <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => method.type === "location" ? (setShowLocationModal(true), getUserLocation()) : window.open(method.link, "_blank")}>
                    {method.action}<ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Follow us on social media</p>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social: any, index: number) => {
                const SIcon = platformIcons[social.platform] || MessageCircle;
                return (
                  <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-md transition-all" aria-label={social.platform} title={social.handle}>
                    <SIcon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><MapPin className="w-5 h-5 text-primary" />Our Location</DialogTitle>
            <DialogDescription>Mount Kenya University Christian Union - Main Campus, Thika</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {userLocation && distance && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div><p className="font-medium text-sm text-foreground mb-1">Your Location Detected</p><p className="text-lg font-bold text-green-600 dark:text-green-400">{distance}</p></div>
                </div>
              </div>
            )}
            {locationError && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-muted-foreground">{locationError}</div>}
            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border border-border">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0234567890123!2d37.0833!3d-1.0333" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="MKU CU Location" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => window.open(contact.map_link, "_blank")}><Map className="w-4 h-4 mr-2" />Open in Maps</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => window.open(userLocation ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${churchLocation.lat},${churchLocation.lng}` : contact.map_link, "_blank")}><Navigation className="w-4 h-4 mr-2" />Get Directions</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
