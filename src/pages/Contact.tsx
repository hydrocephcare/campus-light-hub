import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter, Send, MessageCircle, Navigation, Map } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const Contact = () => {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with MKU Christian Union. Call, WhatsApp, email, or visit us at Mount Kenya University, Thika.",
    image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/contact",
  });

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
  };

  const churchLocation = { lat: -1.0333, lng: 37.0833 };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[45vh] md:min-h-[55vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920&q=60"
              alt="Get in touch"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              We'd love to hear from you. Reach out anytime!
            </p>
          </div>
        </section>

        {/* Quick contact cards */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <a href="https://wa.me/254704021286" target="_blank" rel="noopener noreferrer" className="block">
                <Card className="p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">WhatsApp</h3>
                  <p className="text-xs text-muted-foreground">Quick replies</p>
                </Card>
              </a>
              <a href="tel:+254711201138" className="block">
                <Card className="p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Call Us</h3>
                  <p className="text-xs text-muted-foreground">+254 711 201 138</p>
                </Card>
              </a>
              <a href="mailto:mkucuthika@gmail.com" className="block">
                <Card className="p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <p className="text-xs text-muted-foreground">mkucuthika@gmail.com</p>
                </Card>
              </a>
              <a href="https://maps.app.goo.gl/Ci8S9Nhb25FSCrgX8" target="_blank" rel="noopener noreferrer" className="block">
                <Card className="p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <p className="text-xs text-muted-foreground">MKU Thika</p>
                </Card>
              </a>
            </div>
          </div>
        </section>

        {/* Form + Map/Info */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
              {/* Contact Form */}
              <Card className="lg:col-span-3 p-5 md:p-8 bg-card">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 text-foreground">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">First Name</label>
                      <Input placeholder="John" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">Last Name</label>
                      <Input placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Email</label>
                    <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Phone</label>
                    <Input type="tel" placeholder="+254 700 000000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Subject</label>
                    <Input placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-foreground">Message</label>
                    <Textarea placeholder="Tell us more..." rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </Button>
                </form>
              </Card>

              {/* Right Column - Info + Map */}
              <div className="lg:col-span-2 space-y-5">
                {/* Contact Details */}
                <Card className="p-5 md:p-6 bg-card">
                  <h3 className="text-xl font-serif font-bold mb-4 text-foreground">Contact Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Phone / WhatsApp</h4>
                        <p className="text-sm text-muted-foreground">+254 704 021 286</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Email</h4>
                        <p className="text-sm text-muted-foreground">mkucuthika@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">Service Times</h4>
                        <p className="text-sm text-muted-foreground">Sunday: 7:00 AM – 12:45 PM</p>
                        <p className="text-sm text-muted-foreground">Wednesday: 5:00 PM – 7:00 PM</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Map */}
                <Card className="p-5 md:p-6 bg-card">
                  <h3 className="text-xl font-serif font-bold mb-4 text-foreground">Find Us</h3>
                  <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden border border-border mb-4">
                    <iframe
                      src={`https://maps.google.com/maps?q=${churchLocation.lat},${churchLocation.lng}&z=16&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="MKU CU Location"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                      <a href="https://maps.app.goo.gl/Ci8S9Nhb25FSCrgX8" target="_blank" rel="noopener noreferrer">
                        <Map className="w-4 h-4" /> Open Maps
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 gap-2" asChild>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${churchLocation.lat},${churchLocation.lng}`} target="_blank" rel="noopener noreferrer">
                        <Navigation className="w-4 h-4" /> Directions
                      </a>
                    </Button>
                  </div>
                </Card>

                {/* Social */}
                <Card className="p-5 md:p-6 bg-card">
                  <h3 className="text-xl font-serif font-bold mb-4 text-foreground">Follow Us</h3>
                  <div className="flex gap-3">
                    {[
                      { icon: Facebook, href: "#", label: "Facebook" },
                      { icon: Instagram, href: "#", label: "Instagram" },
                      { icon: Youtube, href: "https://www.youtube.com/@mkucuofficial", label: "YouTube" },
                      { icon: Twitter, href: "#", label: "Twitter" },
                    ].map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                        <s.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Visit Us This Sunday</h2>
            <p className="text-background/70 mb-6 max-w-xl mx-auto">
              Experience the warmth of our community. We can't wait to meet you!
            </p>
            <Link to="/visitors">
              <Button size="lg" variant="secondary" className="font-semibold">Plan Your Visit</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;